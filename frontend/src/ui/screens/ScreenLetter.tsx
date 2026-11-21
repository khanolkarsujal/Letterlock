import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { useApp } from "../state/AppContext";

export default function ScreenLetter() {
  const { triggerToast, setShowWipeModal } = useApp();
  const navigate = useNavigate();
  const [showClearEverythingModal, setShowClearEverythingModal] = useState(false);

  const letterPlainContent = `12 October 2026

To: Mr Rao
Landlord / Property Representative
14 Oak Street
Contact: 98765 43210
Lease Reference: LS-20418

Regarding: Formal Legal Demand: Immediate & Full Return of Security Deposit (£1,200.00)

Dear Mr Rao,

I am writing to formally demand the immediate return of my rental security deposit in the amount of £1,200.00, which has been unlawfully withheld following the lawful termination of my tenancy at 14 Oak Street on 3 June.

Despite multiple attempts to contact you via telephone (98765 43210) and written messages regarding lease reference LS-20418, I have received no response, itemized deduction statement, or accounting of funds. Under applicable residential landlord-tenant statutory regulations, a landlord is obligated to return the security deposit in full or provide an itemized statement of lawful deductions within the statutory deadline.

Because that statutory deadline has elapsed without explanation, notice, or return of funds, the retention of my £1,200.00 deposit constitutes an improper withholding under applicable state tenancy law.

Please accept this letter as formal legal demand for the full return of £1,200.00 within seven (7) business days of receipt of this notice. If payment is not received in full by 19 October 2026, I reserve all statutory rights to initiate formal small claims proceedings, including claims for statutory damages, court filing costs, and applicable statutory interest.

Sincerely,
Priya Sharma
Former Tenant, Tenancy Reference LS-20418`;

  const handleCopy = () => {
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
    const blob = new Blob([letterPlainContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Letterlock_Deposit_Dispute_Priya_Sharma.txt";
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
                Your personal details never left this computer. It turns this stressful dispute into a firm, legally backed notice demanding the return of your{" "}
                <strong className="text-[#161427] font-semibold">£1,200.00</strong> deposit with an enforceable statutory deadline.
              </p>

              {/* Summary Metric Row */}
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-left mb-4">
                <div className="p-4 rounded-xl bg-white border border-[#e2dfec]/60 shadow-sm flex flex-col">
                  <span className="text-xs uppercase tracking-wider text-[#5f5c72] mb-1 font-semibold">Disputed Amount</span>
                  <span className="text-2xl text-[#5b46e8] font-bold">£1,200.00</span>
                  <span className="text-xs text-[#5f5c72] mt-0.5">Full deposit balance</span>
                </div>
                <div className="p-4 rounded-xl bg-white border border-[#e2dfec]/60 shadow-sm flex flex-col">
                  <span className="text-xs uppercase tracking-wider text-[#5f5c72] mb-1 font-semibold">Recipient</span>
                  <span className="text-base text-[#161427] font-bold">Mr Rao</span>
                  <span className="text-xs text-[#5f5c72] mt-0.5">Landlord / Representative</span>
                </div>
                <div className="p-4 rounded-xl bg-white border border-[#e2dfec]/60 shadow-sm flex flex-col">
                  <span className="text-xs uppercase tracking-wider text-[#5f5c72] mb-1 font-semibold">Statutory Deadline</span>
                  <span className="text-base text-[#161427] font-bold">19 October 2026</span>
                  <span className="text-xs text-[#5b46e8] font-medium mt-0.5">7 Business Days</span>
                </div>
                <div className="p-4 rounded-xl bg-white border border-[#e2dfec]/60 shadow-sm flex flex-col">
                  <span className="text-xs uppercase tracking-wider text-[#5f5c72] mb-1 font-semibold">Privacy Status</span>
                  <div className="flex items-center gap-1.5 text-[#5b46e8] font-bold">
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                    <span className="text-base">100% Private</span>
                  </div>
                  <span className="text-xs text-[#5f5c72] mt-0.5">7 Entities Restored on device</span>
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
                        <span className="text-sm font-bold text-[#161427]">Send to your landlord</span>
                        <p className="text-xs text-[#5f5c72] mt-0.5">Send via email or certified post to Mr Rao so you have an undeniable receipt timestamp.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3.5">
                      <span className="w-6 h-6 rounded-full bg-[#e8e7ec] text-[#161427] text-[12px] font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-[#161427]">Escalate if necessary</span>
                        <p className="text-xs text-[#5f5c72] mt-0.5">If no response by 19 October 2026, file directly with small claims court using this formal document as evidence.</p>
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

                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-8 border-b border-[#eeedf2] mb-8">
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-widest text-[#5b46e8] font-bold mb-1">Formal Legal Notice</span>
                      <h2 className="text-2xl text-[#161427] font-bold tracking-tight">Deposit Return Notice</h2>
                      <span className="text-xs text-[#5f5c72] mt-1">Pursuant to Statutory Residential Landlord-Tenant Provisions</span>
                    </div>
                    <div className="flex flex-col sm:text-right">
                      <span className="text-xs uppercase tracking-wider text-[#5f5c72]">Date Issued</span>
                      <span className="text-base text-[#161427] font-bold">12 October 2026</span>
                      <span className="text-xs text-[#5f5c72] mt-0.5">
                        Ref: <span className="font-bold text-[#161427]">LS-20418</span>
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-5 rounded-lg bg-[#f4f3f8] mb-8">
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-wider text-[#5f5c72] mb-1 font-semibold">To Landlord / Agent:</span>
                      <span className="text-base text-[#161427] font-bold">Mr Rao</span>
                      <span className="text-xs text-[#5f5c72] mt-0.5">Phone: 98765 43210</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-wider text-[#5f5c72] mb-1 font-semibold">Rental Property:</span>
                      <span className="text-base text-[#161427] font-bold">14 Oak Street</span>
                      <span className="text-xs text-[#5f5c72] mt-0.5">
                        Disputed Sum: <strong className="text-[#5b46e8] font-bold">£1,200.00</strong>
                      </span>
                      <span className="text-xs text-[#5f5c72]">Vacated: 3 June</span>
                    </div>
                  </div>

                  <div className="mb-8">
                    <span className="text-xs uppercase tracking-wider text-[#5f5c72] block mb-1">Subject</span>
                    <div className="p-3.5 rounded-lg bg-[#ede8fc]/50 text-[#161427] font-bold text-base">
                      Formal Legal Demand: Immediate &amp; Full Return of Security Deposit (<span className="text-[#5b46e8]">£1,200.00</span>)
                    </div>
                  </div>

                  <div className="space-y-5 text-base text-[#161427] leading-relaxed">
                    <p>Dear Mr Rao,</p>
                    <p>
                      I am writing to formally demand the immediate return of my rental security deposit in the amount of{" "}
                      <strong className="font-bold text-[#5b46e8]">£1,200.00</strong>, which has been unlawfully withheld following the lawful termination of my tenancy at{" "}
                      <strong>14 Oak Street</strong> on <strong>3 June</strong>.
                    </p>
                    <p>
                      Despite multiple attempts to contact you via telephone (98765 43210) and written notices regarding lease reference{" "}
                      <strong className="text-[#161427]">LS-20418</strong>, I have received no response, itemized deduction statement, or accounting of funds. Under applicable residential landlord-tenant regulations, statutory deposit protections require prompt return or formal justification within 10 days.
                    </p>
                    <p>
                      Because that statutory deadline has elapsed without explanation, notice, or return of funds, the retention of my{" "}
                      <strong className="text-[#5b46e8]">£1,200.00</strong> deposit constitutes an improper withholding under applicable state tenancy law.
                    </p>
                    <p>
                      Please accept this letter as formal legal notice that payment of{" "}
                      <strong className="text-[#5b46e8] font-bold">£1,200.00</strong> is required within seven (7) business days. If payment is not received in full by{" "}
                      <strong className="text-[#161427]">19 October 2026</strong>, I reserve all statutory rights to initiate formal small claims proceedings, including claims for statutory penalties and court filing costs.
                    </p>
                    <div className="pt-6 mt-6 border-t border-[#eeedf2] flex flex-col gap-1">
                      <span className="text-sm text-[#5f5c72]">Sincerely,</span>
                      <span className="text-base text-[#161427] font-bold tracking-tight">Priya Sharma</span>
                      <span className="text-xs text-[#5f5c72]">Former Tenant, Tenancy Reference LS-20418</span>
                    </div>
                  </div>

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
                      className="px-4 py-2.5 rounded-full bg-[#f4f3f8] hover:bg-[#eeedf2] text-[#161427] text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer"
                      onClick={handleDownload}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[18px] text-[#5b46e8]">download</span>
                      <span>Download .txt</span>
                    </button>
                    <button
                      className="px-4 py-2.5 rounded-full bg-[#f4f3f8] hover:bg-[#eeedf2] text-[#161427] text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer"
                      onClick={() => window.print()}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[18px]">print</span>
                      <span>Print Letter</span>
                    </button>
                  </div>

                  <div className="flex flex-col sm:items-end w-full sm:w-auto">
                    <button
                      className="w-full sm:w-auto px-7 py-3 rounded-full bg-[#161427] hover:bg-[#5b46e8] text-white font-bold transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2.5 group cursor-pointer text-sm"
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
