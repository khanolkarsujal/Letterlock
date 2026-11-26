import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  ReactNode,
} from "react";
import {
  detectSensitiveValues,
  type DetectionResult,
  type OnDeviceStatus,
} from "../../detection";
import { Entity, defaultEntities, defaultStory } from "./mockData";
import {
  buildMapAndEntities,
  entitiesFromRedactionMap,
} from "./detectionPresentation";
import type { ApprovedOutboundText, PlaceholderKind } from "../../redaction";
import { extractPlaceholders, RedactionError, RedactionMap } from "../../redaction";
import {
  draftLetterInCloud,
  prewarmCloudDrafting,
  type CloudDraftResult,
} from "../../inference/cloudDrafting";
import { classifyDisputeType } from "../../prompts";

// Shape of the context – matches the prototype exactly
export interface AppState {
  story: string;
  setStory: React.Dispatch<React.SetStateAction<string>>;
  disputeType: string;
  setDisputeType: React.Dispatch<React.SetStateAction<string>>;
  entities: Entity[];
  setEntities: React.Dispatch<React.SetStateAction<Entity[]>>;
  removeEntity: (id: number) => void;
  addEntity: (text: string, category: string, type: string) => boolean;
  toastMessage: string;
  triggerToast: (msg: string) => void;
  showWipeModal: boolean;
  setShowWipeModal: React.Dispatch<React.SetStateAction<boolean>>;
  resetAll: () => void;
  detection: DetectionResult | null;
  detectionStatus: OnDeviceStatus;
  detectionProgress: number | undefined;
  detectionError: string | null;
  isDetecting: boolean;
  redactionMap: RedactionMap;
  redactedStory: ApprovedOutboundText | null;
  approvedStory: ApprovedOutboundText | null;
  approveStory: () => { ok: boolean; error: string | null };
  draftStatus: "idle" | "drafting" | "success" | "error";
  draftError: string | null;
  draftResult: CloudDraftResult | null;
  finalLetter: string | null;
  startCloudDraft: () => Promise<boolean>;
  cancelCloudDraft: () => void;
  detectStory: (text: string) => Promise<boolean>;
}

