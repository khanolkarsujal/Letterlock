import React from "react";
import { useApp } from "../state/AppContext";
import { useNavigate } from "react-router-dom";

function GlobalDialogs() {
  const { toastMessage, showWipeModal, setShowWipeModal, resetAll } = useApp();
  const navigate = useNavigate();

  return (
    <>
      {/* Toast Notification */}
      <div
        className={`fixed bottom-6 right-6 z-50 bg-secondary text-white px-5 py-3 rounded-full shadow-xl flex items-center gap-2 transform transition-all duration-300 pointer-events-none ${
          toastMessage ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
        }`}
      >
        <span className="material-symbols-outlined text-[20px]">check_circle</span>
        <span className="text-[14px] font-bold">{toastMessage}</span>
      </div>

      {/* Reset/Wipe Confirmation Modal */}
      {showWipeModal && (
        <div className="fixed inset-0 z-50 bg-[#161427]/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-2xl flex flex-col gap-4 border border-[#e2dfec]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#fee2e2] text-[#dc2626] flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-[22px]">delete</span>
              </div>
              <div>
                <h3 className="text-[17px] font-bold text-on-surface">Start over and clear data?</h3>
                <p className="text-[12px] text-on-surface-variant">Your draft and restored details will be removed</p>
              </div>
            </div>
            <p className="text-[14px] text-on-surface-variant leading-relaxed">
              This will immediately erase your letter and all extracted personal details from this browser session. Nothing was stored on any cloud server.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                className="px-4 py-2 rounded-full border border-[#e2dfec] text-on-surface hover:bg-[#f4f3f8] text-[13px] font-semibold transition-colors"
                onClick={() => setShowWipeModal(false)}
                type="button"
              >
                Cancel
              </button>
              <button
                className="px-5 py-2 rounded-full bg-[#dc2626] text-white hover:bg-[#b91c1c] text-[13px] font-bold transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
                onClick={() => {
                  resetAll();
                  navigate("/");
                }}
                type="button"
              >
                <span className="material-symbols-outlined text-[17px]">delete_forever</span>
                <span>Clear &amp; Restart</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default GlobalDialogs;
