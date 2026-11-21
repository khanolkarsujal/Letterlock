import React from "react";
import { useApp } from "../state/AppContext";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="w-full bg-[#faf9fe] border-t border-[#e2dfec]/80 py-6 mt-auto">
      <div className="max-w-[1140px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[13px] text-on-surface-variant">
        <div className="flex items-center gap-2 font-medium">
          <span className="inline-block w-2 h-2 rounded-full bg-[#5b46e8]"></span>
          <span className="text-xs font-semibold text-[#161427]">Letterlock</span>
          <span className="text-xs text-[#6b7280]">•</span>
          <span className="text-xs text-[#6b7280]">100% On-Device Privacy</span>
        </div>
        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4 text-[#6b7280] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
          <span className="text-xs text-[#6b7280]">Your data never leaves your device</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
