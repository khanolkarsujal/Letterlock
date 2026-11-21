import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useApp } from "../state/AppContext";
import { defaultStory } from "../state/mockData";

function ScreenIntake() {
  const { story, setStory, disputeType, setDisputeType, entities } = useApp();
  const navigate = useNavigate();
  const [isInspecting, setIsInspecting] = useState(false);

  const wordCount = story.trim() ? story.trim().split(/\s+/).length : 0;
  const charCount = story.length;

  const handleInspect = () => {
    setIsInspecting(true);
    setTimeout(() => {
      setIsInspecting(false);
      navigate("/scan");
    }, 600);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header activeStep={1} />
      <main className="w-full pt-28 pb-16 flex-1">
        <div className="max-w-[920px] mx-auto px-6">
          {/* Hero Banner */}
          <div className="relative bg-gradient-to-br from-white via-[#faf9fe] to-[#f2eeff] rounded-[2rem] p-8 sm:p-10 mb-8 border border-[#e8e4f3] shadow-[0_12px_40px_-15px_rgba(95,58,221,0.07)] overflow-hidden">
            <div className="absolute -right-16 -top-16 w-64 h-64 bg-[#dfd6ff] rounded-full blur-3xl opacity-50 pointer-events-none"></div>
            <div className="absolute -left-12 -bottom-12 w-56 h-56 bg-[#ece8fc] rounded-full blur-2xl opacity-60 pointer-events-none"></div>
            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-12 gap-6 sm:gap-8 items-center">
              <div className="sm:col-span-7 flex flex-col gap-3.5">
                <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-bold text-[#161427] tracking-tight leading-tight">
                  Write the letter.<br />
                  <span className="text-[#5b46e8]">Keep the details.</span>
                </h1>
                <p className="text-[15px] sm:text-base text-[#6b6684] leading-relaxed mt-0.5">
                  Turn a messy dispute story into a firm, professional letter—without ever sending your real name, address, or private numbers to the cloud.
                </p>
              </div>
              <div className="sm:col-span-5 flex justify-center">
                <div className="relative w-full max-w-[340px] rounded-2xl overflow-hidden shadow-[0_12px_36px_rgba(91,70,232,0.14)] border border-[#ede8fc]">
                  <img
                    alt="Minimalist 3D translucent frosted-glass envelope and shield in serene lilac flora"
                    className="w-full h-48 sm:h-52 object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCbtOnZi11T-0W5CUmUsFEIz7SB2-lXF5jUgAA4_KS1VRk1WaPbO2AFN-ePU5yqy8tFwh_Ei5LPi4Tiuxp7B1SBNpS2xooJSD91NSgEnTmG9Fvo3_Jav-JVbWBoTYmLvJbhsQOjQl9Sa-6eJVsdsgB5bZfHc2bGPJyTuUueRSQGCS3k3Z7lJwvXpmEl8LC3j2vnpDYrE-NJaWCEzD5yQiLNeuK-tw0Vl1LLmsDJwNFH" />
                </div>
              </div>
            </div>
          </div>

          {/* What is Letterlock? 3 Columns */}
          <section className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5 px-1">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#161427] tracking-tight">What is Letterlock?</h2>
              </div>
              <p className="text-sm text-[#6b6684] max-w-md leading-relaxed">
                A privacy-first letter writer that keeps your personal details on your own device while AI helps draft your response.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-[#ede8fc] to-[#e4dffa] p-6 rounded-[1.75rem] border border-[#dcd4f7] flex flex-col justify-between gap-4 shadow-[0_4px_20px_rgb(22,20,39,0.03)]">
                <h3 className="font-bold text-lg text-[#161427] leading-snug">1. Paste your story</h3>
                <p className="text-xs sm:text-[13px] text-[#47445a] leading-relaxed">Write what happened in your own words, with real names and numbers included.</p>
              </div>
              <div className="bg-[#1b192c] p-6 rounded-[1.75rem] border border-[#2d2945] flex flex-col justify-between gap-4 shadow-[0_8px_24px_rgba(22,20,39,0.12)]">
                <h3 className="font-bold text-lg text-white leading-snug">2. Private details stay here</h3>
                <p className="text-xs sm:text-[13px] text-[#c8c3de] leading-relaxed">Your device automatically swaps names, addresses, and phone numbers for safe placeholders.</p>
              </div>
              <div className="bg-[#1b192c] p-6 rounded-[1.75rem] border border-[#2d2945] flex flex-col justify-between gap-4 shadow-[0_8px_24px_rgba(22,20,39,0.12)]">
                <h3 className="font-bold text-lg text-white leading-snug">3. Get a firm letter</h3>
                <p className="text-xs sm:text-[13px] text-[#c8c3de] leading-relaxed">AI drafts a professional letter using only placeholders, then your device puts your real details back.</p>
              </div>
            </div>
          </section>

          {/* Intake Workspace Card */}
          <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-[#e8e4f3] shadow-[0_8px_30px_rgb(22,20,39,0.04)] flex flex-col gap-8">
            {/* Dispute Type Radios */}
            <div className="flex flex-col gap-3">
              <label className="text-sm font-bold text-[#161427] tracking-tight">What is it about?</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label
                  onClick={() => setDisputeType("deposit")}
                  className={`group relative flex items-center gap-3.5 p-4 rounded-2xl cursor-pointer transition-all ${
                    disputeType === "deposit"
                      ? "bg-[#f5f2fe] border-2 border-[#5b46e8] shadow-xs"
                      : "bg-[#faf9fe] border border-[#e8e4f3] hover:border-[#cfc7ee] hover:bg-[#f6f4fd]"
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                    disputeType === "deposit" ? "bg-[#5b46e8] text-white" : "border-2 border-[#cfc9e2]"
                  }`}>
                    {disputeType === "deposit" && <span className="material-symbols-outlined text-[16px]">check</span>}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-[#161427]">Deposit dispute</span>
                    <span className="text-xs text-[#6b6684]">Tenancy & Security Bond</span>
                  </div>
                </label>
                <label
                  onClick={() => setDisputeType("insurance")}
                  className={`group relative flex items-center gap-3.5 p-4 rounded-2xl cursor-pointer transition-all ${
                    disputeType === "insurance"
                      ? "bg-[#f5f2fe] border-2 border-[#5b46e8] shadow-xs"
                      : "bg-[#faf9fe] border border-[#e8e4f3] hover:border-[#cfc7ee] hover:bg-[#f6f4fd]"
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                    disputeType === "insurance" ? "bg-[#5b46e8] text-white" : "border-2 border-[#cfc9e2]"
                  }`}>
                    {disputeType === "insurance" && <span className="material-symbols-outlined text-[16px]">check</span>}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-[#161427]">Insurance claim</span>
                    <span className="text-xs text-[#6b6684]">Denied Coverage & Delays</span>
                  </div>
                </label>
                <label
                  onClick={() => setDisputeType("medical")}
                  className={`group relative flex items-center gap-3.5 p-4 rounded-2xl cursor-pointer transition-all ${
                    disputeType === "medical"
                      ? "bg-[#f5f2fe] border-2 border-[#5b46e8] shadow-xs"
                      : "bg-[#faf9fe] border border-[#e8e4f3] hover:border-[#cfc7ee] hover:bg-[#f6f4fd]"
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                    disputeType === "medical" ? "bg-[#5b46e8] text-white" : "border-2 border-[#cfc9e2]"
                  }`}>
                    {disputeType === "medical" && <span className="material-symbols-outlined text-[16px]">check</span>}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-[#161427]">Medical bill appeal</span>
                    <span className="text-xs text-[#6b6684]">Overcharges & Coding Error</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Story Input */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-bold text-[#161427] tracking-tight" htmlFor="story-input">
                    Your story
                  </label>
                  <span className="px-2 py-0.5 rounded-full bg-[#f0edf8] text-[#6b6684] font-mono text-[10px] uppercase font-semibold">
                    Stays on your device
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    className="text-xs text-[#6b6684] hover:text-[#5b46e8] transition-colors flex items-center gap-1 font-medium"
                    onClick={() => setStory(defaultStory)}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[14px]">refresh</span> Reset Demo
                  </button>
                  <span className="text-xs font-mono text-[#8c86a3]">{wordCount} words</span>
                  <span className="text-xs font-mono text-[#8c86a3]">•</span>
                  <span className="text-xs font-mono text-[#8c86a3]">{charCount} chars</span>
                </div>
              </div>

              <div className="relative rounded-2xl overflow-hidden bg-[#faf9fe] border border-[#e4dfef] focus-within:border-[#5b46e8] focus-within:ring-2 focus-within:ring-[#5b46e8]/10 transition-all">
                <textarea
                  id="story-input"
                  value={story}
                  onChange={(e) => setStory(e.target.value)}
                  className="w-full bg-transparent p-5 text-[15px] text-[#161427] placeholder-[#a6a0bd] focus:outline-none resize-none leading-relaxed min-h-[140px]"
                  rows={5}
                />
                <div className="bg-[#f2effa] px-4 py-2.5 border-t border-[#e8e4f3] flex flex-wrap items-center justify-between gap-2.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-[#5b46e8]">shield</span>
                    <span className="font-medium text-[#161427]">Detected details:</span>
                    <span className="text-[#5b46e8] font-semibold">{entities.length} items protected locally</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full bg-white text-[#5b46e8] font-mono text-[11px] font-medium border border-[#e5e0f5] shadow-xs">Address</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-white text-[#5b46e8] font-mono text-[11px] font-medium border border-[#e5e0f5] shadow-xs">Landlord name</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-white text-[#5b46e8] font-mono text-[11px] font-medium border border-[#e5e0f5] shadow-xs">Your name</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-white text-[#5b46e8] font-mono text-[11px] font-medium border border-[#e5e0f5] shadow-xs">Phone & Ref #</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Privacy Assurance & CTA Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-5 border-t border-[#f0ecf7]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#f2effa] border border-[#e5dfff] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[#5b46e8] text-[20px]">lock_reset</span>
                </div>
                <p className="text-xs sm:text-[13px] text-[#6b6684] leading-relaxed">
                  <strong className="text-[#161427] font-semibold">100% Private:</strong> Your story stays on this device until you approve what is sent. Private details are swapped locally before anything leaves.
                </p>
              </div>

              <button
                className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#161427] text-white hover:bg-[#272346] hover:shadow-[0_8px_20px_rgba(22,20,39,0.18)] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 shadow-sm font-semibold text-sm cursor-pointer shrink-0"
                disabled={isInspecting}
                onClick={handleInspect}
                type="button"
              >
                {isInspecting ? (
                  <React.Fragment>
                    <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                    <span>Parsing Sensitive Entities...</span>
                  </React.Fragment>
                ) : (
                  <React.Fragment>
                    <span className="material-symbols-outlined text-[18px]">fingerprint</span>
                    <span>Find private details</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </React.Fragment>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default ScreenIntake;
