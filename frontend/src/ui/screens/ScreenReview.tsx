import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import {
  highlightOriginalStory,
  highlightRedactedStory,
  verifyRenderedStoryOrder,
} from "../lib/storySegments";
import { useApp } from "../state/AppContext";

const COMMON_CAPITALIZED_SKIP = new Set([
  // Greetings, sign-offs, subject/letter words, pronouns, starters
  "Subject",
  "Request",
  "Hello",
  "Hi",
  "Dear",
  "Regards",
  "Sincerely",
  "Thanks",
  "Thank",
  "Please",
  "My",
  "Your",
  "The",
  "This",
  "That",
  "These",
  "Those",
  "If",
  "In",
  "On",
  "At",
  "For",
  "From",
  "To",
  "I",
  "We",
  "You",
  "He",
  "She",
  "They",
  "It",
  // Common acronyms & document terms
  "IFSC",
  "UPI",
  "ID",
  "PAN",
  "OTP",
  "GST",
  "EMI",
  "HR",
  "CEO",
  "USA",
  "UK",
  "AI",
  "ATM",
  "PIN",
  "PDF",
  // Months & days
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
]);

interface SelectionPopup {
  text: string;
  x: number;
  y: number;
}

function isSentenceStart(lineText: string, index: number): boolean {
  if (index === 0) return true;
  const before = lineText.slice(0, index);
  if (before.trim().length === 0) return true;
  return /[.!?]\s*$/.test(before);
}

function isTitleOrSubjectLine(lineText: string): boolean {
  const trimmed = lineText.trim();
  if (!trimmed) return false;
  if (/^(?:Subject|Re|Title|To|From|Date|Ref)\s*:/i.test(trimmed)) {
    return true;
  }
  return false;
}

