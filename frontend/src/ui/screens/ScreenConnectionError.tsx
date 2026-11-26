import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { CLOUD_TIMEOUT_SECONDS } from "../../inference/cloudDrafting";
import { useApp } from "../state/AppContext";

export default function ScreenConnectionError() {
  const navigate = useNavigate();
  const { startCloudDraft, draftError, entities } = useApp();
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    const success = await startCloudDraft();
    setIsRetrying(false);
    navigate(success ? "/letter" : "/connection-error");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header activeStep={3} />
      <main className="w-full pt-24 pb-16 flex-1">
        <div className="max-w-4xl mx-auto px-6 flex flex-col gap-8">
          {/* Alert Card */}
          <div className="rounded-3xl bg-white border border-[#eae6f4] p-8 md:p-10 shadow-[0_4px_24px_rgba(22,20,39,0.04)] relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-start justify-between gap-6 relative z-10">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#fef2f2] border border-[#fee2e2] flex items-center justify-center shrink-0 text-[#ef4444]">
                  <span className="material-symbols-outlined text-[26px]">wifi_off</span>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#fef2f2] text-[#ef4444] text-[11px] font-bold tracking-wide uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]" /> Connection Paused
                  </div>
                  <h1 className="text-[26px] md:text-[30px] font-bold text-[#161427] tracking-tight leading-tight">
                    We couldn’t reach the letter formatting service
                  </h1>
                  <p className="text-[15px] leading-relaxed text-[#5f5c72] max-w-2xl">
                    Your story and personal details are completely safe on this device. Nothing was leaked or exposed. We only attempted to send your anonymized placeholder text.
                  </p>
                  {draftError && (
                    <p className="text-[13px] font-semibold text-[#ef4444]" role="alert">
                      {draftError}
                    </p>
                  )}
                </div>
              </div>
              <div className="shrink-0 hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f5f3ff] border border-[#ddd6fe] text-[12px] font-semibold text-[#5b46e8]">
                <span className="material-symbols-outlined text-[16px]">verified_user</span>
                <span>0 Private Bytes Sent</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-8 relative z-10">
              <div className="p-4 rounded-2xl bg-[#faf9fe] border border-[#eae6f4] flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[#78767d] text-[11px] font-bold uppercase tracking-wider">
                  <span>What was sent</span>
                  <span className="material-symbols-outlined text-[16px] text-[#5b46e8]">token</span>
                </div>
                <div className="text-[14px] font-bold text-[#161427]">Anonymized tags only</div>
                <div className="text-[12px] text-[#78767d]">No names, dates, or addresses</div>
              </div>
              <div className="p-4 rounded-2xl bg-[#faf9fe] border border-[#eae6f4] flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[#78767d] text-[11px] font-bold uppercase tracking-wider">
                  <span>Your private details</span>
                  <span className="material-symbols-outlined text-[16px] text-[#5b46e8]">verified</span>
                </div>
                <div className="text-[14px] font-bold text-[#161427]">100% Protected</div>
                <div className="text-[12px] text-[#78767d]">Safe in your device memory</div>
              </div>
              <div className="p-4 rounded-2xl bg-[#faf9fe] border border-[#eae6f4] flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[#78767d] text-[11px] font-bold uppercase tracking-wider">
                  <span>Attempt status</span>
                  <span className="material-symbols-outlined text-[16px] text-[#ef4444]">schedule</span>
                </div>
                <div className="text-[14px] font-bold text-[#161427]">Timed out after {CLOUD_TIMEOUT_SECONDS}s</div>
                <div className="text-[12px] text-[#78767d]">Cloud server took too long</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mt-8 pt-6 border-t border-[#eae6f4] relative z-10">
              <div className="flex items-center gap-3">
                <button
                  className="px-6 py-3 rounded-full bg-[#161427] text-white hover:bg-[#25223e] active:scale-[0.98] transition-all text-[14px] font-semibold flex items-center justify-center gap-2 shadow-sm"
                  disabled={isRetrying}
                  onClick={handleRetry}
                >
                  <span className={`material-symbols-outlined text-[18px] ${isRetrying ? "animate-spin" : ""}`}>refresh</span>
                  <span>{isRetrying ? "Retrying anonymous draft..." : "Try again →"}</span>
                </button>
                <button
                  className="px-5 py-3 rounded-full border border-[#eae6f4] bg-white text-[#161427] hover:bg-[#f4f3f8] transition-colors text-[14px] font-semibold flex items-center justify-center gap-2"
                  onClick={() => navigate("/review")}
                >
                  ← Back to review
                </button>
              </div>
              <div className="flex items-center gap-2 text-[12px] text-[#78767d]">
                <span className="material-symbols-outlined text-[16px] text-[#5b46e8] shrink-0">lock</span>
                <span>Try again will resend only the approved anonymous placeholders. Never raw personal data.</span>
              </div>
            </div>
          </div>

          {/* Memory Preservation Box */}
          <div className="rounded-3xl bg-white border border-[#eae6f4] p-8 shadow-[0_4px_24px_rgba(22,20,39,0.04)] flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#f5f3ff] border border-[#ddd6fe] text-[#5b46e8] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">inventory_2</span>
                </div>
                <h2 className="text-[17px] font-bold text-[#161427]">Your story and details are preserved in memory</h2>
              </div>
              <span className="self-start md:self-auto px-3 py-1 rounded-full bg-[#f5f3ff] border border-[#ddd6fe] text-[#5b46e8] text-[12px] font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#5b46e8]" />
                {entities.length} {entities.length === 1 ? "Redaction" : "Redactions"} Ready
              </span>
            </div>
            <p className="text-[13px] text-[#5f5c72] leading-relaxed">
              {entities.length > 0
                ? "When the service responds or you choose to export, your private details will seamlessly merge back into the letter on your computer."
                : "No private redactions are currently in memory. If you refreshed the tab, start from Step 1 to re-enter your story."}
            </p>
            {entities.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {entities.map((entity) => (
                  <div key={entity.id} className="p-3 rounded-xl bg-[#faf9fe] border border-[#eae6f4] flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-[#f5f3ff] text-[#5b46e8] font-mono text-[11px] font-semibold">{`{${entity.token}}`}</span>
                    <span className="text-[12px] font-medium text-[#161427] truncate max-w-[120px]">{entity.text}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="p-3.5 rounded-2xl bg-[#f5f3ff] border border-[#ddd6fe] flex items-center gap-3 text-[12px] text-[#5b46e8]">
              <span className="material-symbols-outlined text-[18px] shrink-0">info</span>
              <span>Leaving or refreshing this tab will permanently clear everything from your computer.</span>
            </div>
          </div>
        </div>
      </main>
      {/* Footer is rendered globally in App.tsx */}
    </div>
  );
}
