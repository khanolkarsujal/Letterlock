import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { classifyDisputeType, type DisputeType } from "../../prompts";
import { useApp } from "../state/AppContext";

const LETTER_HEADINGS: Record<
  DisputeType,
  { title: string; category: string }
> = {
  salary_payment: {
    title: "Salary Payment Demand",
    category: "Employment & Unpaid Salary",
  },
  rental_deposit: {
    title: "Deposit Return Notice",
    category: "Tenancy & Security Deposit",
  },
  refund_dispute: {
    title: "Refund Demand Notice",
    category: "Consumer & Merchant Refund",
  },
  insurance_claim: {
    title: "Insurance Claim Appeal",
    category: "Insurance Coverage Dispute",
  },
  medical_bill: {
    title: "Medical Bill Dispute",
    category: "Healthcare Billing Dispute",
  },
  general_dispute: {
    title: "Formal Dispute Notice",
    category: "Formal Correspondence",
  },
};

export default function ScreenLetter() {
  const {
    triggerToast,
    setShowWipeModal,
    resetAll,
    finalLetter,
    draftResult,
    entities,
    story,
    approvedStory,
    disputeType,
  } = useApp();
  const navigate = useNavigate();
  const [showClearEverythingModal, setShowClearEverythingModal] = useState(false);

  const resolvedDispute = classifyDisputeType(
    approvedStory ?? story,
    disputeType,
  );
  const { title: disputeTitle, category: disputeCategory } =
    LETTER_HEADINGS[resolvedDispute];
  const restoredCountLabel = `${entities.length} ${entities.length === 1 ? "Entity" : "Entities"} Restored on device`;
  const letterPlainContent =
    finalLetter ??
    "No restored letter is available. Return to the review screen.";

  const handleCopy = () => {
    if (!finalLetter) {
      triggerToast("No letter available to copy.");
      return;
    }
    try {
      navigator.clipboard.writeText(letterPlainContent);
    } catch (_e) {
      const ta = document.createElement("textarea");
      ta.value = letterPlainContent;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    triggerToast("Letter copied to clipboard!");
  };

  const handleDownload = () => {
    if (!finalLetter) {
      triggerToast("No letter available to download.");
      return;
    }
    const blob = new Blob([letterPlainContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Letterlock_${resolvedDispute}_letter.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    triggerToast("Dispute letter saved as .txt");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header activeStep={3} />
      <main className="w-full pt-28 pb-16 flex-1">
        <div className="flex flex-col w-full">
          {/* Ambient Glow */}
          <div className="relative w-full max-w-[1240px] mx-auto px-6">
            <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[820px] h-[320px] bg-gradient-to-tr from-[#ede8fc]/60 via-[#f4f3f8]/70 to-[#5b46e8]/10 rounded-full blur-3xl pointer-events-none -z-10" />

            {/* Hero Header */}
            <section className="flex flex-col items-center text-center pt-2 pb-8 max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ede8fc] text-[#5b46e8] shadow-sm mb-4">
                <span className="material-symbols-outlined text-[16px]">task_alt</span>
                <span className="text-xs uppercase tracking-wider font-bold">Formal Dispute Letter Ready</span>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-[40px] font-bold text-[#161427] tracking-tight mb-3">
                Your formal dispute letter is ready to send.
              </h1>
              <p className="text-base text-[#5f5c72] max-w-2xl leading-relaxed mb-6">
                Your personal details never left this computer. Your anonymized draft was generated in the cloud and your real details were restored locally on this device.
              </p>

              {/* Summary Metric Row */}
              <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3 text-left mb-4">
                <div className="p-4 rounded-xl bg-white border border-[#e2dfec]/60 shadow-sm flex flex-col">
                  <span className="text-xs uppercase tracking-wider text-[#5f5c72] mb-1 font-semibold">Letter Type</span>
                  <span className="text-base text-[#161427] font-bold">{disputeTitle}</span>
                  <span className="text-xs text-[#5f5c72] mt-0.5">{disputeCategory}</span>
                </div>
                <div className="p-4 rounded-xl bg-white border border-[#e2dfec]/60 shadow-sm flex flex-col">
                  <span className="text-xs uppercase tracking-wider text-[#5f5c72] mb-1 font-semibold">Privacy Status</span>
                  <div className="flex items-center gap-1.5 text-[#5b46e8] font-bold">
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                    <span className="text-base">100% Private</span>
                  </div>
                  <span className="text-xs text-[#5f5c72] mt-0.5">{restoredCountLabel}</span>
                </div>
                <div className="p-4 rounded-xl bg-white border border-[#e2dfec]/60 shadow-sm flex flex-col">
                  <span className="text-xs uppercase tracking-wider text-[#5f5c72] mb-1 font-semibold">Drafting Model</span>
                  <span className="text-base text-[#161427] font-bold">{draftResult?.modelUsed ?? "Cloud AI"}</span>
                  <span className="text-xs text-[#5b46e8] font-medium mt-0.5">Placeholders verified &amp; restored</span>
                </div>
              </div>
            </section>

            {/* Main Guidance + Letter Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
              {/* Left Column: What to do next */}
              <aside className="lg:col-span-4 flex flex-col gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-[#e2dfec]/60">
                  <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-[#eeedf2]">
                    <div className="w-8 h-8 rounded-full bg-[#ede8fc] text-[#5b46e8] flex items-center justify-center">
                      <span className="material-symbols-outlined text-[18px]">checklist</span>
                    </div>
                    <h2 className="text-base text-[#161427] font-bold">What to do next</h2>
                  </div>
                  <ol className="flex flex-col gap-4">
                    <li className="flex items-start gap-3.5">
                      <span className="w-6 h-6 rounded-full bg-[#161427] text-white text-[12px] font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-[#161427]">Copy or print this letter</span>
                        <p className="text-xs text-[#5f5c72] mt-0.5">Use the one-click copy button below or download the text format for your records.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3.5">
                      <span className="w-6 h-6 rounded-full bg-[#5b46e8] text-white text-[12px] font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-[#161427]">Send to the recipient</span>
                        <p className="text-xs text-[#5f5c72] mt-0.5">Send via email or certified post so you have a clear delivery record.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3.5">
                      <span className="w-6 h-6 rounded-full bg-[#e8e7ec] text-[#161427] text-[12px] font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-[#161427]">Escalate if necessary</span>
                        <p className="text-xs text-[#5f5c72] mt-0.5">If you receive no response by the deadline in your letter, keep this document as part of your formal record.</p>
                      </div>
                    </li>
                  </ol>
                </div>

                <div className="bg-[#f4f3f8] rounded-xl p-5 flex items-start gap-3.5 shadow-sm border border-[#e2dfec]/40">
                  <div className="w-8 h-8 rounded-full bg-[#ede8fc] text-[#5b46e8] flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[19px]">security</span>
                  </div>
                  <div>
                    <h4 className="text-sm text-[#161427] font-bold mb-1">Complete Local Privacy</h4>
                    <p className="text-xs text-[#5f5c72] leading-relaxed">
                      Your name, address, and rental deposit amounts remained strictly on your machine. Original facts securely re-injected on this device.
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#e2dfec]/60 flex flex-col gap-3">
                  <span className="text-xs uppercase tracking-wider text-[#5f5c72] font-semibold">Active Session</span>
                  <p className="text-xs text-[#5f5c72]">Want to generate another letter for a different dispute or vendor?</p>
                  <button
                    className="w-full py-2.5 rounded-full bg-[#f4f3f8] hover:bg-[#e8e7ec] text-[#161427] text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    onClick={() => setShowClearEverythingModal(true)}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[17px]">restart_alt</span>
                    <span>Start Fresh &amp; Clear Session</span>
                  </button>
                </div>
              </aside>

              {/* Right Column: Legal Document Sheet */}
              <section className="lg:col-span-8 flex flex-col gap-6">
                <article className="bg-white rounded-xl p-8 sm:p-12 shadow-md relative overflow-hidden border border-[#e2dfec]/60">
                  <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-[#f4f3f8]/50 flex items-center justify-center pointer-events-none select-none">
                    <span className="material-symbols-outlined text-[90px] text-[#e3e2e7]/60">shield</span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[#eeedf2] mb-6">
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-widest text-[#5b46e8] font-bold mb-1">Formal Letter</span>
                      <h2 className="text-2xl text-[#161427] font-bold tracking-tight">{disputeTitle}</h2>
                      <span className="text-xs text-[#5f5c72] mt-1">{disputeCategory}</span>
                    </div>
                    <div className="flex flex-col sm:text-right">
                      <span className="text-xs uppercase tracking-wider text-[#5f5c72]">Privacy Check</span>
                      <span className="text-sm text-[#5b46e8] font-bold">{restoredCountLabel}</span>
                    </div>
                  </div>

                  {finalLetter ? (
                    <div className="text-[15px] sm:text-base text-[#161427] leading-[1.8] whitespace-pre-wrap">
                      {finalLetter}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-[#fef2f2] border border-[#fee2e2] text-[#8a3d3d] text-sm" role="alert">
                      No restored letter is available. Return to the review screen and approve the story again.
                    </div>
                  )}

                  <div className="mt-10 pt-5 border-t border-[#eeedf2] flex flex-wrap items-center justify-between gap-3 text-[#5f5c72]">
                    <div className="flex items-center gap-2 text-xs text-[#5b46e8] font-semibold">
                      <span className="material-symbols-outlined text-[16px]">verified_user</span>
                      <span>Verified statutory dispute demand format</span>
                    </div>
                    <span className="text-xs text-[#78767d]">100% On-Device Synthesized • Confidential</span>
                  </div>
                </article>

                {/* Bottom Action Bar */}
                <div className="sticky bottom-6 z-30 bg-white/90 backdrop-blur-md rounded-xl p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-[#e2dfec]/60">
                  <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-start flex-wrap">
                    <button
                      className="px-4 py-2.5 rounded-full bg-[#eeedf2] hover:bg-[#e8e7ec] text-[#161427] text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer"
                      onClick={() => setShowWipeModal(true)}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[18px]">restart_alt</span>
                      <span>Start Over</span>
                    </button>
                    <button
                      className="px-4 py-2.5 rounded-full bg-[#f4f3f8] hover:bg-[#eeedf2] text-[#161427] text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!finalLetter}
                      onClick={handleDownload}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[18px] text-[#5b46e8]">download</span>
                      <span>Download .txt</span>
                    </button>
                    <button
                      className="px-4 py-2.5 rounded-full bg-[#f4f3f8] hover:bg-[#eeedf2] text-[#161427] text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!finalLetter}
                      onClick={() => window.print()}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[18px]">print</span>
                      <span>Print Letter</span>
                    </button>
                  </div>

                  <div className="flex flex-col sm:items-end w-full sm:w-auto">
                    <button
                      className="w-full sm:w-auto px-7 py-3 rounded-full bg-[#161427] hover:bg-[#5b46e8] text-white font-bold transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2.5 group cursor-pointer text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#161427]"
                      disabled={!finalLetter}
                      onClick={handleCopy}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[20px] transition-transform group-hover:scale-110">content_copy</span>
                      <span>Copy Full Letter</span>
                    </button>
                    <span className="text-xs text-[#5f5c72] mt-1 text-center sm:text-right">One-click copy to clipboard ready to send</span>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
      {/* Footer rendered globally in App.tsx */}

      {/* Clear Everything Modal (screen-local state) */}
      {showClearEverythingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#161427]/40 backdrop-blur-md">
          <div className="relative w-full max-w-[520px] bg-white rounded-3xl p-8 shadow-2xl flex flex-col gap-5">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-[#fee2e2] text-[#dc2626] flex items-center justify-center shadow-sm flex-shrink-0">
                <span className="material-symbols-outlined text-[24px]">delete_sweep</span>
              </div>
              <button
                className="w-9 h-9 rounded-full bg-[#f4f3f8] hover:bg-[#e8e7ec] text-[#5f5c72] flex items-center justify-center transition-all"
                onClick={() => setShowClearEverythingModal(false)}
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#fee2e2] text-[#dc2626] text-xs font-bold uppercase tracking-wide">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#dc2626] animate-ping" />
                  Permanent Action
                </span>
              </div>
              <h2 className="text-2xl font-bold text-[#161427] tracking-tight mt-1">
                Start over and clear everything?
              </h2>
            </div>

            <p className="text-sm text-[#5f5c72] leading-relaxed">
              This will permanently clear your story, all detected private details, and your generated dispute letter from this computer's active memory.
            </p>

            <div className="bg-[#f4f3f8] rounded-2xl p-5 flex flex-col gap-3">
              <span className="text-xs font-bold text-[#161427]">What happens when you clear:</span>
              <ul className="space-y-2.5">
                <li className="flex items-start gap-2.5 text-xs text-[#5f5c72]">
                  <span className="material-symbols-outlined text-[#5b46e8] text-[18px] shrink-0 mt-0.5">lock_reset</span>
                  <span>Your story and letter will be erased immediately</span>
                </li>
                <li className="flex items-start gap-2.5 text-xs text-[#5f5c72]">
                  <span className="material-symbols-outlined text-[#5b46e8] text-[18px] shrink-0 mt-0.5">shield</span>
                  <span>Nothing is saved in the cloud, database, or cookies</span>
                </li>
                <li className="flex items-start gap-2.5 text-xs text-[#5f5c72]">
                  <span className="material-symbols-outlined text-[#5b46e8] text-[18px] shrink-0 mt-0.5">history_edu</span>
                  <span>You will return to Step 1 with a clean, blank slate</span>
                </li>
              </ul>
            </div>

            <div className="bg-[#ede8fc] rounded-2xl p-4 flex items-start gap-3">
              <span className="material-symbols-outlined text-[#5b46e8] text-[20px] shrink-0 mt-0.5">tips_and_updates</span>
              <p className="text-xs text-[#35159b] font-medium leading-relaxed">
                <strong>Tip:</strong> If you need to keep your dispute letter, make sure you've copied or downloaded it before clearing.
              </p>
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-3">
              <button
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-white text-[#161427] hover:bg-[#f4f3f8] text-xs font-bold transition-all shadow-sm"
                onClick={() => setShowClearEverythingModal(false)}
                type="button"
              >
                Cancel
              </button>
              <button
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#dc2626] hover:bg-[#b91c1c] text-white text-xs font-bold transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                onClick={() => {
                  resetAll();
                  setShowClearEverythingModal(false);
                  navigate("/");
                }}
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">delete_forever</span>
                <span>Clear everything &amp; start over</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
