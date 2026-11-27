import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProcessModal, { type ProcessModalStep } from "../components/ProcessModal";
import { highlightOriginalStory, type TextSegment } from "../lib/storySegments";
import type { PlaceholderKind } from "../../redaction";
import { useApp } from "../state/AppContext";

const KIND_LABELS: Record<PlaceholderKind, string> = {
  person: "[NAME]",
  address: "[ADDRESS]",
  phone: "[PHONE]",
  lease: "[REF #]",
  account: "[REF #]",
  policy: "[REF #]",
  organization: "[COMPANY]",
  reference: "[REF #]",
  date: "[DATE]",
  amount: "[AMOUNT]",
  email: "[EMAIL]",
  other: "[DETAIL]",
};

/**
 * Returns a focused slice of segments centered on `targetSegIndex` so the
 * preview box always shows lines that actually contain detected details.
 */
function getFocusedWindow(
  segments: readonly TextSegment[],
  targetSegIndex: number | undefined,
): { items: Array<{ seg: TextSegment; originalIndex: number }>; clippedStart: boolean } {
  if (segments.length === 0) return { items: [], clippedStart: false };
  if (targetSegIndex === undefined || targetSegIndex < 0) {
    return {
      items: segments.slice(0, 5).map((seg, i) => ({ seg, originalIndex: i })),
      clippedStart: false,
    };
  }

  const start = Math.max(0, targetSegIndex - 1);
  const end = Math.min(segments.length, targetSegIndex + 4);
  const items: Array<{ seg: TextSegment; originalIndex: number }> = [];

  for (let i = start; i < end; i += 1) {
    let seg = segments[i];
    if (i === start && i > 0 && seg.text.length > 48) {
      seg = { ...seg, text: `…${seg.text.slice(-45).trimStart()}` };
    }
    if (i === end - 1 && i < segments.length - 1 && seg.text.length > 64) {
      seg = { ...seg, text: `${seg.text.slice(0, 60).trimEnd()}…` };
    }
    items.push({ seg, originalIndex: i });
  }

  return { items, clippedStart: start > 0 };
}

