import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../state/AppContext";

interface HeaderProps {
  activeStep: number;
  minimal?: boolean;
}

const Header: React.FC<HeaderProps> = ({ activeStep, minimal = false }) => {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-[#faf9fe]/90 backdrop-blur-md border-b border-[#e2dfec]/60">
      <div className="h-16 max-w-[1140px] mx-auto px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Brand (+ Local Badge unless minimal) */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#161427] flex items-center justify-center text-white shadow-sm">
              <span className="material-symbols-outlined text-[16px] sm:text-[18px]">lock</span>
            </div>
            <span className="text-[17px] sm:text-[19px] font-extrabold tracking-tight text-on-surface">Letterlock</span>
          </Link>
          {!minimal && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[12px] font-semibold bg-[#ede8fc] text-[#5b46e8]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5b46e8]"></span>
              LOCAL
            </span>
          )}
        </div>
        {/* Step Navigation Indicator */}
        <nav className={`${minimal ? "hidden sm:flex" : "hidden md:flex"} items-center bg-[#f4f3f8] px-1.5 sm:px-2 py-1 sm:py-1.5 rounded-full border border-[#e2dfec]/60 text-[11px] sm:text-[13px] font-medium gap-0.5 sm:gap-1 text-[#5f5c72] flex-shrink-0`}>
          <Link
            to="/"
            className={`px-2 sm:px-3 py-1 rounded-full transition-all flex items-center gap-1 sm:gap-1.5 whitespace-nowrap ${
              activeStep === 1
                ? "bg-[#161427] text-white font-semibold shadow-sm"
                : "text-[#5f5c72] hover:text-[#161427]"
            }`}
          >
            {activeStep === 1 && <span className="w-1.5 h-1.5 rounded-full bg-[#5b46e8]"></span>}
            1 Paste
          </Link>
          <span className="text-[#c9c5cd] font-light">›</span>
          <Link
            to="/review"
            className={`px-2 sm:px-3 py-1 rounded-full transition-all flex items-center gap-1 sm:gap-1.5 whitespace-nowrap ${
              activeStep === 2
                ? "bg-[#161427] text-white font-semibold shadow-sm"
                : "text-[#5f5c72] hover:text-[#161427]"
            }`}
          >
            {activeStep === 2 && <span className="w-1.5 h-1.5 rounded-full bg-[#5b46e8]"></span>}
            2 Review
          </Link>
          <span className="text-[#c9c5cd] font-light">›</span>
          <Link
            to="/letter"
            className={`px-2 sm:px-3.5 py-1 rounded-full transition-all flex items-center gap-1 sm:gap-1.5 whitespace-nowrap ${
              activeStep === 3
                ? "bg-[#161427] text-white font-semibold shadow-sm"
                : "text-[#5f5c72] hover:text-[#161427]"
            }`}
          >
            {activeStep === 3 && <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full animate-pulse bg-[#5b46e8]"></span>}
            3 Letter
          </Link>
        </nav>
        {/* Right: Privacy Shield (hidden in minimal mode) */}
        {!minimal && (
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#e2dfec] shadow-sm text-[13px] font-medium text-on-surface select-none">
              <span className="w-2 h-2 rounded-full flex-shrink-0 animate-pulse bg-[#5b46e8]"></span>
              <span>Privacy shield <span className="font-semibold text-secondary">Active</span></span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
