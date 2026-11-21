import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

export default function ScreenGenerating() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/letter");
    }, 4000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header activeStep={3} />
      <main className="w-full pt-28 pb-16 flex-1">
        <div className="max-w-[1240px] w-full mx-auto px-6 flex flex-col gap-10">
          {/* Hero */}
          <section className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#ede8fc] text-[#5b46e8] text-[12px] font-bold tracking-wide uppercase shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#5b46e8] animate-ping" />
              <span>STEP 4: CREATING YOUR FORMAL DISPUTE LETTER</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-[42px] font-bold text-[#161427] tracking-tight leading-tight">
              Writing your formal letter.<br className="hidden sm:inline" />
              <span className="text-[#5b46e8]"> Without exposing your private details.</span>
            </h1>
            <p className="text-[15px] sm:text-[16px] text-[#78767d] max-w-2xl leading-relaxed">
              Our AI is transforming your dispute into a firm, legally structured letter. Only safe placeholder tags were shared—your real names, addresses, and numbers stay safely locked on this computer.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#ece8f6] text-[13px] text-[#161427] font-medium shadow-sm">
                <span className="material-symbols-outlined text-[#5b46e8] text-[16px]">lock</span>
                <span>Names &amp; addresses hidden</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#ece8f6] text-[13px] text-[#161427] font-medium shadow-sm">
                <span className="material-symbols-outlined text-[#5b46e8] text-[16px]">no_accounts</span>
                <span>Zero sign-up or accounts</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#ece8f6] text-[13px] text-[#161427] font-medium shadow-sm">
                <span className="material-symbols-outlined text-[#5b46e8] text-[16px]">desktop_windows</span>
                <span>Restored on your device</span>
              </div>
            </div>
          </section>

          {/* Progress Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Drafting Preview */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-[#ece8f6] shadow-sm flex flex-col gap-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#ede8fc] text-[#5b46e8] flex items-center justify-center">
                      <span className="material-symbols-outlined text-[20px] animate-spin">autorenew</span>
                    </div>
                    <h2 className="text-[19px] font-bold text-[#161427] tracking-tight">Live Letter Drafting</h2>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#ede8fc] text-[#5b46e8] font-bold text-[12px] shadow-sm">
                    Writing draft (72%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-[#f4f3f8] rounded-full overflow-hidden p-0.5">
                  <div className="h-full bg-gradient-to-r from-[#5b46e8] to-[#7c3aed] rounded-full w-[72%] transition-all duration-700 ease-out shadow-sm shadow-[#5b46e8]/20" />
                </div>
              </div>

              <div className="bg-[#faf9fe] rounded-2xl p-6 sm:p-7 border border-[#ece8f6] shadow-inner font-sans relative overflow-hidden">
                <div className="flex items-center justify-between pb-4 border-b border-[#ece8f6]/80 text-[12px] font-medium text-[#78767d]">
                  <span className="font-semibold uppercase tracking-wider text-[#161427] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-[#5b46e8]">description</span>
                    Formal Dispute Notice
                  </span>
                  <span className="inline-flex items-center gap-1 text-[#5b46e8] bg-white px-2 py-0.5 rounded border border-[#ece8f6] text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#5b46e8] animate-pulse" />
                    Generating line-by-line
                  </span>
                </div>
                <div className="space-y-3 pt-4 text-[14px] leading-relaxed text-[#161427]/90">
                  <div className="text-[#78767d] text-[13px] space-y-1">
                    <p>
                      TO: <span className="bg-[#5b46e8] text-white px-2 py-0.5 rounded-md text-[12px] font-semibold">{`{Person B}`}</span>
                    </p>
                    <p>
                      REGARDING: Residential Tenancy at <span className="bg-[#5b46e8] text-white px-2 py-0.5 rounded-md text-[12px] font-semibold">{`{Address 1}`}</span>
                    </p>
                  </div>
                  <p className="font-semibold text-[#161427] pt-2">
                    RE: Formal Demand for Return of Security Deposit
                  </p>
                  <p className="text-[#47464c]">
                    Please treat this letter as a formal legal notice requesting the prompt refund of my rental deposit totaling
                    <span className="inline-block bg-[#5b46e8] text-white px-2 py-0.5 rounded-md text-[12px] font-semibold">{`{Amount 1}`}</span>. 
                    The tenancy concluded on
                    <span className="inline-block bg-[#5b46e8] text-white px-2 py-0.5 rounded-md text-[12px] font-semibold">{`{Date 1}`}</span> 
                    with keys returned and a signed handover checklist confirming property was left clean and intact.
                  </p>
                  <p className="text-[#47464c]">
                    Under local tenancy regulations, statutory deposit protections require written justification and prompt release within 10 days. I request written confirmation of the transfer initiation to my account
                    <span className="inline-block w-1.5 h-4 bg-[#5b46e8] ml-1 align-middle animate-pulse" />
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 pt-1">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#faf9fe] border border-[#ece8f6]">
                  <span className="material-symbols-outlined text-[#5b46e8] text-[20px]">check_circle</span>
                  <div className="flex-1">
                    <span className="text-[13px] font-semibold text-[#161427]">Private details replaced with safe tags</span>
                    <span className="text-[12px] text-[#78767d] block">Completed on your device</span>
                  </div>
                  <span className="text-[11px] font-bold text-[#5b46e8] bg-white px-2.5 py-0.5 rounded-full border border-[#ede8fc]">Protected</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#ede8fc]/60 border border-[#5b46e8]/30">
                  <span className="material-symbols-outlined text-[#5b46e8] text-[20px] animate-spin">autorenew</span>
                  <div className="flex-1">
                    <span className="text-[13px] font-bold text-[#161427]">Writing firm, persuasive legal dispute draft</span>
                    <span className="text-[12px] text-[#5b46e8] font-medium block">Currently running in cloud using safe placeholders</span>
                  </div>
                  <span className="text-[11px] font-bold text-white bg-[#5b46e8] px-2.5 py-0.5 rounded-full shadow-sm">In Progress</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-[#ece8f6] opacity-75">
                  <span className="material-symbols-outlined text-[#c9c5cd] text-[20px]">radio_button_unchecked</span>
                  <div className="flex-1">
                    <span className="text-[13px] font-semibold text-[#78767d]">Restoring your real name and numbers</span>
                    <span className="text-[12px] text-[#78767d] block">Up next automatically on your device</span>
                  </div>
                  <span className="text-[11px] font-medium text-[#78767d] bg-[#f4f3f8] px-2.5 py-0.5 rounded-full">Next step</span>
                </div>
              </div>
            </div>

            {/* Right: Privacy Mascot & Protected Info */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="bg-gradient-to-br from-white via-[#faf9fe] to-[#ede8fc]/40 rounded-3xl p-6 border border-[#ece8f6] shadow-sm flex flex-col items-center text-center relative overflow-hidden">
                <div className="w-36 h-36 mb-2 rounded-2xl overflow-hidden flex items-center justify-center p-1 bg-white/70 shadow-sm border border-[#ece8f6] animate-gentle-pulse">
                  <img
                    alt="Letterlock Guardian Shield Mascot"
                    className="w-full h-full object-contain"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDGzt37hDeBFxcmlZq5-qO59eHSmA-8r_zsPV73YyrV2snjKxWH_jIq5sOk824GZRiPr1bq6oftWTs2O8c-NWFIraWETKiUwxjYX--OmGJ6Ud4Ri7wcN-v6B_1Zpe3TNV1Y_2ONg2MF4M30c8tSe1beRrJzZ7hsa7yocrPEAphDJw9Hv1VTb8E1fI9wTXfyW4DZpqQXGYK0nwyIzv9Ap07m7JL0Wgjb6Wyn_BcGb5P8tvSZeWbLNteUpA"
                  />
                </div>
                <h3 className="text-[18px] font-bold text-[#161427]">Letterlock Privacy Guardian</h3>
                <p className="text-[13px] text-[#78767d] mt-1 max-w-xs">
                  Guarding your identity locally while leveraging world-class AI writing.
                </p>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-[#ece8f6] shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-[#ece8f6] pb-3">
                  <h3 className="text-[16px] font-bold text-[#161427] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#5b46e8] text-[20px]">verified_user</span>
                    What stayed on your computer
                  </h3>
                  <span className="text-[11px] font-bold text-[#5b46e8] bg-[#ede8fc] px-2.5 py-0.5 rounded-full">4 Locked</span>
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#faf9fe] border border-[#ece8f6]">
                    <div className="flex flex-col">
                      <span className="text-[11px] uppercase font-bold text-[#78767d] tracking-wider">Tenant Name</span>
                      <span className="text-[14px] font-semibold text-[#161427]">Priya Sharma</span>
                    </div>
                    <span className="material-symbols-outlined text-[#5b46e8] text-[18px]">lock</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#faf9fe] border border-[#ece8f6]">
                    <div className="flex flex-col">
                      <span className="text-[11px] uppercase font-bold text-[#78767d] tracking-wider">Rental Property</span>
                      <span className="text-[14px] font-semibold text-[#161427]">14 Oak Street, Apt 3B</span>
                    </div>
                    <span className="material-symbols-outlined text-[#5b46e8] text-[18px]">lock</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#faf9fe] border border-[#ece8f6]">
                    <div className="flex flex-col">
                      <span className="text-[11px] uppercase font-bold text-[#78767d] tracking-wider">Landlord / Recipient</span>
                      <span className="text-[14px] font-semibold text-[#161427]">Mr Rao</span>
                    </div>
                    <span className="material-symbols-outlined text-[#5b46e8] text-[18px]">lock</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#faf9fe] border border-[#ece8f6]">
                    <div className="flex flex-col">
                      <span className="text-[11px] uppercase font-bold text-[#78767d] tracking-wider">Withheld Amount</span>
                      <span className="text-[14px] font-semibold text-[#161427]">£1,200.00</span>
                    </div>
                    <span className="material-symbols-outlined text-[#5b46e8] text-[18px]">lock</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#ede8fc]/50 border border-[#ece8f6] mt-3">
                  <p className="text-[13px] text-[#161427] leading-relaxed">
                    <strong className="font-bold text-[#5b46e8]">Why this matters:</strong> Chatbots normally store everything you type. Letterlock replaces your sensitive details first, so no cloud server ever knows who you are or where you lived.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      {/* Footer is rendered globally in App.tsx */}
    </div>
  );
}
