import React, { useState } from "react";
import Header from "./Header";

export interface ProcessModalStep {
  readonly label: string;
  readonly meta?: string;
  readonly tag?: string;
  readonly status: "done" | "active" | "upcoming";
}

export interface ProcessModalError {
  readonly title: string;
  readonly subtitle?: string;
  readonly tabNote?: string;
  readonly retryLabel: string;
  readonly onRetry: () => void;
  readonly backLabel: string;
  readonly onBack: () => void;
  readonly details?: string;
}

export interface ProcessModalProps {
  readonly activeStep: 2 | 3;
  readonly title: string;
  readonly titleId: string;
  readonly previewContent: React.ReactNode;
  readonly showScanSweep?: boolean;
  readonly statusLine?: React.ReactNode;
  /** 3-segment progress: 0 = seg1 active, 1 = seg2 active, 2 = seg3 active, 3 = all filled */
  readonly segmentedStep?: 0 | 1 | 2 | 3;
  /** Continuous/indeterminate bar (used by scan modal) */
  readonly barProgress?: {
    readonly indeterminate: boolean;
    readonly percent: number;
    readonly label: string;
  };
  readonly steps: readonly ProcessModalStep[];
  readonly bottomNote: string;
  readonly onCancel: () => void;
  readonly error?: ProcessModalError | null;
  readonly prefersReducedMotion?: boolean;
}

function SparkleStar({ className }: { className?: string }) {
  return (
    <div
      className={`hidden md:flex items-center justify-center w-8 h-8 rounded-full border border-[#5b46e8]/20 bg-[#faf9fe]/70 animate-star-twinkle ${className ?? ""}`}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 2L14.2 9.8L22 12L14.2 14.2L12 22L9.8 14.2L2 12L9.8 9.8L12 2Z"
          fill="#5b46e8"
          fillOpacity="0.65"
        />
      </svg>
    </div>
  );
}

