import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useApp } from '../state/AppContext';

function ScreenReview() {
  const { entities, removeEntity, addEntity } = useApp();
  const navigate = useNavigate();

  // Quick inline add state
  const [inlineVal, setInlineVal] = useState('');
  const [inlineType, setInlineType] = useState('Person');

  // Modal state (Screen 6)
  const [showModal, setShowModal] = useState(false);
  const [modalInput, setModalInput] = useState('the shop on Oak Lane');
  const [modalType, setModalType] = useState('Address');

  const handleAddInline = () => {
    if (!inlineVal.trim()) return;
    addEntity(inlineVal.trim(), 'Custom / User Specified', inlineType);
    setInlineVal('');
  };

  const handleAddModal = () => {
    if (!modalInput.trim()) return;
    addEntity(modalInput.trim(), 'Manual Redaction', modalType);
    setShowModal(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header activeStep={2} />
      <main className="w-full pt-24 pb-16 flex-1">
        <div className="max-w-[1240px] w-full mx-auto px-6 flex flex-col gap-8">
          {/* Hero / Header Area */}
          <div className="flex flex-col gap-3">
            <div className="inline-flex items-center gap-2 self-start px-3.5 py-1 rounded-full bg-[#ede8fc] text-[#5b46e8] text-[12px] font-semibold tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5b46e8]" />
              STEP 3: PRE-FLIGHT PRIVACY CHECK
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#161427] tracking-tight">
              Review what will leave your device
            </h1>
            <p className="text-[15px] text-[#47464c] max-w-3xl leading-relaxed">
              Left is your original story (stays strictly on this computer). Right is the exact anonymized text that will be sent to draft your letter. Check or tweak before anything is sent.
            </p>
          </div>

          {/* Three-Column Cards Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Card 1: Original Story */}
            <div className="lg:col-span-4 flex flex-col bg-white rounded-2xl p-6 shadow-sm border border-[#ece8f6] justify-between transition-all hover:shadow-md">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between pb-3.5 border-b border-[#f4f3f8]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#ede8fc] flex items-center justify-center text-[#5b46e8]">
                      <span className="material-symbols-outlined text-[18px]">laptop_chromebook</span>
                    </div>
                    <span className="font-semibold text-[16px] text-[#161427]">Your original story</span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ede8fc] text-[#5b46e8] text-[12px] font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#5b46e8]" /> On your device
                  </span>
                </div>
                <div className="bg-[#faf9fe] rounded-xl p-5 text-[14px] text-[#161427] leading-[2.3] border border-[#f0ecfc]">
                  I moved out of <span className="bg-[#ede8fc] text-[#4f3bd4] font-medium px-2 py-0.5 rounded-md inline-block border border-purple-400/40">14 Oak Street</span> on <span className="bg-[#ede8fc] text-[#4f3bd4] font-medium px-2 py-0.5 rounded-md inline-block border border-purple-400/40">3 June</span>. My landlord, <span className="bg-[#ede8fc] text-[#4f3bd4] font-medium px-2 py-0.5 rounded-md inline-block border border-purple-400/40">Mr Rao</span>, has kept my deposit of <span className="bg-[#ede8fc] text-[#4f3bd4] font-medium px-2 py-0.5 rounded-md inline-block border border-purple-400/40">£1,200</span> and has stopped replying. My name is <span className="bg-[#ede8fc] text-[#4f3bd4] font-medium px-2 py-0.5 rounded-md inline-block border border-purple-400/40">Priya Sharma</span>, lease ref <span className="bg-[#ede8fc] text-[#4f3bd4] font-medium px-2 py-0.5 rounded-md inline-block border-purple-400/40">LS-20418</span>. You can call me on <span className="bg-[#ede8fc] text-[#4f3bd4] font-medium px-2 py-0.5 rounded-md inline-block border-purple-400/40">98765 43210</span>.
                </div>
                <div className="pt-4 mt-4 flex items-center justify-between text-[#78767d] text-[13px] font-medium border-t border-[#f4f3f8]">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#5b46e8] text-[18px]">verified_user</span>
                    <span>{entities.length} private details protected locally</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Sent to Cloud */}
            <div className="lg:col-span-4 flex flex-col bg-white rounded-2xl p-6 shadow-sm border border-[#ece8f6] justify-between transition-all hover:shadow-md">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between pb-3.5 border-b border-[#f4f3f8]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#ede8fc] flex items-center justify-center text-[#5b46e8]">
                      <span className="material-symbols-outlined text-[18px]">cloud_sync</span>
                    </div>
                    <span className="font-semibold text-[16px] text-[#161427]">Sent to cloud</span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ede8fc] text-[#5b46e8] text-[12px] font-semibold">
                    <span className="material-symbols-outlined text-[14px]">visibility_off</span> Sanitized payload
                  </span>
                </div>
                <div className="bg-[#faf9fe] rounded-xl p-5 text-[14px] text-[#161427] leading-[2.3] border border-[#f0ecfc]">
                  I moved out of <span className="bg-[#5b46e8] text-white px-2 py-0.5 rounded-md font-mono font-medium text-xs inline-block shadow-sm">{`{Address 1}`}</span> on <span className="bg-[#5b46e8] text-white px-2 py-0.5 rounded-md font-mono font-medium text-xs inline-block shadow-sm">{`{Date 1}`}</span>. My landlord, <span className="bg-[#5b46e8] text-white px-2 py-0.5 rounded-md font-mono font-medium text-xs inline-block shadow-sm">{`{Person B}`}</span>, has kept my deposit of <span className="bg-[#5b46e8] text-white px-2 py-0.5 rounded-md font-mono font-medium text-xs inline-block shadow-sm">{`{Amount 1}`}</span> and has stopped replying. My name is <span className="bg-[#5b46e8] text-white px-2 py-0.5 rounded-md font-mono font-medium text-xs inline-block shadow-sm">{`{Person A}`}</span>, lease ref <span className="bg-[#5b46e8] text-white px-2 py-0.5 rounded-md font-mono font-medium text-xs inline-block shadow-sm">{`{Lease 1}`}</span>. You can call me on <span className="bg-[#5b46e8] text-white px-2 py-0.5 rounded-md font-mono font-medium text-xs inline-block shadow-sm">{`{Phone 1}`}</span>.
                </div>
                <div className="pt-4 mt-4 flex items-center justify-between text-[#78767d] text-[13px] font-medium border-t border-[#f4f3f8]">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#5b46e8] text-[18px]">security</span>
                    <span>Zero personal data leaves your device</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Execution Context */}
            <div className="lg:col-span-4 flex flex-col justify-between bg-[#161427] text-white p-6 rounded-2xl shadow-xl border border-white/10 relative overflow-hidden">
              <div className="flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#7857f8] animate-pulse" />
                    <span className="text-[11px] font-semibold tracking-wider text-[#a59fe0] uppercase font-mono">WHERE EACH STEP RUNS</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#5b46e8] flex items-center justify-center text-white shadow-md shadow-[#5b46e8]/40">
                    <span className="material-symbols-outlined text-[17px]">lock</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 transition-colors hover:bg-white/10">
                    <span className="text-[13px] text-white font-medium">Find private details</span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#5b46e8]/20 text-purple-200 border border-purple-400/40 text-[11px] font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#7857f8]" /> On your device
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 transition-colors hover:bg-white/10">
                    <span className="text-[13px] text-white font-medium">Write the letter</span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 text-purple-200 border border-white/10 text-[11px] font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#c8beff]" /> In the cloud
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 transition-colors hover:bg-white/10">
                    <span className="text-[13px] text-white font-medium">Put details back</span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#5b46e8]/20 text-purple-200 border border-purple-400/40 text-[11px] font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#7857f8]" /> On your device
                    </span>
                  </div>
                </div>
                <div className="pt-4 mt-4 border-t border-white/10 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-[#7857f8]">info</span>
                  <p className="text-[12px] text-[#a59fe0]">Only the text you approve goes to the cloud.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Detected Details Management Card */}
          <div className="bg-white rounded-2xl p-7 shadow-sm border border-[#ece8f6] flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-[#161427] tracking-tight">Detected private details ({entities.length})</h2>
                <p className="text-[13px] text-[#78767d] mt-1">Check what was automatically flagged or add any sensitive detail we might have missed.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#ede8fc] text-[#5b46e8] text-[13px] font-semibold hover:bg-[#e0d8fa] transition-colors self-start sm:self-center shadow-sm"
                  onClick={() => setShowModal(true)}
                >
                  <span className="material-symbols-outlined text-[17px]">add</span>
                  <span>Add a missed detail</span>
                </button>
              </div>
            </div>

            {/* Inline Quick Add Bar */}
            <div className="p-3.5 rounded-xl bg-[#faf9fe] border border-[#ece8f6] flex flex-col md:flex-row items-center gap-3">
              <div className="flex-1 w-full">
                <input
                  className="w-full px-4 py-2.5 rounded-xl bg-white text-[#161427] text-[14px] border border-[#ece8f6] focus:outline-none focus:ring-2 focus:ring-[#5b46e8]/30 placeholder:text-[#9b99a5]"
                  placeholder="e.g. Apt 4B, Metro Bank, or John"
                  type="text"
                  value={inlineVal}
                  onChange={(e) => setInlineVal(e.target.value)}
                />
              </div>
              <div className="w-full md:w-56">
                <select
                  className="w-full px-4 py-2.5 rounded-xl bg-white text-[#161427] text-[14px] border border-[#ece8f6] focus:outline-none focus:ring-2 focus:ring-[#5b46e8]/30 cursor-pointer"
                  value={inlineType}
                  onChange={(e) => setInlineType(e.target.value)}
                >
                  <option value="Person">Person Name</option>
                  <option value="Address">Street / Building Address</option>
                  <option value="Date">Date / Timeline</option>
                  <option value="Amount">Amount / Financial</option>
                  <option value="Phone">Phone / Contact</option>
                  <option value="Lease">Account / Reference #</option>
                </select>
              </div>
              <button
                className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-[#5b46e8] hover:bg-[#4f3bd4] text-white font-medium text-[13px] transition-colors shrink-0 shadow-sm shadow-[#5b46e8]/20"
                onClick={handleAddInline}
                type="button"
              >
                Add Protection
              </button>
            </div>

            {/* Table of Detected Items */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[14px]">
                <thead>
                  <tr className="text-[#78767d] text-[11px] font-semibold tracking-wider uppercase border-b border-[#f4f3f8]">
                    <th className="py-3 px-4 font-semibold">ORIGINAL PRIVATE VALUE</th>
                    <th className="py-3 px-4 font-semibold">DETECTED CATEGORY</th>
                    <th className="py-3 px-4 font-semibold">SENT PLACEHOLDER</th>
                    <th className="py-3 px-4 font-semibold">DEVICE STATUS</th>
                    <th className="py-3 px-4 text-right font-semibold">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f4f3f8]">
                  {entities.map(item => (
                    <tr key={item.id} className="hover:bg-[#faf9fe] transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-[#161427]">
                        <span className="inline-block px-2.5 py-1 rounded-md bg-[#faf9fe] border border-[#f0ecfc]">{item.text}</span>
                      </td>
                      <td className="py-3.5 px-4 text-[#78767d] text-[13px]">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#f4f3f8] text-[#47464c] text-[12px] font-medium">{item.category}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2.5 py-0.5 rounded font-mono font-medium text-xs bg-[#5b46e8] text-white shadow-sm">{item.token}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ede8fc] text-[#5b46e8] text-[12px] font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#5b46e8]" /> Protected locally
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          className="p-1.5 rounded-full hover:bg-[#f0ecfc] text-[#9b99a5] hover:text-[#ba1a1a] transition-colors"
                          onClick={() => removeEntity(item.id)}
                          title="Remove protection"
                        >
                          <span className="material-symbols-outlined text-[18px]">close</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Approval & Action Bar */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-[#ece8f6] flex flex-col md:flex-row items-center justify-between gap-5">
            <button
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#faf9fe] hover:bg-[#f0ecfc] text-[#161427] border border-[#ece8f6] transition-colors text-[13px] font-medium shadow-sm"
              onClick={() => navigate('/')}
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              <span>Back to story</span>
            </button>
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#ede8fc] text-[#5b46e8] text-[13px] font-medium text-center md:text-left border border-purple-400/40">
              <span className="material-symbols-outlined text-[#5b46e8] text-[18px] shrink-0">verified_user</span>
              <span>Only substituted tokens leave your machine. Your personal names and references never leave this browser.</span>
            </div>
            <button
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full bg-[#161427] hover:bg-[#5b46e8] text-white text-[14px] font-semibold shadow-md shadow-[#161427]/10 transition-all hover:shadow-[#5b46e8]/30 cursor-pointer"
              onClick={() => navigate('/generating')}
              type="button"
            >
              <span>Approve and write letter</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </main>

      {/* SCREEN 6 Modal: Add a missed detail dialog */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#161427]/40 backdrop-blur-md">
          <div className="bg-white border border-[#ece8f6] rounded-2xl sm:rounded-3xl shadow-xl max-w-lg w-full p-6 sm:p-8 flex flex-col gap-6 relative transition-all">
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-1.5">
                <div className="inline-flex items-center gap-1.5 self-start px-2.5 py-0.5 rounded-full bg-[#ede8fc] text-[#5b46e8] text-[11px] font-semibold tracking-wider uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5b46e8]" />
                  Manual Redaction
                </div>
                <h2 className="text-2xl font-bold text-[#161427] tracking-tight">Add a missed detail</h2>
                <p className="text-[14px] text-[#47464c] leading-relaxed">
                  Type or paste any sensitive text that was missed. We will automatically replace every match in your story with a safe placeholder.
                </p>
              </div>
              <button
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#9b99a5] hover:text-[#161427] hover:bg-[#ede8fc] transition-colors shrink-0"
                onClick={() => setShowModal(false)}
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-[#161427]">Text to protect</label>
                <input
                  className="w-full px-4 py-3 rounded-xl bg-[#faf9fe] text-[#161427] text-[14px] font-medium border border-[#ece8f6] focus:outline-none focus:ring-2 focus:ring-[#5b46e8]/30 focus:border-[#5b46e8] placeholder:text-[#9b99a5] transition-all"
                  type="text"
                  value={modalInput}
                  onChange={(e) => setModalInput(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-[#161427]">Detail type</label>
                <div className="relative">
                  <select
                    className="w-full appearance-none px-4 py-3 rounded-xl bg-[#faf9fe] text-[#161427] text-[14px] font-medium border border-[#ece8f6] focus:outline-none focus:ring-2 focus:ring-[#5b46e8]/30 focus:border-[#5b46e8] cursor-pointer transition-all"
                    value={modalType}
                    onChange={(e) => setModalType(e.target.value)}
                  >
                    <option value="Address">Address</option>
                    <option value="Person">Person Name</option>
                    <option value="Lease">Lease Reference</option>
                    <option value="Account">Account / Bank Number</option>
                    <option value="Phone">Phone Number</option>
                    <option value="Email">Email Address</option>
                    <option value="Amount">Amount / Currency</option>
                    <option value="Date">Date</option>
                    <option value="Other">Other Private Detail</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-[#78767d]">
                    <span className="material-symbols-outlined text-[20px]">expand_more</span>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-[#faf9fe] border border-[#f0ecfc] flex flex-col gap-2.5">
                <div className="flex items-center justify-between flex-wrap gap-2 text-[13px]">
                  <span className="text-[#47464c]">Outgoing placeholder preview:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#78767d] text-xs">replaces with</span>
                    <span className="inline-block px-2.5 py-0.5 rounded font-mono font-medium text-xs bg-[#5b46e8] text-white shadow-sm">
                      {`{${modalType} ${entities.length + 1}}`}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[12px] text-[#5b46e8] font-medium pt-1 border-t border-[#f0ecfc]">
                  <span className="material-symbols-outlined text-[16px]">verified_user</span>
                  <span>Protected on your device. Never leaves your computer.</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                className="px-5 py-2.5 rounded-full text-[13px] font-semibold text-[#78767d] hover:text-[#161427] hover:bg-[#ede8fc] transition-colors"
                onClick={() => setShowModal(false)}
                type="button"
              >
                Cancel
              </button>
              <button
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#161427] hover:bg-[#5b46e8] text-white text-[13px] font-semibold shadow-md shadow-[#161427]/10 transition-all hover:shadow-[#5b46e8]/30"
                onClick={handleAddModal}
                type="button"
              >
                <span>Add detail & protect</span>
                <span className="material-symbols-outlined text-[17px]">check</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default ScreenReview;
