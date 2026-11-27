import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProcessModal, {
  type ProcessModalError,
  type ProcessModalStep,
} from "../components/ProcessModal";
import { highlightRedactedStory, type TextSegment } from "../lib/storySegments";
import { buildDraftErrorCopy } from "../state/draftErrorCopy";
import { useApp } from "../state/AppContext";

function getFocusedRedactedWindow(
  segments: readonly TextSegment[],
  targetIdx: number | undefined,
): Array<{ seg: TextSegment; originalIndex: number }> {
  if (segments.length === 0) return [];
  if (targetIdx === undefined || targetIdx < 0) {
    return segments.slice(0, 5).map((seg, i) => ({ seg, originalIndex: i }));
  }

  const start = Math.max(0, targetIdx - 1);
  const end = Math.min(segments.length, targetIdx + 4);
  const items: Array<{ seg: TextSegment; originalIndex: number }> = [];

  for (let i = start; i < end; i += 1) {
    let seg = segments[i];
    if (i === start && i > 0 && seg.text.length > 44) {
      seg = { ...seg, text: `…${seg.text.slice(-40).trimStart()}` };
    }
    if (i === end - 1 && i < segments.length - 1 && seg.text.length > 60) {
      seg = { ...seg, text: `${seg.text.slice(0, 56).trimEnd()}…` };
    }
    items.push({ seg, originalIndex: i });
  }
  return items;
}

