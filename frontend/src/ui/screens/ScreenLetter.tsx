import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { classifyDisputeType, type DisputeType } from "../../prompts";
import { useApp } from "../state/AppContext";

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

const LETTER_TITLES: Record<DisputeType, string> = {
  salary_payment: "Salary-Payment-Demand",
  rental_deposit: "Deposit-Return-Notice",
  refund_dispute: "Refund-Demand-Notice",
  insurance_claim: "Insurance-Claim-Appeal",
  medical_bill: "Medical-Bill-Dispute",
  general_dispute: "Formal-Dispute-Notice",
};

/** Matches any [BRACKETED BLANK] the AI may have left for the user. */
const BLANK_RE = /\[[A-Z][A-Za-z /]*\]/g;

function countBlanks(text: string): { count: number; first: string | null } {
  const matches = text.match(BLANK_RE);
  if (!matches || matches.length === 0) return { count: 0, first: null };
  return { count: matches.length, first: matches[0] };
}

/** Build a filename from the dispute type. */
function pdfFileName(disputeType: DisputeType): string {
  return `${LETTER_TITLES[disputeType]}.pdf`;
}

/** Extract the Subject line from the letter text, if present. */
function extractSubject(letter: string): string {
  const match = letter.match(/^Subject:\s*(.+)$/m);
  return match ? match[1].trim() : "Formal Dispute Letter";
}

/* ------------------------------------------------------------------ */
/*  PDF generation (jsPDF, selectable text, A4, 20mm margins)         */
/* ------------------------------------------------------------------ */

async function generatePdf(
  letterText: string,
  disputeType: DisputeType,
): Promise<File> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const margin = 20;
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const maxW = pageW - margin * 2;

  doc.setFont("helvetica", "normal");

  // Title
  const subject = extractSubject(letterText);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(subject, margin, margin + 6);

  // Body
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  const lines = doc.splitTextToSize(letterText, maxW) as string[];
  let y = margin + 16;

  for (const line of lines) {
    if (y + 6 > pageH - margin) {
      doc.addPage();
      y = margin;
    }
    doc.text(line, margin, y);
    y += 5.5;
  }

  const blob = doc.output("blob");
  return new File([blob], pdfFileName(disputeType), {
    type: "application/pdf",
  });
}

/* ------------------------------------------------------------------ */
/*  Share helpers                                                     */
/* ------------------------------------------------------------------ */

