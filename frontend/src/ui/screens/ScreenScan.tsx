import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useApp } from '../state/AppContext';

function ScreenScan() {
  const navigate = useNavigate();
  const { entities, story, isDetecting, detectionError, detectStory } = useApp();
  const [progress, setProgress] = useState(88);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev < 98) return prev + 1;
        clearInterval(interval);
        return prev;
      });
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const handleRetryDetection = () => {
    if (isDetecting) return;
    void detectStory(story);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header activeStep={1} />
      <main className="w-full pt-28 pb-16 flex-1 flex flex-col items-center">
        <div className="flex flex-col w-full max-w-[1120px] mx-auto px-4 sm:px-6">
          <div className="relative w-full">
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[680px] h-[360px] bg-[#ede8fc]/50 blur-[120px] rounded-full pointer-events-none -z-10" />
            <div className="w-full flex flex-col gap-8 md:gap-10">
              {/* Guardian Banner */}
              <section className="w-full bg-white rounded-xl p-6 sm:p-8 md:p-10 shadow-xl relative overflow-hidden">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                  <div className="flex-1 flex flex-col items-start gap-4 text-left">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ede8fc] text-[#5b46e8] border border-[#e6e2f2]">
                      <span className="w-2 h-2 rounded-full bg-[#5b46e8] animate-pulse" />
                      <span className="text-xs font-semibold uppercase tracking-wider">Step 2: Guardian In Action</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <h1 className="text-3xl sm:text-4xl md:text-[40px] font-bold tracking-tight text-[#161427] leading-[1.15]">Locking your secrets.</h1>
                      <span className="text-3xl sm:text-4xl md:text-[40px] font-bold tracking-tight text-[#5b46e8] leading-[1.15]">Right on this device.</span>
                    </div>
                    <p className="text-[#6b6684] max-w-xl text-[15px] leading-relaxed">
                      Right now on your computer, your <span className="inline-block px-1.5 py-0.5 rounded bg-[#ede8fc] text-[#5b46e8] font-medium text-[13px]">real name</span>, <span className="inline-block px-1.5 py-0.5 rounded bg-[#ede8fc] text-[#5b46e8] font-medium text-[13px]">address</span>, <span className="inline-block px-1.5 py-0.5 rounded bg-[#ede8fc] text-[#5b46e8] font-medium text-[13px]">phone number</span>, and <span className="inline-block px-1.5 py-0.5 rounded bg-[#ede8fc] text-[#5b46e8] font-medium text-[13px]">bank figures</span> are being quietly replaced with anonymous safety tags. No AI and no cloud servers will ever read who you are.
                    </p>
                    <div className="flex flex-wrap items-center gap-2.5 pt-1">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#ede8fc] text-[#5b46e8] border border-[#e6e2f2] font-medium text-xs">
                        <span className="material-symbols-outlined text-[17px] text-[#5b46e8]">lock</span> On-device
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f4f3f8] text-[#47445a] border border-[#e8e5f2] text-xs font-medium">
                        <span className="material-symbols-outlined text-[17px] text-[#5b46e8]">visibility_off</span> Zero cloud tracking
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f4f3f8] text-[#47445a] border border-[#e8e5f2] text-xs font-medium">
                        <span className="material-symbols-outlined text-[17px] text-[#5b46e8]">verified_user</span> Full legal dispute tone
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0 flex flex-col items-center justify-center relative">
                    <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-2xl bg-[#f7f6fc] border border-[#e8e4f3] flex items-center justify-center p-3 shadow-md group overflow-hidden">
                      <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-[#ede8fc] via-[#f4f3f8] to-[#dcd4f7] opacity-40 blur-md" />
                      <img
                        alt="Friendly purple guardian cloud mascot keeping your personal details secure"
                        className="w-full h-full object-contain relative z-10 drop-shadow-md transition-transform duration-700 ease-out group-hover:scale-105"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuC-k5zDj7JWRwzQ_brOntZopUWeEE374qdjBJ3YMfivhl6iHQ2pM9K885wO4BHXx7xLdhLaRlWtr8WPUfeUleZE6KKOhIppDxNjxy2W24EFIrtvLIYlAlPy2ZCNicCXSt9AqP2d1o33yEC5pNXpmDPCLDQKQ3rgacaFrAIkt27oCzMx8YgOm-W6_XvQ3JypfRTmEDnpxX71-lOckgOIgZMpcIuORld1LcShVKzm_x3GXZfvB0BqDZXPeA"
                      />
                    </div>
                    <div className="mt-3 text-center">
                      <span className="inline-flex items-center gap-1.5 text-xs text-[#47445a] bg-[#f4f3f8] px-3.5 py-1 rounded-full border border-[#e8e5f2]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#5b46e8]" /> Locked &amp; Protected Locally
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Live Transformation vs Scan Progress */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left: Transformation List */}
                <div className="lg:col-span-7 bg-white rounded-xl p-6 sm:p-8 shadow-xl flex flex-col gap-6" aria-live="polite">
                  <div className="flex items-center justify-between gap-3 pb-1">
                    <div className="flex flex-col">
                      <span className="text-xs text-[#5f5c72] uppercase tracking-wider font-semibold">Live Transformation</span>
                      <h2 className="text-lg font-bold text-[#161427]">Your Story Details Being Swapped</h2>
                      {!isDetecting && !detectionError && (
                        <span className="text-xs font-semibold text-[#5b46e8] mt-1">
                          {entities.length === 0
                            ? "No private details found."
                            : `${entities.length} ${entities.length === 1 ? "private detail" : "private details"} found`}
                        </span>
                      )}
                    </div>
                    {isDetecting ? (
                      <span className="px-3 py-1 rounded-full bg-[#ede8fc] text-[#5b46e8] text-xs font-bold flex items-center gap-1.5 shrink-0">
                        <span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>
                        Searching...
                      </span>
                    ) : detectionError ? (
                      <span className="px-3 py-1 rounded-full bg-[#fef2f2] text-[#8a3d3d] text-xs font-bold flex items-center gap-1 shrink-0 border border-[#fecaca]">
                        <span className="material-symbols-outlined text-[14px]">error_outline</span>
                        Error
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-[#ede8fc] text-[#5b46e8] text-xs font-bold flex items-center gap-1 shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#5b46e8] animate-ping" /> Live Shield
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-3">
                    {isDetecting ? (
                      <div className="p-6 rounded-xl bg-[#faf9fe] border border-[#e8e4f3] flex items-center justify-center gap-3 text-sm font-semibold text-[#5b46e8]">
                        <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                        <span>Searching for private details...</span>
                      </div>
                    ) : detectionError ? (
                      <div
                        className="p-5 rounded-xl bg-[#fef2f2] border border-[#fecaca] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm text-[#8a3d3d]"
                        role="alert"
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">error_outline</span>
                          <span>{detectionError}</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleRetryDetection}
                          disabled={isDetecting}
                          className="px-4 py-2 rounded-full bg-white border border-[#fecaca] text-[#8a3d3d] text-xs font-semibold hover:bg-[#fee2e2] transition-colors shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          Try again
                        </button>
                      </div>
                    ) : entities.length === 0 ? (
                      <div className="p-5 rounded-xl bg-[#faf9fe] border border-[#e8e4f3] flex items-center gap-3 text-sm text-[#5f5c72]">
                        <span className="material-symbols-outlined text-[20px] text-[#5b46e8]">check_circle</span>
                        <span>No private details found.</span>
                      </div>
                    ) : (
                      entities.map((entity) => (
                        <div key={entity.id} className="flex items-center justify-between p-3.5 rounded-xl bg-[#f4f3f8] hover:bg-[#eeedf2] transition-all">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#e3e2e7] flex items-center justify-center text-[#5f5c72]">
                              <span className="material-symbols-outlined text-[18px]">{entity.category === 'Person' ? 'person' : entity.category === 'Address' ? 'home' : 'info'}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm text-[#161427] font-semibold">{entity.text}</span>
                              <span className="text-xs text-[#5f5c72]">{entity.category}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="px-3 py-1 rounded-full bg-[#ede8fc] text-[#5b46e8] font-mono font-medium text-xs shadow-xs">{`{${entity.token}}`}</span>
                            <span className="px-3 py-1 rounded-full bg-[#ede8fc] text-[#5b46e8] font-mono font-medium text-xs shadow-xs">{entity.locked ? 'Locked' : ''}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Right: Stepper Card */}
                <div className="lg:col-span-5 flex flex-col gap-6">
                  <div className="bg-white rounded-xl p-6 sm:p-8 shadow-xl flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-base font-bold text-[#161427]">Scan Progress</h2>
                      <span className="text-base font-bold text-[#5b46e8]">{progress}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-[#e3e2e7] rounded-full overflow-hidden p-0.5">
                      <div className="h-full bg-[#5b46e8] rounded-full transition-all duration-700 ease-out" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="flex flex-col gap-4 mt-2">
                      <div className="relative flex flex-col gap-0">
                        {/* Step 1 */}
                        <div className="relative flex items-start gap-3.5 pb-6">
                          <div className="flex flex-col items-center shrink-0">
                            <div className="w-8 h-8 rounded-full bg-[#5b46e8] text-white flex items-center justify-center shadow-sm z-10">
                              <span className="material-symbols-outlined text-[17px] font-bold">check</span>
                            </div>
                            <div className="w-0.5 h-full bg-[#5b46e8] absolute top-8 left-4 -translate-x-1/2" />
                          </div>
                          <div className="flex flex-col pt-0.5 gap-1">
                            <div className="flex items-center flex-wrap gap-2">
                              <span className="text-[15px] font-semibold text-[#161427]">Analyzing dispute story</span>
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#ede8fc] text-[#5b46e8] text-[11px] font-semibold border border-[#e6e2f2]">
                                <span className="material-symbols-outlined text-[12px] font-bold">done</span>Done
                              </span>
                            </div>
                            <p className="text-[13px] text-[#6b6684] leading-relaxed">We read your written notes to understand the legal context of the problem.</p>
                          </div>
                        </div>
                        {/* Step 2 */}
                        <div className="relative flex items-start gap-3.5 pb-6">
                          <div className="flex flex-col items-center shrink-0">
                            <div className="relative w-8 h-8 rounded-full bg-[#ede8fc] border-2 border-[#5b46e8] text-[#5b46e8] flex items-center justify-center shadow-md z-10">
                              <span className="absolute -inset-1 rounded-full bg-[#5b46e8]/20 animate-ping" />
                              <span className="material-symbols-outlined text-[17px] animate-spin">sync</span>
                            </div>
                            <div className="w-0.5 h-full border-l-2 border-dashed border-[#c9c5cd] absolute top-8 left-4 -translate-x-1/2" />
                          </div>
                          <div className="flex flex-col pt-0.5 gap-1.5 p-3 rounded-xl bg-[#f4f3f8] border border-[#e8e5f2] w-full shadow-xs">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <span className="text-[15px] font-semibold text-[#161427]">
                                {isDetecting
                                  ? "Searching for private details..."
                                  : `Replacing ${entities.length} ${entities.length === 1 ? "private detail" : "private details"}`}
                              </span>
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#5b46e8] text-white text-[11px] font-medium shadow-xs">
                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />In Progress
                              </span>
                            </div>
                            <p className="text-[13px] text-[#6b6684] leading-relaxed">Names, addresses, and dollar values are converted into harmless placeholder tags.</p>
                          </div>
                        </div>
                        {/* Step 3 */}
                        <div className="relative flex items-start gap-3.5">
                          <div className="flex flex-col items-center shrink-0">
                            <div className="w-8 h-8 rounded-full bg-[#e8e7ec] border border-[#e3e2e7] text-[#78767d] flex items-center justify-center text-xs font-semibold z-10 shadow-xs">
                              <span className="material-symbols-outlined text-[16px]">visibility</span>
                            </div>
                          </div>
                          <div className="flex flex-col pt-0.5 gap-1 opacity-70">
                            <div className="flex items-center flex-wrap gap-2">
                              <span className="text-[15px] font-medium text-[#161427]">Preparing clean preview</span>
                              <span className="px-2 py-0.5 rounded-full bg-[#e8e7ec] text-[#78767d] text-[11px] font-medium">Up next</span>
                            </div>
                            <p className="text-[13px] text-[#78767d] leading-relaxed">You will review your sanitized story and choose your preferred letter style.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Device-Local Note Card */}
                  <div className="bg-[#f4f3f8] rounded-xl p-5 flex items-start gap-3.5">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#161427] shrink-0 shadow-sm">
                      <span className="material-symbols-outlined text-[18px]">shield</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-[#161427]">Your privacy is guaranteed</span>
                      <p className="text-xs text-[#5b99a5]">Letterlock works directly inside your web browser. No accounts, no cookies, no copies saved anywhere.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="w-full pt-4 pb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#f4f3f8] text-[#161427] font-semibold text-xs border border-[#e6e2f2] transition-all hover:bg-[#e8e7ec] active:scale-95 shadow-xs"
                  onClick={() => navigate("/")}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>Back to story
                </button>
                <div className="flex items-center gap-3">
                  <button
                    className="px-5 py-3 rounded-full bg-[#f4f3f8] text-[#6b6684] font-medium text-xs hover:text-[#161427] transition-colors"
                    onClick={() => navigate("/")}
                    type="button"
                  >
                    Cancel scan
                  </button>
                  <button
                    className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#161427] text-white font-semibold text-xs shadow-md transition-all hover:bg-[#25223e] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
                    disabled={isDetecting}
                    onClick={() => navigate("/review")}
                    type="button"
                  >
                    {isDetecting ? (
                      <>
                        <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                        <span>Searching for private details...</span>
                      </>
                    ) : (
                      <>
                        <span>Proceed to Review</span>
                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default ScreenScan;