function ScreenReview() {
  const {
    story,
    entities,
    redactionMap,
    redactedStory,
    approveStory,
    removeEntity,
    addEntity,
  } = useApp();
  const navigate = useNavigate();

  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const rowRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const flashTimerRef = useRef<number | null>(null);

  const [hoveredToken, setHoveredToken] = useState<string | null>(null);
  const [flashingToken, setFlashingToken] = useState<string | null>(null);
  const [activeDetailIndex, setActiveDetailIndex] = useState<number>(0);
  const [unhiddenValues, setUnhiddenValues] = useState<string[]>([]);
  const [selectionPopup, setSelectionPopup] = useState<SelectionPopup | null>(
    null,
  );
  const [approvalError, setApprovalError] = useState<string | null>(null);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  const activeToken = hoveredToken ?? flashingToken;

  const entityByLowerText = useMemo(() => {
    const map = new Map<string, (typeof entities)[number]>();
    for (const entity of entities) {
      map.set(entity.text.toLocaleLowerCase(), entity);
    }
    return map;
  }, [entities]);

  const unhiddenSet = useMemo(
    () => new Set(unhiddenValues.map((v) => v.toLocaleLowerCase())),
    [unhiddenValues],
  );

  // Split story and redactedStory into aligned paragraph/line rows
  const rows = useMemo(() => {
    const origLines = story.split("\n");
    const redLines = (redactedStory ?? story).split("\n");
    const count = Math.max(origLines.length, redLines.length);

    return Array.from({ length: count }, (_, idx) => {
      const origLine = origLines[idx] ?? "";
      const redLine = redLines[idx] ?? "";
      return {
        index: idx,
        origLine,
        redLine,
        isEmpty: origLine.trim() === "" && redLine.trim() === "",
        origSegments: highlightOriginalStory(origLine, redactionMap.entries),
        redSegments: highlightRedactedStory(redLine, redactionMap.entries),
      };
    });
  }, [story, redactedStory, redactionMap]);

  // Verify left panel rendered segments exactly equal the original story
  useEffect(() => {
    if (!story) return;
    const reconstructedLines = rows.map((row) =>
      row.origSegments.map((s) => s.text).join(""),
    );
    verifyRenderedStoryOrder(story, [reconstructedLines.join("\n")]);
  }, [story, rows]);

  // Ordered list of hidden details by row appearance for step-through controls
  const stepItems = useMemo(() => {
    const items: Array<{ token: string; value: string; rowIndex: number }> = [];
    const seen = new Set<string>();
    for (const row of rows) {
      for (const seg of row.origSegments) {
        if (!seg.highlighted) continue;
        const entity = entityByLowerText.get(seg.text.toLocaleLowerCase());
        if (entity && !seen.has(entity.token)) {
          seen.add(entity.token);
          items.push({
            token: entity.token,
            value: entity.text,
            rowIndex: row.index,
          });
        }
      }
    }
    return items;
  }, [rows, entityByLowerText]);

  useEffect(() => {
    if (stepItems.length === 0) {
      setActiveDetailIndex(0);
    } else if (activeDetailIndex >= stepItems.length) {
      setActiveDetailIndex(stepItems.length - 1);
    }
  }, [stepItems.length, activeDetailIndex]);

  useEffect(() => {
    return () => {
      if (flashTimerRef.current !== null) {
        window.clearTimeout(flashTimerRef.current);
      }
    };
  }, []);

  const updateScrollFades = useCallback(() => {
    const el = scrollAreaRef.current;
    if (!el) return;
    setCanScrollUp(el.scrollTop > 6);
    setCanScrollDown(el.scrollTop + el.clientHeight < el.scrollHeight - 6);
  }, []);

  useEffect(() => {
    updateScrollFades();
    window.addEventListener("resize", updateScrollFades);
    return () => window.removeEventListener("resize", updateScrollFades);
  }, [story, entities.length, updateScrollFades]);

  const stepToDetail = useCallback(
    (delta: number) => {
      if (stepItems.length === 0) return;
      const nextIdx =
        (activeDetailIndex + delta + stepItems.length) % stepItems.length;
      setActiveDetailIndex(nextIdx);
      const target = stepItems[nextIdx];
      if (!target) return;

      const rowEl = rowRefs.current.get(target.rowIndex);
      if (rowEl) {
        const reduceMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;
        rowEl.scrollIntoView({
          behavior: reduceMotion ? "auto" : "smooth",
          block: "center",
        });
      }

      if (flashTimerRef.current !== null) {
        window.clearTimeout(flashTimerRef.current);
      }
      setFlashingToken(target.token);
      flashTimerRef.current = window.setTimeout(() => {
        setFlashingToken(null);
        flashTimerRef.current = null;
      }, 800);
    },
    [stepItems, activeDetailIndex],
  );

  const handleHideValue = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    if (addEntity(trimmed, "Custom", "Other")) {
      setUnhiddenValues((prev) =>
        prev.filter((v) => v.toLocaleLowerCase() !== trimmed.toLocaleLowerCase()),
      );
      setApprovalError(null);
    }
  };

  const handleUnhideValue = (value: string) => {
    const entity = entityByLowerText.get(value.toLocaleLowerCase());
    if (!entity) return;
    removeEntity(entity.id);
    setUnhiddenValues((prev) =>
      prev.some((v) => v.toLocaleLowerCase() === value.toLocaleLowerCase())
        ? prev
        : [...prev, value],
    );
    setHoveredToken(null);
    setFlashingToken(null);
    setApprovalError(null);
  };

  const handleTextSelection = () => {
    const container = scrollAreaRef.current;
    const selection = window.getSelection();
    if (!container || !selection || selection.isCollapsed) {
      setSelectionPopup(null);
      return;
    }

    const selectedText = selection.toString().trim();
    if (!selectedText || selectedText.length < 2) {
      setSelectionPopup(null);
      return;
    }

    if (
      !container.contains(selection.anchorNode) ||
      !container.contains(selection.focusNode)
    ) {
      setSelectionPopup(null);
      return;
    }

    if (entityByLowerText.has(selectedText.toLocaleLowerCase())) {
      setSelectionPopup(null);
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    setSelectionPopup({
      text: selectedText,
      x: Math.max(
        56,
        Math.min(
          containerRect.width - 56,
          rect.left - containerRect.left + rect.width / 2,
        ),
      ),
      y: Math.max(56, rect.top - containerRect.top + container.scrollTop - 40),
    });
  };

  const handleHideSelected = () => {
    if (!selectionPopup) return;
    handleHideValue(selectionPopup.text);
    setSelectionPopup(null);
    window.getSelection()?.removeAllRanges();
  };

  const handleApprove = () => {
    const result = approveStory();
    setApprovalError(result.error);
    if (result.ok) {
      navigate("/generating");
    }
  };

  // Render plain text with dashed outlines for un-hidden items and dotted
  // underlines only on mid-sentence capitalized phrases not in the skip list.
  // Never spans newlines ([ \t]+ only) and uses inline spans so text order is never broken.
  const renderPlainWithHints = (
    text: string,
    fullLine: string,
    segmentOffsetInLine: number,
    keyPrefix: string,
  ) => {
    const skipLineHints = isTitleOrSubjectLine(fullLine);
    const hintPattern =
      /\b([A-Z][a-zA-Z'-]{1,24}(?:[ \t]+[A-Z][a-zA-Z'-]{1,24})*)\b/g;
    const nodes: React.ReactNode[] = [];
    let cursor = 0;

    for (const match of text.matchAll(hintPattern)) {
      const idx = match.index;
      if (idx === undefined) continue;
      const phrase = match[0];

      if (idx > cursor) {
        nodes.push(
          <React.Fragment key={`${keyPrefix}-t-${cursor}`}>
            {text.slice(cursor, idx)}
          </React.Fragment>,
        );
      }

      const isUnhidden = unhiddenSet.has(phrase.toLocaleLowerCase());
      const words = phrase.split(/[ \t]+/);
      const allAcronymsOrSkip = words.every(
        (w) => /^[A-Z]{2,}$/.test(w) || COMMON_CAPITALIZED_SKIP.has(w),
      );
      const atSentenceStart = isSentenceStart(
        fullLine,
        segmentOffsetInLine + idx,
      );

      if (isUnhidden) {
        nodes.push(
          <span
            key={`${keyPrefix}-u-${idx}`}
            role="button"
            tabIndex={0}
            onClick={() => handleHideValue(phrase)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleHideValue(phrase);
              }
            }}
            title="Click to hide again"
            className="inline border border-dashed border-[#b6b0c7] px-1.5 py-0.5 rounded-lg text-[16px] text-[#161427] hover:border-[#5b46e8] hover:bg-[#ede8fc]/40 transition-colors cursor-pointer"
          >
            {phrase}
          </span>,
        );
      } else if (!skipLineHints && !allAcronymsOrSkip && !atSentenceStart) {
        nodes.push(
          <span
            key={`${keyPrefix}-h-${idx}`}
            role="button"
            tabIndex={0}
            onClick={() => handleHideValue(phrase)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleHideValue(phrase);
              }
            }}
            title="Possible miss — click to hide"
            className="inline underline decoration-dotted decoration-[#9b96b0] underline-offset-4 hover:bg-[#ede8fc]/50 hover:decoration-[#5b46e8] rounded px-0.5 transition-colors cursor-pointer"
          >
            {phrase}
          </span>,
        );
      } else {
        nodes.push(
          <React.Fragment key={`${keyPrefix}-s-${idx}`}>
            {phrase}
          </React.Fragment>,
        );
      }

      cursor = idx + phrase.length;
    }

    if (cursor < text.length) {
      nodes.push(
        <React.Fragment key={`${keyPrefix}-end`}>
          {text.slice(cursor)}
        </React.Fragment>,
      );
    }

    return nodes;
  };

  return (
    <div className="h-dvh flex flex-col bg-[#faf9fe] overflow-hidden">
      {/* Background: faint grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(91, 70, 232, 0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(91, 70, 232, 0.06) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage:
              "radial-gradient(ellipse 72% 65% at 50% 50%, rgba(0,0,0,0.14) 0%, rgba(0,0,0,0.85) 58%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 72% 65% at 50% 50%, rgba(0,0,0,0.14) 0%, rgba(0,0,0,0.85) 58%, transparent 100%)",
          }}
        />
      </div>

      {/* Header: minimal, Step 2 active */}
      <div className="relative z-20 flex-shrink-0">
        <Header activeStep={2} minimal />
      </div>

      {/* Main content area — fills between header and action bar */}
      <main className="relative z-10 flex-1 min-h-0 flex flex-col pt-[88px] px-4 sm:px-6 pb-4">
        <div className="max-w-[1240px] w-full mx-auto flex flex-col flex-1 min-h-0">
          {/* Title block */}
          <div className="text-center pt-4 pb-3 flex-shrink-0">
            <h1 className="text-[28px] sm:text-[34px] font-extrabold text-[#161427] tracking-tight leading-tight">
              Check what gets sent
            </h1>
            <p className="text-[14px] sm:text-[15px] text-[#5f5c72] mt-1.5 [text-wrap:balance]">
              Your real details stay on this device. Click a highlight to show
              it again, or select any text to hide it.
            </p>
          </div>

          {/* Unified Comparison Card — one scroll container, aligned paragraph rows */}
          <section className="relative flex-1 min-h-0 flex flex-col bg-white rounded-2xl border border-[#e6e2f2] shadow-[0_12px_36px_-12px_rgba(22,20,39,0.08)] overflow-hidden">
            {canScrollUp && (
              <div className="pointer-events-none absolute inset-x-0 top-[53px] h-6 bg-gradient-to-b from-white to-transparent z-30" />
            )}

            <div
              ref={scrollAreaRef}
              tabIndex={0}
              onScroll={updateScrollFades}
              onMouseUp={handleTextSelection}
              onKeyUp={handleTextSelection}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight") {
                  e.preventDefault();
                  stepToDetail(1);
                } else if (e.key === "ArrowLeft") {
                  e.preventDefault();
                  stepToDetail(-1);
                }
              }}
              aria-label="Story comparison panels"
              className="relative flex-1 min-h-0 overflow-y-auto focus:outline-none"
            >
              {/* Sticky Column Headers */}
              <div className="sticky top-0 z-20 grid grid-cols-1 min-[900px]:grid-cols-2 min-[900px]:divide-x divide-[#f0edf8] bg-white/95 backdrop-blur-sm border-b border-[#f0edf8]">
                <div className="px-7 py-3.5 flex items-baseline gap-2.5">
                  <h2 className="text-[17px] font-bold text-[#161427]">
                    Your story
                  </h2>
                  <span className="text-[13px] text-[#7c7891]">
                    stays on this device
                  </span>
                </div>
                <div className="hidden min-[900px]:flex px-7 py-3.5 items-baseline gap-2.5">
                  <h2 className="text-[17px] font-bold text-[#161427]">
                    What the AI sees
                  </h2>
                  <span className="text-[13px] text-[#7c7891]">
                    this is what gets sent
                  </span>
                </div>
              </div>

              {/* Selection Popup */}
              {selectionPopup && (
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={handleHideSelected}
                  style={{
                    left: `${selectionPopup.x}px`,
                    top: `${selectionPopup.y}px`,
                    transform: "translateX(-50%)",
                  }}
                  className="absolute z-30 px-3.5 py-1.5 rounded-full bg-[#161427] text-white text-xs font-semibold shadow-lg hover:bg-[#5b46e8] transition-colors cursor-pointer whitespace-nowrap"
                >
                  Hide this
                </button>
              )}

              {/* Paragraph Rows */}
              {story.trim() ? (
                <div className="py-5">
                  {rows.map((row) => {
                    if (row.isEmpty) {
                      return <div key={`row-${row.index}`} className="h-3" />;
                    }

                    let offsetInLine = 0;

                    return (
                      <div
                        key={`row-${row.index}`}
                        ref={(el) => {
                          if (el) rowRefs.current.set(row.index, el);
                          else rowRefs.current.delete(row.index);
                        }}
                        className="grid grid-cols-1 min-[900px]:grid-cols-2 min-[900px]:divide-x divide-[#f0edf8]"
                      >
                        {/* Left Column: Original */}
                        <div
                          className={`px-7 py-1.5 text-[18px] leading-[1.75] break-words max-[799px]:text-[16px] transition-opacity duration-150 ${
                            activeToken ? "text-[#4b5563]/45" : "text-[#4b5563]"
                          }`}
                        >
                          {row.origSegments.map((segment, segIdx) => {
                            const currentOffset = offsetInLine;
                            offsetInLine += segment.text.length;

                            if (!segment.highlighted) {
                              return (
                                <React.Fragment
                                  key={`orig-${row.index}-${segIdx}`}
                                >
                                  {renderPlainWithHints(
                                    segment.text,
                                    row.origLine,
                                    currentOffset,
                                    `p-${row.index}-${segIdx}`,
                                  )}
                                </React.Fragment>
                              );
                            }

                            const entity = entityByLowerText.get(
                              segment.text.toLocaleLowerCase(),
                            );
                            const token = entity?.token ?? null;
                            const isActive =
                              token !== null && activeToken === token;
                            const isFlashing =
                              token !== null && flashingToken === token;
                            const isDimmed =
                              activeToken !== null && !isActive;

                            return (
                              <span
                                key={`orig-${row.index}-${segIdx}`}
                                role="button"
                                tabIndex={0}
                                onClick={() => handleUnhideValue(segment.text)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    handleUnhideValue(segment.text);
                                  }
                                }}
                                onMouseEnter={() =>
                                  token && setHoveredToken(token)
                                }
                                onMouseLeave={() => setHoveredToken(null)}
                                onFocus={() => token && setHoveredToken(token)}
                                onBlur={() => setHoveredToken(null)}
                                title="Click or press Enter to show again"
                                className={`inline-block px-2.5 py-0.5 mx-0.5 rounded-lg text-[16px] font-medium transition-all cursor-pointer border focus:outline-none ${
                                  isFlashing
                                    ? "bg-[#5b46e8] text-white border-[#5b46e8] ring-4 ring-[#5b46e8]/45 scale-[1.03] shadow-md opacity-100"
                                    : isActive
                                      ? "bg-[#ede8fc] text-[#4f3bd4] border-[#5b46e8] ring-4 ring-[#5b46e8]/30 shadow-sm opacity-100"
                                      : isDimmed
                                        ? "bg-[#ede8fc] text-[#4f3bd4] border-[#d8cef8] opacity-45"
                                        : "bg-[#ede8fc] text-[#4f3bd4] border-[#d8cef8] hover:bg-[#e3dbfc]"
                                }`}
                              >
                                {segment.text}
                              </span>
                            );
                          })}
                        </div>

                        {/* Right Column: Sanitized */}
                        <div
                          className={`px-7 py-1.5 text-[18px] leading-[1.75] break-words max-[799px]:text-[16px] max-[899px]:bg-[#faf9fe]/60 max-[899px]:border-b max-[899px]:border-[#f0edf8] max-[899px]:pb-3 max-[899px]:mb-2 transition-opacity duration-150 ${
                            activeToken ? "text-[#4b5563]/45" : "text-[#4b5563]"
                          }`}
                        >
                          <span className="min-[900px]:hidden block text-[11px] uppercase tracking-wider font-semibold text-[#7c7891] mb-0.5">
                            What the AI sees
                          </span>
                          {row.redSegments.map((segment, segIdx) => {
                            if (!segment.token) {
                              return (
                                <React.Fragment
                                  key={`red-${row.index}-${segIdx}`}
                                >
                                  {segment.text}
                                </React.Fragment>
                              );
                            }

                            const isActive = activeToken === segment.text;
                            const isFlashing = flashingToken === segment.text;
                            const isDimmed =
                              activeToken !== null && !isActive;

                            return (
                              <span
                                key={`red-${row.index}-${segIdx}`}
                                tabIndex={0}
                                onMouseEnter={() =>
                                  setHoveredToken(segment.text)
                                }
                                onMouseLeave={() => setHoveredToken(null)}
                                onFocus={() => setHoveredToken(segment.text)}
                                onBlur={() => setHoveredToken(null)}
                                className={`inline-block px-2.5 py-0.5 mx-0.5 rounded-lg font-sans font-semibold text-[16px] transition-all cursor-default focus:outline-none ${
                                  isFlashing
                                    ? "bg-[#161427] text-white ring-4 ring-[#5b46e8]/45 scale-[1.04] shadow-md opacity-100"
                                    : isActive
                                      ? "bg-[#5b46e8] text-white ring-4 ring-[#5b46e8]/35 shadow-md opacity-100"
                                      : isDimmed
                                        ? "bg-[#5b46e8] text-white opacity-45"
                                        : "bg-[#5b46e8] text-white shadow-sm"
                                }`}
                              >
                                {segment.text}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-7 text-[18px] text-[#4b5563]">
                  No story entered.
                </div>
              )}
            </div>

            {canScrollDown && (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white to-transparent z-30" />
            )}
          </section>
        </div>
      </main>

      {/* Action bar — pinned at bottom */}
      <div className="relative z-20 flex-shrink-0 bg-white/90 backdrop-blur-md border-t border-[#e6e2f2] shadow-[0_-4px_12px_rgba(0,0,0,0.04)]">
        <div className="max-w-[1240px] w-full mx-auto px-4 sm:px-6">
          {approvalError && (
            <div
              className="rounded-xl border border-[#fecaca] bg-[#fef2f2] px-4 py-2.5 text-sm text-[#8a3d3d] text-center mt-2"
              role="alert"
            >
              {approvalError}
            </div>
          )}
          <div className="h-[72px] flex items-center justify-between gap-4 max-[599px]:flex-col max-[599px]:h-auto max-[599px]:py-3 max-[599px]:gap-2.5">
            {/* Back button */}
            <button
              type="button"
              onClick={() => navigate("/")}
              className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-white border border-[#e6e2f2] text-[#47445a] hover:text-[#161427] hover:bg-[#f4f3f8] text-[15px] font-semibold transition-colors cursor-pointer shadow-sm max-[599px]:w-full max-[599px]:order-2"
            >
              <span className="material-symbols-outlined text-[18px]">
                arrow_back
              </span>
              <span>Back</span>
            </button>

            {/* Step-through control — centered */}
            <div className="flex items-center justify-center gap-3 text-[14px] sm:text-[15px] text-[#3f3d4d] tabular-nums max-[599px]:order-1 flex-wrap">
              <strong className="font-bold text-[#161427]">
                {entities.length}{" "}
                {entities.length === 1 ? "detail" : "details"} hidden
              </strong>
              {stepItems.length > 0 && (
                <div className="inline-flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => stepToDetail(-1)}
                    aria-label="Previous detail"
                    className="w-7 h-7 rounded-lg border border-[#e6e2f2] bg-white hover:bg-[#f4f3f8] text-[#161427] flex items-center justify-center text-xs transition-colors cursor-pointer"
                  >
                    ◀
                  </button>
                  <button
                    type="button"
                    onClick={() => stepToDetail(1)}
                    aria-label="Next detail"
                    className="w-7 h-7 rounded-lg border border-[#e6e2f2] bg-white hover:bg-[#f4f3f8] text-[#161427] flex items-center justify-center text-xs transition-colors cursor-pointer"
                  >
                    ▶
                  </button>
                  <span className="text-[13px] text-[#5f5c72] ml-1">
                    Detail {activeDetailIndex + 1} of {stepItems.length}
                  </span>
                </div>
              )}
            </div>

            {/* Primary button */}
            <button
              type="button"
              onClick={handleApprove}
              className="inline-flex items-center justify-center gap-2 h-11 px-7 rounded-xl bg-[#5b46e8] hover:bg-[#4f3bd4] text-white text-[15px] font-semibold shadow-md transition-all active:scale-[0.98] cursor-pointer max-[599px]:w-full max-[599px]:order-3"
            >
              <span>Looks good, write my letter</span>
              <span className="material-symbols-outlined text-[20px]">
                arrow_forward
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ScreenReview;