async function downloadPdfFile(file: File) {
  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function canShareFiles(): boolean {
  try {
    return (
      typeof navigator.canShare === "function" &&
      navigator.canShare({
        files: [new File(["test"], "test.pdf", { type: "application/pdf" })],
      })
    );
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export default function ScreenLetter() {
  const {
    triggerToast,
    resetAll,
    finalLetter,
    story,
    approvedStory,
    disputeType,
    toastMessage,
  } = useApp();
  const navigate = useNavigate();

  const [editedLetter, setEditedLetter] = useState<string>(finalLetter ?? "");
  const [showStartOverModal, setShowStartOverModal] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  const syncOverlayScroll = () => {
    if (textareaRef.current && overlayRef.current) {
      overlayRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  // Keep editedLetter in sync if finalLetter changes (e.g. navigation)
  useEffect(() => {
    if (finalLetter && !editedLetter) setEditedLetter(finalLetter);
  }, [finalLetter]);

  const resolvedDispute = classifyDisputeType(
    approvedStory ?? story,
    disputeType,
  );

  const letterText = editedLetter || finalLetter || "";
  const blanks = useMemo(() => countBlanks(letterText), [letterText]);

  /* ---------- blank confirmation gate ---------- */
  const confirmBlanks = useCallback((): boolean => {
    if (blanks.count === 0) return true;
    return window.confirm(
      `There is still a blank: ${blanks.first}. Send anyway?`,
    );
  }, [blanks]);

  /* ---------- actions ---------- */

  const handleDownloadPdf = async () => {
    if (!letterText) return;
    if (!confirmBlanks()) return;
    try {
      const file = await generatePdf(letterText, resolvedDispute);
      await downloadPdfFile(file);
      triggerToast("PDF downloaded.");
    } catch {
      triggerToast("Could not generate PDF.");
    }
  };

  const handleGmail = async () => {
    if (!letterText) return;
    if (!confirmBlanks()) return;

    try {
      const file = await generatePdf(letterText, resolvedDispute);

      if (canShareFiles()) {
        await navigator.share({ files: [file] });
        triggerToast("Shared.");
        return;
      }

      // Fallback: open Gmail compose + download PDF
      const subject = encodeURIComponent(extractSubject(letterText));
      const body = encodeURIComponent("Please find my letter attached.");
      window.open(
        `https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`,
        "_blank",
      );
      await downloadPdfFile(file);
      triggerToast("PDF downloaded. Attach it in Gmail.");
    } catch {
      triggerToast("Could not share via Gmail.");
    }
  };

  const handleWhatsApp = async () => {
    if (!letterText) return;
    if (!confirmBlanks()) return;

    try {
      const file = await generatePdf(letterText, resolvedDispute);

      if (canShareFiles()) {
        await navigator.share({ files: [file] });
        triggerToast("Shared.");
        return;
      }

      // Fallback: open wa.me + download PDF
      const text = encodeURIComponent(letterText);
      window.open(`https://wa.me/?text=${text}`, "_blank");
      await downloadPdfFile(file);
      triggerToast(
        "WhatsApp can't attach files from a computer. Attach the PDF that just downloaded.",
      );
    } catch {
      triggerToast("Could not share via WhatsApp.");
    }
  };

  const handleCopy = async () => {
    if (!letterText) return;
    if (!confirmBlanks()) return;
    try {
      await navigator.clipboard.writeText(letterText);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = letterText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    triggerToast("Copied.");
  };

  const handlePrint = () => {
    if (!letterText) return;
    if (!confirmBlanks()) return;
    window.print();
  };

  const handleStartOver = () => {
    setShowStartOverModal(true);
  };

  const confirmStartOver = () => {
    resetAll();
    setShowStartOverModal(false);
    navigate("/");
  };

  /* ---------- render letter with highlighted blanks ---------- */
  const renderLetterWithBlanks = (text: string) => {
    const parts: React.ReactNode[] = [];
    let cursor = 0;
    for (const match of text.matchAll(BLANK_RE)) {
      const idx = match.index;
      if (idx === undefined) continue;
      if (idx > cursor) {
        parts.push(text.slice(cursor, idx));
      }
      parts.push(
        <mark
          key={`blank-${idx}`}
          className="bg-[#fef3c7] text-transparent rounded"
        >
          {match[0]}
        </mark>,
      );
      cursor = idx + match[0].length;
    }
    if (cursor < text.length) {
      parts.push(text.slice(cursor));
    }
    return parts;
  };

  /* ---------- TSX ---------- */
  return (
    <>
      <div className="h-dvh flex flex-col bg-[#faf9fe] overflow-hidden print:overflow-visible print:h-auto">
        {/* Background: faint grid */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none print:hidden"
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(91, 70, 232, 0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(91, 70, 232, 0.06) 1px, transparent 1px)",
              backgroundSize: "64px 64px",
              maskImage:
                "radial-gradient(ellipse 72% 65% at 50% 50%, rgba(0,0,0,0.14) 0%, rgba(0,0,0,0.85) 58%, transparent 100%)",
              WebkitMaskImage:
                "radial-gradient(ellipse 72% 65% at 50% 50%, rgba(0,0,0,0.14) 0%, rgba(0,0,0,0.85) 58%, transparent 100%)",
            }}
          />
        </div>

        {/* Header */}
        <div className="relative z-20 flex-shrink-0 print:hidden">
          <Header activeStep={3} minimal />
        </div>

        {/* Main content */}
        <main className="relative z-10 flex-1 min-h-0 flex flex-col pt-[88px] px-4 sm:px-6 print:pt-0 print:px-0">
          <div className="max-w-[900px] w-full mx-auto flex flex-col flex-1 min-h-0">
            {/* Title block */}
            <div className="text-center pt-6 pb-3 flex-shrink-0 print:hidden">
              <h1 className="text-[28px] sm:text-[34px] font-extrabold text-[#161427] tracking-tight leading-tight">
                Your letter is ready
              </h1>
              <p className="text-[14px] sm:text-[15px] text-[#5f5c72] mt-1.5">
                Fill in the highlighted blanks, read it once, then send.
              </p>
            </div>

            {/* Blanks count */}
            {blanks.count > 0 && (
              <p className="text-center text-[14px] text-[#92400e] font-semibold mb-2 flex-shrink-0 print:hidden">
                {blanks.count} {blanks.count === 1 ? "blank" : "blanks"} left
              </p>
            )}

            {/* Letter panel (scrollable, editable) */}
            <section className="flex-1 min-h-0 flex flex-col bg-white rounded-2xl border border-[#e6e2f2] shadow-[0_12px_36px_-12px_rgba(22,20,39,0.08)] overflow-hidden print:shadow-none print:border-none print:rounded-none">
              {/* Preview overlay (read view with highlighted blanks, hidden when editing) */}
              <div className="relative flex-1 min-h-0">
                <textarea
                  ref={textareaRef}
                  value={editedLetter}
                  onChange={(e) => setEditedLetter(e.target.value)}
                  onScroll={syncOverlayScroll}
                  className="absolute inset-0 z-10 w-full h-full resize-none p-7 sm:p-10 text-[18px] text-[#161427] leading-[1.75] whitespace-pre-wrap break-words font-sans focus:outline-none bg-transparent max-[799px]:text-[16px] print:static print:p-0 print:text-[12pt] print:leading-[1.6]"
                  spellCheck
                />
                {/* Highlighted blanks overlay — pointer-events-none so clicks go to textarea */}
                <div
                  ref={overlayRef}
                  aria-hidden="true"
                  className="absolute inset-0 z-0 w-full h-full overflow-y-auto p-7 sm:p-10 text-[18px] text-transparent leading-[1.75] whitespace-pre-wrap break-words font-sans pointer-events-none max-[799px]:text-[16px] print:hidden"
                >
                  {renderLetterWithBlanks(editedLetter)}
                </div>
              </div>
            </section>

            {/* Info line under panel */}
            <p className="text-center text-[13px] text-[#5f5c72] mt-2 mb-1 flex-shrink-0 print:hidden">
              Your real details were put back on this device. This is an AI
              draft, so read it before you send.
            </p>
          </div>
        </main>

        {/* Action bar — pinned at bottom */}
        <div className="relative z-20 flex-shrink-0 bg-white/90 backdrop-blur-md border-t border-[#e6e2f2] shadow-[0_-4px_12px_rgba(0,0,0,0.04)] print:hidden">
          <div className="max-w-[900px] w-full mx-auto px-4 sm:px-6 py-3">
            {/* Row 1: Send label + 3 big buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <span className="text-[13px] text-[#5f5c72] font-medium flex-shrink-0 hidden sm:block">
                Send your letter
              </span>
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* Gmail — primary */}
                <button
                  type="button"
                  onClick={handleGmail}
                  disabled={!letterText}
                  className="h-[52px] rounded-xl bg-[#5b46e8] hover:bg-[#4f3bd4] text-white text-[16px] font-semibold transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    mail
                  </span>
                  Gmail
                </button>
                {/* WhatsApp — outlined */}
                <button
                  type="button"
                  onClick={handleWhatsApp}
                  disabled={!letterText}
                  className="h-[52px] rounded-xl bg-white border border-[#e6e2f2] text-[#161427] hover:bg-[#f4f3f8] text-[16px] font-semibold transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    chat
                  </span>
                  WhatsApp
                </button>
                {/* Download PDF — outlined */}
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={!letterText}
                  className="h-[52px] rounded-xl bg-white border border-[#e6e2f2] text-[#161427] hover:bg-[#f4f3f8] text-[16px] font-semibold transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    picture_as_pdf
                  </span>
                  Download PDF
                </button>
              </div>
            </div>

            {/* Row 2: small links */}
            <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-[#f0edf8]">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={handleCopy}
                  disabled={!letterText}
                  className="text-[13px] text-[#5f5c72] hover:text-[#161427] font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Copy text
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  disabled={!letterText}
                  className="text-[13px] text-[#5f5c72] hover:text-[#161427] font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Print
                </button>
              </div>
              <button
                type="button"
                onClick={handleStartOver}
                className="text-[13px] text-[#5f5c72] hover:text-[#161427] font-medium transition-colors cursor-pointer"
              >
                Start over
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Start over confirmation modal */}
      {showStartOverModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#161427]/40 backdrop-blur-md print:hidden">
          <div className="relative w-full max-w-[440px] bg-white rounded-2xl p-7 shadow-2xl flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#fee2e2] text-[#dc2626] flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">
                  delete_sweep
                </span>
              </div>
              <button
                className="w-8 h-8 rounded-full bg-[#f4f3f8] hover:bg-[#e8e7ec] text-[#5f5c72] flex items-center justify-center transition-all cursor-pointer"
                onClick={() => setShowStartOverModal(false)}
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">
                  close
                </span>
              </button>
            </div>

            <h2 className="text-xl font-bold text-[#161427] tracking-tight">
              Start over?
            </h2>
            <p className="text-sm text-[#5f5c72] leading-relaxed">
              This will clear your story, detected details, and this letter.
              Make sure you've downloaded or copied it first.
            </p>

            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2">
              <button
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white text-[#161427] hover:bg-[#f4f3f8] text-sm font-semibold transition-all border border-[#e6e2f2] cursor-pointer"
                onClick={() => setShowStartOverModal(false)}
                type="button"
              >
                Cancel
              </button>
              <button
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#dc2626] hover:bg-[#b91c1c] text-white text-sm font-semibold transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                onClick={confirmStartOver}
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">
                  delete_forever
                </span>
                Clear everything
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
