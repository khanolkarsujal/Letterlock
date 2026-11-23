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
import { entitiesFromDetection } from "./detectionPresentation";

// Shape of the context – matches the prototype exactly
export interface AppState {
  story: string;
  setStory: React.Dispatch<React.SetStateAction<string>>;
  disputeType: string;
  setDisputeType: React.Dispatch<React.SetStateAction<string>>;
  entities: Entity[];
  setEntities: React.Dispatch<React.SetStateAction<Entity[]>>;
  removeEntity: (id: number) => void;
  addEntity: (text: string, category: string, type: string) => void;
  toastMessage: string;
  triggerToast: (msg: string) => void;
  showWipeModal: boolean;
  setShowWipeModal: React.Dispatch<React.SetStateAction<boolean>>;
  resetAll: () => void;
  detection: DetectionResult | null;
  detectionStatus: OnDeviceStatus;
  detectionProgress: number | undefined;
  detectionError: string | null;
  detectStory: (text: string) => Promise<void>;
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
  const detectionRequest = useRef(0);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const resetAll = () => {
    detectionRequest.current += 1;
    setStory(defaultStory);
    setEntities(defaultEntities);
    setDisputeType("deposit");
    setShowWipeModal(false);
    setDetection(null);
    setDetectionStatus("preparing");
    setDetectionProgress(undefined);
    setDetectionError(null);
  };

  const removeEntity = (id: number) => {
    setEntities(prev => prev.filter(e => e.id !== id));
  };

  const addEntity = (text: string, category: string, type: string) => {
    const nextId = Date.now();
    const token = `{${type} ${entities.length + 1}}`;
    setEntities(prev => [...prev, { id: nextId, text, category, token, locked: true }]);
  };

  const detectStory = useCallback(async (text: string) => {
    const requestId = detectionRequest.current + 1;
    detectionRequest.current = requestId;

    if (!text.trim()) {
      setDetection({
        values: [],
        status: "unavailable",
        limited: true,
      });
      setEntities([]);
      setDetectionStatus("unavailable");
      setDetectionProgress(undefined);
      setDetectionError(null);
      return;
    }

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

      if (detectionRequest.current !== requestId) return;

      setDetection(result);
      setDetectionStatus(result.status);
      setDetectionProgress(undefined);
      setDetectionError(null);
      setEntities(entitiesFromDetection(result));

      if (import.meta.env.DEV) {
        const kindCounts = result.values.reduce<Record<string, number>>(
          (counts, value) => {
            counts[value.kind] = (counts[value.kind] ?? 0) + 1;
            return counts;
          },
          {},
        );
        const occurrenceCount = result.values.reduce(
          (total, value) => total + value.occurrences.length,
          0,
        );

        console.info("[Letterlock] Detection complete", {
          status: result.status,
          limited: result.limited,
          uniqueValues: result.values.length,
          occurrences: occurrenceCount,
          kindCounts,
        });
      }
    } catch {
      if (detectionRequest.current !== requestId) return;

      setDetection(null);
      setEntities([]);
      setDetectionStatus("unavailable");
      setDetectionProgress(undefined);
      setDetectionError(
        "Private-detail detection failed. Review the story carefully before continuing.",
      );
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