function ScreenScan() {
  const navigate = useNavigate();
  const {
    story,
    redactionMap,
    isDetecting,
    detectionStatus,
    detectionProgress,
    detectionError,
    detectStory,
  } = useApp();

  const [prefersReducedMotion] = useState(() =>
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
  );
  const [revealedCount, setRevealedCount] = useState(0);
  const [swappedCount, setSwappedCount] = useState(0);
  const [isSuccessState, setIsSuccessState] = useState(false);

  const wordCount = useMemo(
    () => (story.trim() ? story.trim().split(/\s+/).length : 0),
    [story],
  );

  useEffect(() => {
    if (!story.trim()) {
      navigate("/");
    }
  }, [story, navigate]);

  const entryKindByValue = useMemo(() => {
    const map = new Map<string, PlaceholderKind>();
    for (const entry of redactionMap.entries) {
      map.set(entry.value.toLocaleLowerCase(), entry.kind);
    }
    return map;
  }, [redactionMap]);

  const segments = useMemo(
    () => highlightOriginalStory(story, redactionMap.entries),
    [story, redactionMap],
  );

  const highlightedIndices = useMemo(
    () =>
      segments
        .map((seg, idx) => (seg.highlighted ? idx : -1))
        .filter((idx) => idx !== -1),
    [segments],
  );

  useEffect(() => {
    if (isDetecting || detectionError || !story.trim()) {
      setRevealedCount(0);
      setSwappedCount(0);
      setIsSuccessState(false);
      return;
    }

    const total = highlightedIndices.length;

    if (prefersReducedMotion) {
      setRevealedCount(total);
      setSwappedCount(total);
      setIsSuccessState(true);
      const timer = window.setTimeout(() => {
        navigate("/review");
      }, 1000);
      return () => window.clearTimeout(timer);
    }

    if (total === 0) {
      setIsSuccessState(true);
      const navTimer = window.setTimeout(() => {
        navigate("/review");
      }, 1000);
      return () => window.clearTimeout(navTimer);
    }

    const stepMs = Math.min(300, Math.max(120, Math.floor(2000 / total)));
    const swapDelayMs = Math.floor(stepMs * 0.45);
    const timers: number[] = [];

    for (let i = 0; i < total; i += 1) {
      const startAt = i * stepMs;
      timers.push(
        window.setTimeout(() => {
          setRevealedCount(i + 1);
        }, startAt),
      );
      timers.push(
        window.setTimeout(() => {
          setSwappedCount(i + 1);
        }, startAt + swapDelayMs),
      );
    }

    const finishAt = (total - 1) * stepMs + swapDelayMs + 120;
    timers.push(
      window.setTimeout(() => {
        setIsSuccessState(true);
      }, finishAt),
    );
    timers.push(
      window.setTimeout(() => {
        navigate("/review");
      }, finishAt + 1000),
    );

    return () => {
      for (const id of timers) window.clearTimeout(id);
    };
  }, [
    isDetecting,
    detectionError,
    story,
    highlightedIndices.length,
    prefersReducedMotion,
    navigate,
  ]);

  const totalDetails = highlightedIndices.length;
  const activeHighlightOrder =
    totalDetails > 0
      ? Math.min(Math.max(revealedCount - 1, 0), totalDetails - 1)
      : -1;
  const activeTargetSegIndex =
    activeHighlightOrder >= 0 ? highlightedIndices[activeHighlightOrder] : undefined;

  const focusedWindow = useMemo(
    () => getFocusedWindow(segments, activeTargetSegIndex),
    [segments, activeTargetSegIndex],
  );

  const isWaitingPhase = isDetecting;
  const isModelLoading =
    isWaitingPhase &&
    (detectionStatus === "preparing" || detectionProgress !== undefined);

  const activeChecklistStep = isWaitingPhase ? 1 : isSuccessState ? 3 : 2;

  const determinatePercent =
    totalDetails === 0
      ? 100
      : isSuccessState
        ? 100
        : Math.round((revealedCount / totalDetails) * 100);

  const handleRetry = () => {
    if (isDetecting) return;
    void detectStory(story);
  };

  const steps: ProcessModalStep[] = [
    {
      label: "Reading your story",
      meta: `${wordCount} ${wordCount === 1 ? "word" : "words"}`,
      status: "done",
    },
    {
      label: isModelLoading
        ? "Loading on-device privacy model (first time only)"
        : "Finding names, addresses and numbers",
      meta: !isWaitingPhase ? `${totalDetails} found` : undefined,
      status: activeChecklistStep > 1 ? "done" : "active",
    },
    {
      label: "Swapping in safe placeholders",
      meta:
        activeChecklistStep === 2 && totalDetails > 0
          ? `${swappedCount} of ${totalDetails}`
          : activeChecklistStep > 2
            ? `${totalDetails} hidden`
            : undefined,
      status:
        activeChecklistStep > 2
          ? "done"
          : activeChecklistStep === 2
            ? "active"
            : "upcoming",
    },
  ];

  const previewContent = (
    <p className="text-[13px] sm:text-[14px] leading-relaxed text-[#47445a] whitespace-pre-wrap break-words w-full">
      {focusedWindow.clippedStart && <span className="text-[#9b96b0]">… </span>}
      {focusedWindow.items.map(({ seg, originalIndex }) => {
        if (!seg.highlighted) {
          return (
            <React.Fragment key={`${originalIndex}-plain`}>
              {seg.text}
            </React.Fragment>
          );
        }

        const highlightOrder = highlightedIndices.indexOf(originalIndex);
        const isRevealed =
          !isWaitingPhase &&
          !detectionError &&
          highlightOrder !== -1 &&
          highlightOrder < revealedCount;
        const isSwapped =
          !isWaitingPhase &&
          !detectionError &&
          highlightOrder !== -1 &&
          highlightOrder < swappedCount;

        const kind =
          entryKindByValue.get(seg.text.toLocaleLowerCase()) ?? "other";
        const tag = KIND_LABELS[kind];

        if (isSwapped) {
          return (
            <span
              key={`${originalIndex}-tag`}
              className="inline-block px-1.5 py-0.5 mx-0.5 rounded bg-[#ede8fc] text-[#5b46e8] font-mono text-[11px] font-semibold transition-all duration-200"
            >
              {tag}
            </span>
          );
        }

        return (
          <span
            key={`${originalIndex}-raw`}
            className={`inline-block px-1 rounded font-medium transition-all duration-200 ${
              isRevealed
                ? "bg-[#5b46e8]/15 text-[#5b46e8]"
                : "bg-[#f0edf8] text-[#161427]"
            }`}
          >
            {seg.text}
          </span>
        );
      })}
    </p>
  );

  const statusLine = (
    <div
      className="text-center text-xs font-medium text-[#5f5c72] tabular-nums min-h-[18px] flex items-center justify-center gap-1.5"
      aria-live="polite"
    >
      {isWaitingPhase ? (
        <span className="text-[#5b46e8] font-medium">
          Scanning your story...
        </span>
      ) : isSuccessState ? (
        <>
          <span className="material-symbols-outlined text-[15px] text-[#5b46e8]">
            check_circle
          </span>
          <span className="font-semibold text-[#5b46e8]">
            {totalDetails === 0
              ? "No private details found"
              : `${totalDetails} ${totalDetails === 1 ? "private detail" : "private details"} hidden`}
          </span>
        </>
      ) : (
        <span>
          Found{" "}
          <strong className="font-semibold text-[#161427]">
            {revealedCount}
          </strong>{" "}
          {revealedCount === 1 ? "private detail" : "private details"}
        </span>
      )}
    </div>
  );

  return (
    <ProcessModal
      activeStep={2}
      title="Hiding your private details"
      titleId="scan-modal-title"
      previewContent={previewContent}
      showScanSweep={!isSuccessState && !detectionError}
      statusLine={statusLine}
      barProgress={{
        indeterminate: isWaitingPhase,
        percent: determinatePercent,
        label: isWaitingPhase ? "Step 2 of 3" : "Step 3 of 3",
      }}
      steps={steps}
      bottomNote="Your real details stay on this device."
      onCancel={() => navigate("/")}
      prefersReducedMotion={prefersReducedMotion}
      error={
        detectionError
          ? {
              title: "We couldn't hide your details on this device",
              subtitle: "Nothing was sent.",
              retryLabel: "Try again",
              onRetry: handleRetry,
              backLabel: "Back to story",
              onBack: () => navigate("/"),
              details: detectionError,
            }
          : null
      }
    />
  );
}

export default ScreenScan;
