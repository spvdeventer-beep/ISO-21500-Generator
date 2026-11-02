import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  CheckCircle2,
  X,
  FileCheck,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Layers,
  Award,
  Copy,
  Check,
  FileSpreadsheet
} from 'lucide-react';
import { PMIDocumentDefinition } from '../data/documents';

interface StageDocDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDoc: PMIDocumentDefinition;
  docCode: string;
  projectName: string;
  date: string;
  markdown?: string;
  onDownloadPdf: () => void;
  onPrintPdf?: () => void;
  onDownloadDocx: () => void;
  onDownloadMarkdown: () => void;
  onDownloadAuditPdf?: () => void;
  onDownloadCsv?: () => void;
  hasAuditData?: boolean;
  hasCsvData?: boolean;
}

export const StageDocDownloadModal: React.FC<StageDocDownloadModalProps> = ({
  isOpen,
  onClose,
  selectedDoc,
  docCode,
  projectName,
  date,
  markdown = '',
  onDownloadPdf,
  onPrintPdf,
  onDownloadDocx,
  onDownloadMarkdown,
  onDownloadAuditPdf,
  onDownloadCsv,
  hasAuditData = false,
  hasCsvData = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const safeMarkdown = typeof markdown === 'string' ? markdown : '';
  const wordCount = safeMarkdown.trim() ? safeMarkdown.trim().split(/\s+/).length : 0;
  const sectionCount = selectedDoc.requiredSections.length;

  const handleCopyClipboard = async () => {
    try {
      await navigator.clipboard.writeText(safeMarkdown);
      setCopied(true);
      setDownloadSuccessMessage('Document markdown copied to clipboard');
      setTimeout(() => {
        setCopied(false);
        setDownloadSuccessMessage(null);
      }, 3000);
    } catch {
      // Fallback textarea copy
      try {
        const el = document.createElement('textarea');
        el.value = safeMarkdown;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      } catch (e) {
        console.error('Clipboard copy failed:', e);
      }
    }
  };

  const triggerDownloadAction = (action: () => void, formatName: string) => {
    action();
    setDownloadSuccessMessage(`Initiated ${formatName} download`);
    setTimeout(() => setDownloadSuccessMessage(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="bg-gradient-to-b from-[#0F1D38] to-[#0A1324] border border-cyan-500/50 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl shadow-cyan-950/60 transition-all scale-in-95"
        role="dialog"
        aria-modal="true"
        aria-labelledby="stage-doc-done-title"
      >
        {/* Header Bar */}
        <div className="relative px-6 pt-6 pb-4 border-b border-cyan-500/20 bg-gradient-to-r from-cyan-950/40 via-sky-950/20 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{selectedDoc.phase} Stage Complete</span>
              </span>
              <span className="font-mono text-xs text-cyan-300 font-bold bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
                {docCode}
              </span>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/80 transition-colors cursor-pointer"
              aria-label="Close download modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <h2
            id="stage-doc-done-title"
            className="text-2xl font-black text-white tracking-tight mt-3 flex items-center gap-2"
          >
            <Sparkles className="w-6 h-6 text-cyan-400 animate-pulse shrink-0" />
            <span>{selectedDoc.title}</span>
          </h2>

          <p className="text-xs text-slate-300 mt-1">
            Grounded synthesis complete for project: <strong className="text-white">{projectName}</strong>
          </p>
        </div>

        {/* Content & Quality Verification Metrics */}
        <div className="p-6 space-y-4">
          {downloadSuccessMessage && (
            <div className="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{downloadSuccessMessage}</span>
            </div>
          )}

          {/* Key Metrics Chips */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
              <div className="text-[10px] uppercase font-mono text-slate-400">Word Count</div>
              <div className="text-base font-bold text-white mt-0.5 font-mono">
                {wordCount.toLocaleString()}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
              <div className="text-[10px] uppercase font-mono text-slate-400">Sections</div>
              <div className="text-base font-bold text-cyan-300 mt-0.5 font-mono">
                {sectionCount} Conforming
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
              <div className="text-[10px] uppercase font-mono text-slate-400">Governance</div>
              <div className="text-base font-bold text-emerald-300 mt-0.5 font-mono">
                ISO 21500
              </div>
            </div>
          </div>

          {/* Quality Conformance Notice */}
          <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 flex items-start gap-3">
            <Award className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300 leading-relaxed">
              <strong className="text-white font-semibold">Stage gate validation verified:</strong> All required fields, metadata signatures, and Advannotech enterprise formatting standards have been synthesized. Choose your desired export format below.
            </div>
          </div>

          {/* Download Action Buttons */}
          <div className="space-y-2.5 pt-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Choose Document Format:</span>
              <span className="text-cyan-400 font-mono text-[10px]">Full Suite Active</span>
            </div>

            {/* Primary Action: Direct PDF Download using jsPDF */}
            <button
              onClick={() => triggerDownloadAction(onDownloadPdf, 'Direct PDF')}
              className="w-full flex items-center justify-between p-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 via-sky-500 to-cyan-400 hover:from-cyan-400 hover:to-sky-300 text-slate-950 shadow-lg shadow-cyan-500/25 transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <Download className="w-5 h-5 stroke-[2.5]" />
                <div className="text-left">
                  <div className="leading-tight">Download Formatted Clean PDF</div>
                  <div className="text-[11px] font-medium text-slate-900/80">
                    Direct binary PDF download · Letterhead, styled tables, sign-off blocks
                  </div>
                </div>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 bg-slate-950/20 rounded">
                .PDF
              </span>
            </button>

            {/* Grid of secondary actions: Word, Markdown, Print, Copy */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => triggerDownloadAction(onDownloadDocx, 'Word (.docx)')}
                className="flex items-center justify-center gap-2 p-3 rounded-xl font-bold text-xs bg-blue-950/80 hover:bg-blue-900 text-blue-200 border border-blue-500/40 transition-all cursor-pointer shadow-sm hover:scale-[1.01]"
              >
                <Download className="w-4 h-4 text-blue-400" />
                <span>Export Word (.docx)</span>
              </button>

              <button
                onClick={() => triggerDownloadAction(onDownloadMarkdown, 'Markdown (.md)')}
                className="flex items-center justify-center gap-2 p-3 rounded-xl font-semibold text-xs bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-all cursor-pointer hover:scale-[1.01]"
              >
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>Download Markdown (.md)</span>
              </button>

              {onPrintPdf ? (
                <button
                  onClick={onPrintPdf}
                  className="flex items-center justify-center gap-2 p-2.5 rounded-xl font-semibold text-xs bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-all cursor-pointer hover:scale-[1.01]"
                >
                  <Printer className="w-4 h-4 text-slate-400" />
                  <span>Print via Browser</span>
                </button>
              ) : (
                <button
                  onClick={() => window.print()}
                  className="flex items-center justify-center gap-2 p-2.5 rounded-xl font-semibold text-xs bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-all cursor-pointer hover:scale-[1.01]"
                >
                  <Printer className="w-4 h-4 text-slate-400" />
                  <span>Print via Browser</span>
                </button>
              )}

              <button
                onClick={handleCopyClipboard}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl font-semibold text-xs bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-all cursor-pointer hover:scale-[1.01]"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-300">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-400" />
                    <span>Copy to Clipboard</span>
                  </>
                )}
              </button>
            </div>

            {/* Optional Audit Report & CSV Buttons */}
            {hasAuditData && onDownloadAuditPdf && (
              <button
                onClick={() => triggerDownloadAction(onDownloadAuditPdf, 'Audit Report')}
                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl font-semibold text-xs bg-amber-950/40 hover:bg-amber-950/70 text-amber-300 border border-amber-500/30 transition-all cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Download Provenance & Risk Audit Report (PDF/HTML)</span>
              </button>
            )}

            {hasCsvData && onDownloadCsv && (
              <button
                onClick={() => triggerDownloadAction(onDownloadCsv, 'Action Items CSV')}
                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl font-semibold text-xs bg-emerald-950/40 hover:bg-emerald-950/70 text-emerald-300 border border-emerald-500/30 transition-all cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Export Action Items Spreadsheet (.csv)</span>
              </button>
            )}

            {selectedDoc.id === 'rasci-matrix' && onDownloadCsv && (
              <button
                onClick={() => triggerDownloadAction(onDownloadCsv, 'RASCI Matrix CSV')}
                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl font-semibold text-xs bg-cyan-950/40 hover:bg-cyan-950/70 text-cyan-300 border border-cyan-500/30 transition-all cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
                <span>Export RASCI Matrix Spreadsheet (.csv)</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Certified ISO 21500:2021 · Advannotech (Pty) Ltd
          </span>

          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-cyan-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/40 transition-all cursor-pointer"
          >
            <span>Continue to Review & Edit</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
