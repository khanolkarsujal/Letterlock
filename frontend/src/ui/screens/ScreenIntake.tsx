import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { useApp } from "../state/AppContext";
import { exampleSalaryStory } from "../state/mockData";

const CATEGORY_TABS = [
  { id: "deposit", label: "Deposit dispute" },
  { id: "insurance", label: "Insurance claim" },
  { id: "medical", label: "Medical bill" },
  { id: "other", label: "Other" },
] as const;

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

function ScreenIntake() {
  const { story, setStory, disputeType, setDisputeType, detectStory } =
    useApp();
  const navigate = useNavigate();
  const hasStory = story.trim().length > 0;

  const handleInspect = () => {
    if (!hasStory) return;
    void detectStory(story);
    navigate("/scan");
  };

  const handleTryExample = () => {
    setStory(exampleSalaryStory);
    setDisputeType("other");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9fe] relative overflow-hidden">
      {/* Decorative Background Layer */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
      >
        {/* 1. Faint 64px Grid with radial mask (cleaner behind center, softer at edges) */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(91, 70, 232, 0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(91, 70, 232, 0.06) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage:
              "radial-gradient(ellipse 68% 60% at 50% 50%, rgba(0,0,0,0.14) 0%, rgba(0,0,0,0.85) 55%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 68% 60% at 50% 50%, rgba(0,0,0,0.14) 0%, rgba(0,0,0,0.85) 55%, transparent 100%)",
          }}
        />

        {/* 4. Soft Purple Glow behind the card */}
        <div
          className="absolute left-1/2 top-[56%] -translate-x-1/2 -translate-y-1/2 w-[780px] h-[440px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(91, 70, 232, 0.09) 0%, rgba(237, 232, 252, 0.28) 45%, transparent 72%)",
          }}
        />

        {/* 2. Sparkle Stars at grid intersections */}
        <SparkleStar className="absolute top-[192px] left-[192px]" />
        <SparkleStar className="absolute top-[256px] right-[192px] [animation-delay:1.8s]" />
        <SparkleStar className="hidden lg:flex absolute bottom-[128px] left-[256px] [animation-delay:3.2s]" />

        {/* Corner Labels (Firecrawl-style, purple/gray only) */}
        <span className="hidden md:inline-block absolute top-28 left-10 font-mono text-[11px] tracking-wider text-[#9b96b0]/70">
          [ LOCAL ]
        </span>
        <span className="hidden md:inline-block absolute top-28 right-10 font-mono text-[11px] tracking-wider text-[#9b96b0]/70">
          [ ON-DEVICE ]
        </span>
        <span className="hidden md:inline-block absolute bottom-10 left-10 font-mono text-[11px] tracking-wider text-[#9b96b0]/70">
          [ PLACEHOLDER ]
        </span>
        <span className="hidden md:inline-block absolute bottom-10 right-10 font-mono text-[11px] tracking-wider text-[#9b96b0]/70">
          [ REDACTED ]
        </span>

        {/* 3. Blurred Monospace Letter Snippets in margins & corners */}
        <div className="hidden md:block absolute top-[210px] left-8 xl:left-14 max-w-[235px] font-mono text-[11px] leading-relaxed text-[#5f5c72] opacity-40 blur-[2px] animate-slow-drift">
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
          <div className="mt-2 flex items-center gap-1.5">
            <span className="inline-block h-2 w-16 rounded-full bg-[#e3e2e7]" />
            <span className="inline-block h-2 w-10 rounded-full bg-[#e3e2e7]" />
          </div>
        </div>

        <div className="hidden md:block absolute top-[225px] right-8 xl:right-14 max-w-[235px] font-mono text-[11px] leading-relaxed text-[#5f5c72] opacity-40 blur-[2px] animate-slow-drift [animation-delay:4s]">
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
          <div className="mt-2 flex items-center gap-1.5">
            <span className="inline-block h-2 w-20 rounded-full bg-[#e3e2e7]" />
            <span className="inline-block h-2 w-12 rounded-full bg-[#e3e2e7]" />
          </div>
        </div>

        <div className="hidden lg:block absolute bottom-[105px] left-10 xl:left-16 max-w-[230px] font-mono text-[11px] leading-relaxed text-[#5f5c72] opacity-35 blur-[2.5px] animate-slow-drift [animation-delay:8s]">
          <p>
            Account{" "}
            <span className="bg-[#ede8fc] text-[#5b46e8] px-1.5 py-0.5 rounded font-semibold">
              [ACCOUNT]
            </span>{" "}
            dated{" "}
            <span className="bg-[#ede8fc] text-[#5b46e8] px-1.5 py-0.5 rounded font-semibold">
              [DATE]
            </span>
          </p>
          <div className="mt-2 flex items-center gap-1.5">
            <span className="inline-block h-2 w-24 rounded-full bg-[#e3e2e7]" />
          </div>
        </div>

        <div className="hidden lg:block absolute bottom-[105px] right-10 xl:right-16 max-w-[230px] font-mono text-[11px] leading-relaxed text-[#5f5c72] opacity-35 blur-[2.5px] animate-slow-drift [animation-delay:12s]">
          <p>
            Notice to{" "}
            <span className="bg-[#ede8fc] text-[#5b46e8] px-1.5 py-0.5 rounded font-semibold">
              [ORGANIZATION]
            </span>
          </p>
          <div className="mt-2 flex items-center gap-1.5">
            <span className="inline-block h-2 w-14 rounded-full bg-[#e3e2e7]" />
            <span className="inline-block h-2 w-16 rounded-full bg-[#e3e2e7]" />
          </div>
        </div>
      </div>

      <Header activeStep={1} minimal />

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 pt-24 pb-8">
        <div className="w-full max-w-[720px] mx-auto flex flex-col items-center text-center">
          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold text-[#161427] tracking-tight leading-[1.08]">
            Write the letter.
            <br />
            <span className="text-[#5b46e8]">Keep the details.</span>
          </h1>

          {/* One-line Subtitle */}
          <p className="mt-4 mb-7 text-sm sm:text-base text-[#5f5c72] max-w-lg [text-wrap:balance] leading-relaxed">
            Turn your messy story into a firm letter. Your real name and address never leave your device.
          </p>

          {/* Floating Input Card */}
          <div className="w-full bg-white rounded-2xl border border-[#e6e2f2] shadow-[0_14px_44px_-12px_rgba(22,20,39,0.09)] focus-within:ring-4 focus-within:ring-[#5b46e8]/15 focus-within:border-[#5b46e8]/40 transition-all overflow-hidden text-left">
            <textarea
              id="story-input"
              aria-label="Your dispute story"
              value={story}
              onChange={(e) => setStory(e.target.value)}
              placeholder="Paste what happened, with real names and numbers. We'll hide them next."
              rows={8}
              className="w-full bg-transparent border-0 focus:ring-0 px-5 pt-5 pb-3 text-[15px] text-[#161427] placeholder-[#9b96b0] focus:outline-none resize-none leading-relaxed min-h-[210px]"
            />

            {/* Bottom Row Inside Card */}
            <div className="px-4 py-3 border-t border-[#f0edf8] bg-[#fcfbfe] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div
                className="flex flex-wrap items-center gap-1 bg-[#f4f3f8] p-1 rounded-xl"
                role="tablist"
                aria-label="Letter category"
              >
                {CATEGORY_TABS.map((tab) => {
                  const active = disputeType === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setDisputeType(tab.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        active
                          ? "bg-white text-[#161427] font-semibold shadow-sm"
                          : "text-[#6b6684] hover:text-[#161427]"
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                disabled={!hasStory}
                onClick={handleInspect}
                className="px-5 py-2.5 rounded-xl bg-[#5b46e8] hover:bg-[#4f3bd4] text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-sm shrink-0 cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed disabled:hover:bg-[#5b46e8]"
              >
                <span>Find private details</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </div>

          {/* Try an example link */}
          <button
            type="button"
            onClick={handleTryExample}
            className="mt-4 text-xs sm:text-[13px] font-medium text-[#5b46e8] hover:text-[#4f3bd4] underline underline-offset-4 cursor-pointer transition-colors"
          >
            Try an example
          </button>

          {/* Single privacy line */}
          <p className="mt-2.5 text-xs text-[#78767d]">
            Your real details stay on this device. Only placeholders go to the AI.
          </p>
        </div>
      </main>
    </div>
  );
}

export default ScreenIntake;