export default function ProcessModal({
  activeStep,
  title,
  titleId,
  previewContent,
  showScanSweep = false,
  statusLine,
  segmentedStep,
  barProgress,
  steps,
  bottomNote,
  onCancel,
  error,
  prefersReducedMotion = false,
}: ProcessModalProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9fe] relative overflow-hidden">
      {/* Screen 1 Background (Faint Grid, Stars, Blurred Letter Snippets) + Light White-Purple Overlay */}
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
              "radial-gradient(ellipse 68% 60% at 50% 50%, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.85) 55%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 68% 60% at 50% 50%, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.85) 55%, transparent 100%)",
          }}
        />
        <div
          className="absolute left-1/2 top-[54%] -translate-x-1/2 -translate-y-1/2 w-[780px] h-[440px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(91, 70, 232, 0.12) 0%, rgba(237, 232, 252, 0.35) 45%, transparent 72%)",
          }}
        />
        <SparkleStar className="absolute top-[192px] left-[192px]" />
        <SparkleStar className="absolute top-[256px] right-[192px] [animation-delay:1.8s]" />
        <SparkleStar className="hidden lg:flex absolute bottom-[128px] left-[256px] [animation-delay:3.2s]" />

        <div className="hidden md:block absolute top-[210px] left-8 xl:left-14 max-w-[235px] font-mono text-[11px] leading-relaxed text-[#5f5c72] opacity-35 blur-[2px]">
          <p>
            Dear{" "}
            <span className="bg-[#ede8fc] text-[#5b46e8] px-1.5 py-0.5 rounded font-semibold">
              [NAME]
            </span>
            ,
          </p>
          <p className="mt-1">
            I am writing about my deposit of ₹45,800 held at{" "}
            <span className="bg-[#ede8fc] text-[#5b46e8] px-1.5 py-0.5 rounded font-semibold">
              [ADDRESS]
            </span>
            .
          </p>
        </div>
        <div className="hidden md:block absolute top-[225px] right-8 xl:right-14 max-w-[235px] font-mono text-[11px] leading-relaxed text-[#5f5c72] opacity-35 blur-[2px]">
          <p>
            Please contact me at{" "}
            <span className="bg-[#ede8fc] text-[#5b46e8] px-1.5 py-0.5 rounded font-semibold">
              [PHONE]
            </span>{" "}
            ref{" "}
            <span className="bg-[#ede8fc] text-[#5b46e8] px-1.5 py-0.5 rounded font-semibold">
              [REF #]
            </span>
          </p>
        </div>

        {/* Light white-purple overlay + subtle backdrop blur */}
        <div className="absolute inset-0 bg-[#faf9fe]/65 backdrop-blur-[3px]" />
      </div>

      {/* Header: minimal */}
      <Header activeStep={activeStep} minimal />

      {/* Centered Modal Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 pt-20 pb-8">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className="w-full max-w-[560px] bg-white rounded-2xl border border-[#e6e2f2] shadow-[0_24px_60px_-15px_rgba(91,70,232,0.14)] p-6 sm:p-8 flex flex-col gap-4"
        >
          {error ? (
            <div className="flex flex-col items-center text-center gap-4 py-2" role="alert">
              <div className="w-12 h-12 rounded-2xl bg-[#fef2f2] border border-[#fecaca] text-[#dc2626] flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">
                  error_outline
                </span>
              </div>

              <div className="flex flex-col gap-1.5 w-full">
                <h1
                  id={titleId}
                  className="text-xl sm:text-2xl font-bold text-[#161427] tracking-tight"
                >
                  {error.title}
                </h1>
                {error.subtitle && (
                  <p className="text-sm text-[#5f5c72] leading-relaxed">
                    {error.subtitle}
                  </p>
                )}
              </div>

              {error.tabNote && (
                <p className="w-full text-xs text-[#78767d] leading-relaxed whitespace-pre-line">
                  {error.tabNote}
                </p>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full pt-2">
                <button
                  type="button"
                  onClick={error.onRetry}
                  className="w-full sm:w-auto px-6 h-12 rounded-xl bg-[#5b46e8] hover:bg-[#4f3bd4] text-white text-sm font-semibold shadow-sm transition-colors cursor-pointer whitespace-nowrap"
                >
                  {error.retryLabel}
                </button>
                <button
                  type="button"
                  onClick={error.onBack}
                  className="text-sm font-medium text-[#5f5c72] hover:text-[#161427] underline underline-offset-4 px-3 py-2 cursor-pointer transition-colors whitespace-nowrap"
                >
                  {error.backLabel}
                </button>
              </div>

              {error.details && (
                <div className="w-full pt-2 border-t border-[#f0edf8] text-left">
                  <button
                    type="button"
                    onClick={() => setShowDetails((v) => !v)}
                    aria-expanded={showDetails}
                    className="text-xs font-medium text-[#78767d] hover:text-[#161427] flex items-center gap-1 mx-auto cursor-pointer"
                  >
                    <span>Details</span>
                    <span className="material-symbols-outlined text-[15px]">
                      {showDetails ? "expand_less" : "expand_more"}
                    </span>
                  </button>
                  {showDetails && (
                    <pre className="mt-2 p-3 rounded-xl bg-[#faf9fe] border border-[#ece8f6] text-[11px] font-mono text-[#5f5c72] whitespace-pre-wrap break-words max-h-32 overflow-y-auto">
                      {error.details}
                    </pre>
                  )}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Title */}
              <h1
                id={titleId}
                className="text-xl sm:text-2xl font-bold text-[#161427] tracking-tight text-center"
              >
                {title}
              </h1>

              {/* Preview Box */}
              <div className="relative rounded-xl bg-[#faf9fe] border border-[#ece8f6] px-4 py-3.5 h-[88px] sm:h-[104px] overflow-hidden flex items-center">
                {showScanSweep && !prefersReducedMotion && (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-transparent via-[#5b46e8]/12 to-transparent animate-scan-sweep z-10"
                  />
                )}
                <div className="relative z-0 w-full">{previewContent}</div>
                <div className="pointer-events-none absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-[#faf9fe] to-transparent z-20" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-5 bg-gradient-to-t from-[#faf9fe] to-transparent z-20" />
              </div>

              {/* Optional status line */}
              {statusLine}

              {/* Progress Bar: 3-segment (Writing) or continuous (Scan) */}
              {segmentedStep !== undefined ? (
                <div
                  className="grid grid-cols-3 gap-1.5"
                  aria-label="Progress"
                >
                  {[0, 1, 2].map((idx) => {
                    const isFilled = idx < segmentedStep;
                    const isActive = idx === segmentedStep;
                    return (
                      <div
                        key={idx}
                        className="relative h-2 rounded-full bg-[#f0edf8] overflow-hidden"
                      >
                        {isFilled && (
                          <div className="h-full w-full bg-[#5b46e8] rounded-full transition-all duration-300" />
                        )}
                        {isActive && (
                          <div
                            className={`h-full w-full rounded-full bg-[#5b46e8]/75 ${
                              prefersReducedMotion ? "" : "animate-pulse"
                            }`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : barProgress ? (
                <div className="flex items-center gap-3">
                  <div className="relative flex-1 h-2 bg-[#f0edf8] rounded-full overflow-hidden">
                    {barProgress.indeterminate ? (
                      <div
                        className={`h-full w-1/3 rounded-full bg-gradient-to-r from-[#5b46e8]/40 via-[#5b46e8] to-[#5b46e8]/40 ${
                          prefersReducedMotion ? "" : "animate-indeterminate-bar"
                        }`}
                      />
                    ) : (
                      <div
                        className="relative h-full bg-[#5b46e8] rounded-full transition-all duration-200 ease-out overflow-hidden"
                        style={{ width: `${barProgress.percent}%` }}
                      >
                        {!prefersReducedMotion && barProgress.percent < 100 && (
                          <span className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-white/40 animate-pulse" />
                        )}
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-[#5b46e8] shrink-0 tabular-nums">
                    {barProgress.label}
                  </span>
                </div>
              ) : null}

              {/* 3-Step Checklist */}
              <ul className="flex flex-col gap-3 py-1" aria-live="polite">
                {steps.map((step, idx) => (
                  <li
                    key={idx}
                    className={`flex items-center justify-between gap-3 text-sm transition-opacity duration-200 ${
                      step.status === "upcoming" ? "opacity-40" : "opacity-100"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {step.status === "done" ? (
                        <span className="w-5 h-5 rounded-full bg-[#5b46e8] text-white flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[14px] font-bold">
                            check
                          </span>
                        </span>
                      ) : step.status === "active" ? (
                        <span className="w-5 h-5 rounded-full bg-[#5b46e8]/15 ring-4 ring-[#5b46e8]/15 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[13px] text-[#5b46e8] animate-spin">
                            progress_activity
                          </span>
                        </span>
                      ) : (
                        <span className="w-5 h-5 rounded-full border-2 border-[#d8d3e8] shrink-0" />
                      )}

                      <span
                        className={`truncate ${
                          step.status === "active"
                            ? "font-semibold text-[#161427]"
                            : step.status === "done"
                              ? "font-medium text-[#47445a]"
                              : "font-normal text-[#78767d]"
                        }`}
                      >
                        {step.label}
                        {step.meta && (
                          <span className="text-xs font-normal text-[#78767d] tabular-nums">
                            {" "}
                            · {step.meta}
                          </span>
                        )}
                      </span>
                    </div>

                    {step.tag && (
                      <span className="text-xs text-[#78767d] shrink-0">
                        {step.tag}
                      </span>
                    )}
                  </li>
                ))}
              </ul>

              {/* Bottom row */}
              <div className="pt-3 border-t border-[#f0edf8] flex items-center justify-between gap-4 text-xs">
                <span className="text-[#78767d]">{bottomNote}</span>
                <button
                  type="button"
                  onClick={onCancel}
                  className="font-medium text-[#5f5c72] hover:text-[#161427] underline underline-offset-4 cursor-pointer shrink-0 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
