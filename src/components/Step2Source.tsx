import React, { useRef, useState } from 'react';
import {
  UploadCloud,
  FileText,
  X,
  ClipboardList,
  Sliders,
  ArrowRight,
  ArrowLeft,
  FileSpreadsheet,
  FileCode,
  FileCheck,
  AlertCircle,
  Loader2,
  FolderOpen,
  Globe,
  Layers,
  ListOrdered,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { ExtractedFile, formatBytes, parseFileClientSide } from '../utils/fileParsers';
import { PMIDocumentDefinition } from '../data/documents';
import { SourceLocationModal } from './SourceLocationModal';
import { SAMPLE_MULTI_DOC_PORTFOLIO } from '../data/sampleMultiDocPortfolio';

interface Step2SourceProps {
  selectedDoc: PMIDocumentDefinition;
  files: ExtractedFile[];
  onAddFiles: (newFiles: ExtractedFile[]) => void;
  onRemoveFile: (fileId: string) => void;
  pastedText: string;
  onChangePastedText: (text: string) => void;
  specialInstructions: string;
  onChangeSpecialInstructions: (instructions: string) => void;
  selectedSections: string[];
  selectedFields: string[];
  coveredFields: Set<string>;
  coveredSections: Set<string>;
  onProceed: () => void;
  onBack: () => void;
  onSwitchToMultiDocReport?: () => void;
  onQuickGenerate?: () => void;
}

export const Step2Source: React.FC<Step2SourceProps> = ({
  selectedDoc,
  files,
  onAddFiles,
  onRemoveFile,
  pastedText,
  onChangePastedText,
  specialInstructions,
  onChangeSpecialInstructions,
  selectedSections,
  selectedFields,
  coveredFields,
  coveredSections,
  onProceed,
  onBack,
  onSwitchToMultiDocReport,
  onQuickGenerate,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const directoryInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  const handleLoadSampleCharter = () => {
    if (SAMPLE_MULTI_DOC_PORTFOLIO.length > 0) {
      onAddFiles([SAMPLE_MULTI_DOC_PORTFOLIO[0]]);
    }
  };

  const handleFileChange = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setIsParsing(true);
    setParseError(null);

    const parsedArray: ExtractedFile[] = [];
    try {
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        if (file.name.startsWith('.') || file.name.startsWith('~$')) continue;
        const parsed = await parseFileClientSide(file);
        parsedArray.push(parsed);
      }
      onAddFiles(parsedArray);
    } catch (err: any) {
      setParseError(err?.message || 'Error parsing uploaded files client-side.');
    } finally {
      setIsParsing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (directoryInputRef.current) directoryInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      await handleFileChange(e.dataTransfer.files);
    }
  };

  const totalWords =
    files.reduce((acc, f) => acc + f.wordCount, 0) +
    (pastedText.trim() ? pastedText.trim().split(/\s+/).length : 0);

  const hasSourceMaterial = files.length > 0 || pastedText.trim().length > 0;

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'xlsx' || ext === 'csv' || ext === 'xls') return FileSpreadsheet;
    if (ext === 'json' || ext === 'vtt' || ext === 'srt') return FileCode;
    return FileText;
  };

  const coveredFieldsCount = selectedFields.filter((f) => coveredFields.has(f)).length;
  const uncoveredFieldsCount = selectedFields.length - coveredFieldsCount;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
            Step 2 of 5 · Source Material Ingestion
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight mt-0.5">
            Attach Source Materials for {selectedDoc.title}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Upload files, attach a project directory (read-only scan of folders & subfolders), or paste notes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          {onQuickGenerate && (
            <button
              onClick={onQuickGenerate}
              disabled={!hasSourceMaterial || isParsing}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all shadow-md ${
                hasSourceMaterial && !isParsing
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer shadow-amber-500/20'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
              }`}
              title="Immediately synthesize the document in the selected board using your uploaded source materials"
            >
              <span>⚡ Generate {selectedDoc.title}</span>
            </button>
          )}

          <button
            onClick={onProceed}
            disabled={!hasSourceMaterial || isParsing}
            className={`flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-lg transition-all shadow-md ${
              hasSourceMaterial && !isParsing
                ? 'bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 cursor-pointer shadow-cyan-500/20'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <span>Run Gap Analysis & Proceed</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Mandatory Document In Place Requirement Notice */}
      {!hasSourceMaterial ? (
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-amber-300">
                At Least One Document Needs to be in Place
              </div>
              <p className="text-xs text-amber-200/90 mt-0.5">
                The document in the selected board (<strong>{selectedDoc.title}</strong> · {selectedDoc.phase} Phase) can only be synthesized from factual source material. Please upload or attach at least one source file or transcript.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLoadSampleCharter}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shrink-0 cursor-pointer transition-colors shadow-xs"
          >
            <span>Attach Sample Source Document</span>
          </button>
        </div>
      ) : (
        <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Document in place:</strong> {files.length} file(s) attached ({totalWords.toLocaleString()} words). Ready to generate the <strong>{selectedDoc.title}</strong> from the selected <strong>{selectedDoc.phase}</strong> board.
            </span>
          </div>
          {onQuickGenerate && (
            <button
              onClick={onQuickGenerate}
              className="px-2.5 py-1 rounded font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-colors cursor-pointer text-[11px] shrink-0"
            >
              Generate Now &rarr;
            </button>
          )}
        </div>
      )}

      {parseError && (
        <div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-lg text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{parseError}</span>
        </div>
      )}

      {/* Hidden File and Directory Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".txt,.md,.docx,.pdf,.xlsx,.csv,.json,.vtt,.srt"
        onChange={(e) => handleFileChange(e.target.files)}
        className="hidden"
      />
      <input
        ref={directoryInputRef}
        type="file"
        // @ts-expect-error webkitdirectory is standard for folder picking
        webkitdirectory=""
        directory=""
        multiple
        onChange={(e) => handleFileChange(e.target.files)}
        className="hidden"
      />

      {/* Drag & Drop Upload Zone + Direct Source Actions */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
          isDragging
            ? 'border-cyan-400 bg-cyan-950/30 scale-[1.005]'
            : 'border-slate-700/80 bg-[#0F172A]/70'
        }`}
      >
        <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center mx-auto mb-3 text-cyan-400 shadow-inner">
          {isParsing ? (
            <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
          ) : (
            <UploadCloud className="w-6 h-6" />
          )}
        </div>

        <h3 className="text-sm font-bold text-white mb-1">
          {isParsing ? 'Parsing Files Client-Side...' : 'Drag & Drop Project Artifacts Here'}
        </h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
          Supports <span className="text-cyan-300 font-mono">.docx, .pdf, .xlsx, .csv, .txt, .md, .json, .vtt, .srt</span>
        </p>

        {/* Action Buttons: Browse Files, Attach Directory, Remote Hub */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 text-xs font-semibold text-cyan-300 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 rounded-lg transition-colors cursor-pointer"
          >
            Browse Local Files
          </button>

          {/* DEDICATED ATTACH SOURCE DIRECTORY BUTTON */}
          <button
            type="button"
            onClick={() => directoryInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 rounded-lg shadow-sm transition-all cursor-pointer"
            title="Read-only scan of folder and all subdirectories to extract matching project documents"
          >
            <FolderOpen className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Attach Source Directory</span>
          </button>

          <button
            type="button"
            onClick={() => setIsLocationModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors cursor-pointer"
            title="Inspect remote SharePoint library, Google Drive link, or directory staging drawer"
          >
            <Globe className="w-3.5 h-3.5 text-sky-400" />
            <span>SharePoint / Drive URL</span>
          </button>
        </div>
      </div>

      {/* LIVE REQUIREMENTS COVERAGE PANEL (RED for Not Covered, GREEN for Covered) */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Document Requirements Coverage (Live Audit Check)</span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {coveredFieldsCount} Covered
            </span>
            <span className="text-slate-600">·</span>
            <span className="flex items-center gap-1.5 text-rose-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              {uncoveredFieldsCount} Not Covered (Red)
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-400">
          Forensic pre-check: Required sections and fields not detected in your uploaded source materials appear in <strong className="text-rose-400">RED</strong>. You can answer them in Step 3 or mark them as TBC.
        </p>

        {/* Coverage Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Mandatory Sections Coverage */}
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg space-y-2">
            <div className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider">
              Mandatory Document Sections ({selectedSections.length})
            </div>
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              {selectedSections.map((sec, i) => {
                const isCovered = coveredSections.has(sec);
                return (
                  <div
                    key={i}
                    className={`flex items-center justify-between p-1.5 rounded text-xs border ${
                      isCovered
                        ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
                        : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                    }`}
                  >
                    <span className="truncate pr-2">{sec}</span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase font-mono shrink-0 ${
                        isCovered
                          ? 'bg-emerald-900/80 text-emerald-300'
                          : 'bg-rose-900/80 text-rose-200'
                      }`}
                    >
                      {isCovered ? 'Covered' : 'Not Covered'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Required Fields Coverage */}
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg space-y-2">
            <div className="text-[11px] font-bold text-sky-300 uppercase tracking-wider">
              Required Information Fields ({selectedFields.length})
            </div>
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              {selectedFields.map((field, i) => {
                const isCovered = coveredFields.has(field);
                return (
                  <div
                    key={i}
                    className={`flex items-center justify-between p-1.5 rounded text-xs border ${
                      isCovered
                        ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
                        : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                    }`}
                  >
                    <span className="truncate pr-2">{field}</span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase font-mono shrink-0 ${
                        isCovered
                          ? 'bg-emerald-900/80 text-emerald-300'
                          : 'bg-rose-900/80 text-rose-200'
                      }`}
                    >
                      {isCovered ? 'Covered' : 'Not Covered'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Attached Files Chips */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-cyan-400" />
              Attached Artifacts & Scanned Files ({files.length})
            </span>
            <span className="font-mono text-[11px] text-cyan-400">
              {files.reduce((a, b) => a + b.wordCount, 0).toLocaleString()} words extracted
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {files.map((file) => {
              const FileIcon = getFileIcon(file.name);
              return (
                <div
                  key={file.id}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-slate-200 group hover:border-cyan-500/40 transition-colors shadow-xs"
                >
                  <FileIcon className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="max-w-[200px] truncate font-medium">{file.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    ({formatBytes(file.size)})
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFile(file.id);
                    }}
                    className="text-slate-500 hover:text-rose-400 transition-colors ml-1 cursor-pointer p-0.5 rounded hover:bg-slate-800"
                    title="Remove file"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>

          {files.length >= 2 && onSwitchToMultiDocReport && (
            <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mt-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-md bg-cyan-500/20 text-cyan-300">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </span>
                <div className="text-xs">
                  <span className="font-semibold text-white">Multiple Documents Uploaded ({files.length} files)</span>
                  <p className="text-[11px] text-slate-300">
                    Generate an integrated ISO 21500 & 9001 Cross-Document Governance Report with comparative graphs and traceability matrix.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onSwitchToMultiDocReport}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all cursor-pointer shrink-0 shadow-xs"
              >
                <span>Launch ISO Report</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Paste Area for Notes, Emails, Transcripts */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-cyan-400" />
            <span>Paste Meeting Notes, Transcripts or Raw Updates</span>
          </label>
          <span className="text-[10px] text-slate-400 font-mono">
            {pastedText.trim() ? pastedText.trim().split(/\s+/).length : 0} words
          </span>
        </div>

        <textarea
          rows={5}
          value={pastedText}
          onChange={(e) => onChangePastedText(e.target.value)}
          placeholder="Paste raw email updates, stakeholder bullet points, meeting transcripts, or rough notes here..."
          className="w-full bg-slate-950 border border-slate-700/80 rounded-lg p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono leading-relaxed"
        />
      </div>

      {/* Special Instructions Box */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-5 space-y-3">
        <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-sky-400" />
          <span>Special Governance Instructions (Optional)</span>
        </label>
        <p className="text-[11px] text-slate-400">
          Guide emphasis, tone, specific audit constraints, or client requirements. (Cannot override factual grounding rules).
        </p>
        <input
          type="text"
          value={specialInstructions}
          onChange={(e) => onChangeSpecialInstructions(e.target.value)}
          placeholder="e.g. Focus on high-risk cloud migration items; enforce strict ISO 27001 data governance compliance"
          className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
        />
      </div>

      {/* Summary Footer */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
        <div className="text-xs text-slate-400">
          Total Material Ingested:{' '}
          <strong className="text-cyan-300 font-mono">{totalWords.toLocaleString()} words</strong> across{' '}
          <strong className="text-white">{files.length} file{files.length === 1 ? '' : 's'}</strong> and notes.
        </div>

        <button
          onClick={onProceed}
          disabled={!hasSourceMaterial || isParsing}
          className={`flex items-center gap-2 px-6 py-2.5 text-xs font-bold rounded-lg transition-all shadow-md ${
            hasSourceMaterial && !isParsing
              ? 'bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 cursor-pointer shadow-cyan-500/20 hover:scale-[1.02]'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          <span>Run Gap Analysis & Clarifications</span>
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>

      {/* Discovered Files & Remote Source Modal */}
      <SourceLocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onIngestFiles={(newFiles) => onAddFiles(newFiles)}
      />
    </div>
  );
};