export default function ScreenGenerating() {
  const navigate = useNavigate();
  const {
    approvedStory,
    draftStatus,
    draftError,
    draftResult,
    redactionMap,
    startCloudDraft,
    cancelCloudDraft,
  } = useApp();

  const [prefersReducedMotion] = useState(() =>
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
  );

  // phase 1: Preparing your request (local)
  // phase 2: AI is writing your letter (cloud)
  // phase 3: Putting your real details back (local flip animation)
  // phase 4: Quick check state before navigating to /letter
  const [phase, setPhase] = useState<1 | 2 | 3 | 4>(1);
  const [restoredCount, setRestoredCount] = useState(0);
  const startedRef = useRef(false);

  const runDraftFlow = useCallback(() => {
    if (!approvedStory) {
      navigate("/review");
      return;
    }
    setPhase(1);
    setRestoredCount(0);

    const prepMs = prefersReducedMotion ? 0 : 350;
    const timer = window.setTimeout(() => {
      setPhase(2);
      void startCloudDraft();
    }, prepMs);

    return () => window.clearTimeout(timer);
  }, [approvedStory, navigate, prefersReducedMotion, startCloudDraft]);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    const cleanup = runDraftFlow();
    return () => {
      cleanup?.();
      cancelCloudDraft();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const requestSegments = useMemo(
    () =>
      approvedStory
        ? highlightRedactedStory(approvedStory, redactionMap.entries)
        : [],
    [approvedStory, redactionMap],
  );

  const responseSegments = useMemo(
    () =>
      draftResult?.draftWithPlaceholders
        ? highlightRedactedStory(
            draftResult.draftWithPlaceholders,
            redactionMap.entries,
          )
        : [],
    [draftResult, redactionMap],
  );

  const responseTokenIndices = useMemo(
    () =>
      responseSegments
        .map((seg, idx) => (seg.token ? idx : -1))
        .filter((idx) => idx !== -1),
    [responseSegments],
  );

  const valueByToken = useMemo(() => {
    const map = new Map<string, string>();
    for (const entry of redactionMap.entries) {
      map.set(entry.token, entry.value);
    }
    return map;
  }, [redactionMap]);

  // Phase 3: flip each placeholder pill into its real value (~150ms each, total < 1.5s)
  useEffect(() => {
    if (draftStatus !== "success" || !draftResult) return;

    const total = responseTokenIndices.length;

    if (prefersReducedMotion || total === 0) {
      setPhase(3);
      setRestoredCount(total);
      const doneTimer = window.setTimeout(() => setPhase(4), 150);
      const navTimer = window.setTimeout(() => navigate("/letter"), 550);
      return () => {
        window.clearTimeout(doneTimer);
        window.clearTimeout(navTimer);
      };
    }

    setPhase(3);
    setRestoredCount(0);

    const stepMs = Math.min(150, Math.floor(1350 / total));
    const timers: number[] = [];

    for (let i = 0; i < total; i += 1) {
      timers.push(
        window.setTimeout(() => {
          setRestoredCount(i + 1);
        }, (i + 1) * stepMs),
      );
    }

    const flipEnd = total * stepMs + 120;
    timers.push(window.setTimeout(() => setPhase(4), flipEnd));
    timers.push(window.setTimeout(() => navigate("/letter"), flipEnd + 450));

    return () => {
      for (const id of timers) window.clearTimeout(id);
    };
  }, [
    draftStatus,
    draftResult,
    responseTokenIndices.length,
    prefersReducedMotion,
    navigate,
  ]);

  const handleRetry = () => {
    runDraftFlow();
  };

  const handleCancel = () => {
    cancelCloudDraft();
    navigate("/review");
  };

  // One failed attempt produces exactly one kind, so only one error is shown.
  const modalError: ProcessModalError | null = useMemo(() => {
    if (draftStatus !== "error" || !draftError) return null;

    const copy = buildDraftErrorCopy(draftError);

    return {
      title: copy.title,
      subtitle: copy.subtitle,
      tabNote: copy.tabNote,
      retryLabel: "Try again",
      onRetry: handleRetry,
      backLabel: "Back to review",
      onBack: () => navigate("/review"),
      details: copy.details,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftStatus, draftError]);

  // Preview content changes with each step
  const previewContent = useMemo(() => {
    if (phase === 1) {
      const windowItems = getFocusedRedactedWindow(requestSegments, 0);
      return (
        <p className="text-[13px] sm:text-[14px] leading-relaxed text-[#47445a] whitespace-pre-wrap break-words">
          {windowItems.map(({ seg, originalIndex }) =>
            seg.token ? (
              <span
                key={`req-${originalIndex}`}
                className="inline-block px-1.5 py-0.5 mx-0.5 rounded bg-[#5b46e8] text-white font-sans text-[11px] font-semibold"
              >
                {seg.text}
              </span>
            ) : (
              <React.Fragment key={`req-${originalIndex}`}>
                {seg.text}
              </React.Fragment>
            ),
          )}
        </p>
      );
    }

    if (phase === 2) {
      // Cloud call is non-streaming (generateContent), so show soft skeleton (no fake typing)
      return (
        <div className="flex flex-col gap-2.5 w-full" aria-label="Writing letter">
          <div className="h-3 w-3/4 rounded-full bg-[#e9e4f8] animate-pulse" />
          <div className="h-3 w-full rounded-full bg-[#e9e4f8] animate-pulse" />
          <div className="h-3 w-5/6 rounded-full bg-[#e9e4f8] animate-pulse" />
        </div>
      );
    }

    // phase 3 or 4: flip each placeholder pill into its real value
    const activeTokenPos =
      responseTokenIndices.length > 0
        ? responseTokenIndices[
            Math.min(
              Math.max(restoredCount - 1, 0),
              responseTokenIndices.length - 1,
            )
          ]
        : 0;
    const windowItems = getFocusedRedactedWindow(
      responseSegments,
      activeTokenPos,
    );

    return (
      <p className="text-[13px] sm:text-[14px] leading-relaxed text-[#47445a] whitespace-pre-wrap break-words">
        {windowItems.map(({ seg, originalIndex }) => {
          if (!seg.token) {
            return (
              <React.Fragment key={`res-${originalIndex}`}>
                {seg.text}
              </React.Fragment>
            );
          }

          const tokenOrder = responseTokenIndices.indexOf(originalIndex);
          const isRestored = tokenOrder !== -1 && tokenOrder < restoredCount;
          const realValue = valueByToken.get(seg.text) ?? seg.text;

          return isRestored ? (
            <span
              key={`res-${originalIndex}-real`}
              className="inline-block px-1.5 py-0.5 mx-0.5 rounded bg-[#ede8fc] text-[#4f3bd4] font-medium text-[12px] transition-all duration-200"
            >
              {realValue}
            </span>
          ) : (
            <span
              key={`res-${originalIndex}-tok`}
              className="inline-block px-1.5 py-0.5 mx-0.5 rounded bg-[#5b46e8] text-white font-sans text-[11px] font-semibold transition-all duration-200"
            >
              {seg.text}
            </span>
          );
        })}
      </p>
    );
  }, [
    phase,
    requestSegments,
    responseSegments,
    responseTokenIndices,
    restoredCount,
    valueByToken,
  ]);

  const steps: ProcessModalStep[] = [
    {
      label: "Preparing your request",
      tag: "On your device",
      status: phase > 1 ? "done" : "active",
    },
    {
      label: "AI is writing your letter",
      tag: "In the cloud",
      status: phase > 2 ? "done" : phase === 2 ? "active" : "upcoming",
    },
    {
      label: "Putting your real details back",
      tag: "On your device",
      status: phase > 3 ? "done" : phase === 3 ? "active" : "upcoming",
    },
  ];

  const segmentedStep: 0 | 1 | 2 | 3 =
    phase === 1 ? 0 : phase === 2 ? 1 : phase === 3 ? 2 : 3;

  return (
    <ProcessModal
      activeStep={3}
      title="Writing your letter"
      titleId="generating-modal-title"
      previewContent={previewContent}
      segmentedStep={segmentedStep}
      steps={steps}
      bottomNote="The AI sees placeholders like {Person A}, not your name, company or contact details."
      onCancel={handleCancel}
      error={modalError}
      prefersReducedMotion={prefersReducedMotion}
    />
  );
}