const AppContext = createContext<AppState | null>(null);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [story, setStory] = useState<string>(defaultStory);
  const [disputeType, setDisputeType] = useState<string>("deposit");
  const [entities, setEntities] = useState<Entity[]>(defaultEntities);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [showWipeModal, setShowWipeModal] = useState<boolean>(false);
  const [detection, setDetection] = useState<DetectionResult | null>(null);
  const [detectionStatus, setDetectionStatus] =
    useState<OnDeviceStatus>("preparing");
  const [detectionProgress, setDetectionProgress] = useState<number>();
  const [detectionError, setDetectionError] = useState<string | null>(null);
  const [isDetecting, setIsDetecting] = useState<boolean>(false);
  const [redactionMap, setRedactionMap] = useState<RedactionMap>(
    () => new RedactionMap(),
  );
  const [redactedStory, setRedactedStory] =
    useState<ApprovedOutboundText | null>(null);
  const [approvedStory, setApprovedStory] =
    useState<ApprovedOutboundText | null>(null);
  const [draftStatus, setDraftStatus] =
    useState<"idle" | "drafting" | "success" | "error">("idle");
  const [draftError, setDraftError] = useState<string | null>(null);
  const [draftResult, setDraftResult] = useState<CloudDraftResult | null>(null);
  const [finalLetter, setFinalLetter] = useState<string | null>(null);
  const cloudDraftController = useRef<AbortController | null>(null);
  const redactionMapRef = useRef<RedactionMap>(redactionMap);
  const detectionRequest = useRef(0);

  const replaceRedactionMap = (nextMap: RedactionMap) => {
    redactionMapRef.current = nextMap;
    setRedactionMap(nextMap);
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const approveStory = (): { ok: boolean; error: string | null } => {
    if (!story.trim()) {
      return {
        ok: false,
        error: "Add a story before approving the privacy review.",
      };
    }

    try {
      const approved = redactionMapRef.current.redact(story);
      setRedactedStory(approved);
      setApprovedStory(approved);
      setDetectionError(null);
      try {
        prewarmCloudDrafting();
      } catch {
        // Approval stays valid. Drafting will report the Firebase error.
      }
      triggerToast("Privacy review approved.");
      return { ok: true, error: null };
    } catch (error: unknown) {
      setApprovedStory(null);

      if (error instanceof RedactionError && error.code === "leak") {
        return {
          ok: false,
          error: "Sensitive values may still be present. Review the story before continuing.",
        };
      }

      return {
        ok: false,
        error: "The privacy review could not be approved.",
      };
    }
  };

  const cancelCloudDraft = () => {
    cloudDraftController.current?.abort();
  };

  const startCloudDraft = async (): Promise<boolean> => {
    if (!approvedStory) {
      setDraftStatus("error");
      setDraftError("Approve the privacy review before drafting.");
      return false;
    }

    cloudDraftController.current?.abort();
    const controller = new AbortController();
    cloudDraftController.current = controller;
    setDraftStatus("drafting");
    setDraftError(null);
    setDraftResult(null);
    setFinalLetter(null);

    const disputePrompt = classifyDisputeType(approvedStory, disputeType);

    try {
      const result = await draftLetterInCloud(
        approvedStory,
        disputePrompt,
        { signal: controller.signal },
      );

      if (controller.signal.aborted) return false;

      const placeholderCheck = redactionMapRef.current.checkReturned(
        approvedStory,
        result.draftWithPlaceholders,
      );

      if (!placeholderCheck.ok) {
        const missingText =
          placeholderCheck.missing.length > 0
            ? `Missing: ${placeholderCheck.missing.join(", ")}`
            : "";
        const unexpectedText =
          placeholderCheck.unexpected.length > 0
            ? `Unexpected: ${placeholderCheck.unexpected.join(", ")}`
            : "";

        const placeholderDetails = [missingText, unexpectedText]
          .filter(Boolean)
          .join(". ");

        if (import.meta.env.DEV) {
          console.warn("[Letterlock] Placeholder validation failed", {
            missing: placeholderCheck.missing,
            unexpected: placeholderCheck.unexpected,
          });
        }

        setDraftStatus("error");
        setDraftError(
          `The draft returned with missing or unknown placeholders. ${placeholderDetails}. No letter was restored.`,
        );
        return false;
      }

      const restored = redactionMapRef.current.restore(
        result.draftWithPlaceholders,
      );
      if (extractPlaceholders(restored).length > 0) {
        setDraftStatus("error");
        setDraftError(
          "Some private placeholders could not be restored. No letter was finalized.",
        );
        return false;
      }

      setDraftResult(result);
      setFinalLetter(restored);
      setDraftStatus("success");
      return true;
    } catch (error: unknown) {
      if (controller.signal.aborted) {
        setDraftStatus("error");
        setDraftError("Cloud drafting was cancelled.");
        return false;
      }

      const message =
        error instanceof Error
          ? error.message
          : "Cloud drafting could not be completed.";
      setDraftStatus("error");
      setDraftError(message);
      return false;
    } finally {
      if (cloudDraftController.current === controller) {
        cloudDraftController.current = null;
      }
    }
  };

  const resetAll = () => {
    detectionRequest.current += 1;
    cloudDraftController.current?.abort();
    cloudDraftController.current = null;
    setStory(defaultStory);
    setEntities(defaultEntities);
    setDisputeType("deposit");
    setShowWipeModal(false);
    setDetection(null);
    setDetectionStatus("preparing");
    setDetectionProgress(undefined);
    setDetectionError(null);
    setIsDetecting(false);
    setApprovedStory(null);
    setDraftStatus("idle");
    setDraftError(null);
    setDraftResult(null);
    setFinalLetter(null);
    redactionMapRef.current.clear();
    replaceRedactionMap(new RedactionMap());
    setRedactedStory(null);
  };

  const removeEntity = (id: number) => {
    const entity = entities.find((item) => item.id === id);
    if (!entity) return;

    redactionMapRef.current.remove(entity.text);
    setEntities(entitiesFromRedactionMap(redactionMapRef.current));
    setRedactedStory(redactionMapRef.current.redact(story));
    setApprovedStory(null);
    triggerToast("Private detail removed.");
  };

  const addEntity = (text: string, _category: string, type: string) => {
    const trimmed = text.trim();
    if (!trimmed) return false;

    if (!story.toLocaleLowerCase().includes(trimmed.toLocaleLowerCase())) {
      triggerToast("That detail was not found in your story.");
      return false;
    }

    const kind = kindFromEntityType(type);
    redactionMapRef.current.add(trimmed, kind);
    setEntities(entitiesFromRedactionMap(redactionMapRef.current));
    setRedactedStory(redactionMapRef.current.redact(story));
    setApprovedStory(null);
    triggerToast("Private detail added.");
    return true;
  };

  const detectStory = useCallback(async (text: string): Promise<boolean> => {
    const requestId = detectionRequest.current + 1;
    detectionRequest.current = requestId;

    if (!text.trim()) {
      setIsDetecting(false);
      setDetection({
        values: [],
        status: "unavailable",
        limited: true,
      });
      setEntities([]);
      setDetectionStatus("unavailable");
      setDetectionProgress(undefined);
      setDetectionError(null);
      setApprovedStory(null);
      redactionMapRef.current.clear();
      replaceRedactionMap(new RedactionMap());
      setRedactedStory(null);
      return true;
    }

    setIsDetecting(true);
    setDetectionStatus("preparing");
    setDetectionProgress(undefined);
    setDetectionError(null);

    try {
      const result = await detectSensitiveValues(text, {
        onStatusChange: (status, progress) => {
          if (detectionRequest.current !== requestId) return;
          setDetectionStatus(status);
          setDetectionProgress(progress);
        },
      });

      if (detectionRequest.current !== requestId) return false;

      setDetection(result);
      setDetectionStatus(result.status);
      setDetectionProgress(undefined);
      setDetectionError(null);
      const next = buildMapAndEntities(result);
      replaceRedactionMap(next.map);
      setEntities([...next.entities]);
      setRedactedStory(next.map.redact(text));
      setApprovedStory(null);
      return true;
    } catch {
      if (detectionRequest.current !== requestId) return false;

      setDetection(null);
      setEntities([]);
      setDetectionStatus("unavailable");
      setDetectionProgress(undefined);
      setDetectionError(
        "We couldn't scan your story for private details right now. Please try again.",
      );
      redactionMapRef.current.clear();
      replaceRedactionMap(new RedactionMap());
      setRedactedStory(null);
      setApprovedStory(null);
      return false;
    } finally {
      if (detectionRequest.current === requestId) {
        setIsDetecting(false);
      }
    }
  }, []);

  return (
    <AppContext.Provider
      value={{
        story,
        setStory,
        disputeType,
        setDisputeType,
        entities,
        setEntities,
        removeEntity,
        addEntity,
        toastMessage,
        triggerToast,
        showWipeModal,
        setShowWipeModal,
        resetAll,
        detection,
        detectionStatus,
        detectionProgress,
        detectionError,
        isDetecting,
        redactionMap,
        redactedStory,
        approvedStory,
        approveStory,
        draftStatus,
        draftError,
        draftResult,
        finalLetter,
        startCloudDraft,
        cancelCloudDraft,
        detectStory,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};

function kindFromEntityType(type: string): PlaceholderKind {
  const kinds: Record<string, PlaceholderKind> = {
    Person: "person",
    Address: "address",
    Date: "date",
    Amount: "amount",
    Phone: "phone",
    Email: "email",
    Account: "account",
    Policy: "policy",
    Organization: "organization",
    Lease: "lease",
  };

  return kinds[type] ?? "other";
}
