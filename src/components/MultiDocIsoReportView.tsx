import React, { useState, useId } from 'react';
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Download,
  Printer,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Trash2,
  Plus,
  HelpCircle,
  BarChart3,
  PieChart,
  Grid,
  TrendingUp,
  Award,
  BookOpen,
  Check,
  ChevronDown,
  ChevronUp,
  Sliders,
  FileCode,
  CheckSquare,
  Square,
  Info,
  FolderTree
} from 'lucide-react';
import { parseFileClientSide, ExtractedFile } from '../utils/fileParsers';
import {
  MultiDocIsoReport,
  UserGuidedRequirements,
  FormatExampleBenchmark,
  DEFAULT_GUIDED_REQUIREMENTS,
  SAMPLE_FORMAT_BENCHMARK,
  extractFormatBenchmarkFromText,
  analyzeMultiDocPortfolio,
  generateComplianceBarChartSvg,
  generateRadarChartSvg,
  generateDonutChartSvg,
  generateProcessGroupChartSvg,
  generateIsoStandardsComparisonSvg,
  exportMultiDocIsoReportHtml,
  exportMultiDocIsoReportDocx,
  exportMultiDocIsoCsv
} from '../utils/multiDocIsoAudit';
import { SAMPLE_MULTI_DOC_PORTFOLIO } from '../data/sampleMultiDocPortfolio';
import { BurndownChart } from './BurndownChart';

interface MultiDocIsoReportViewProps {
  onBackToGenerator?: () => void;
  projectName?: string;
  onOpenIsoFolders?: () => void;
}

export const MultiDocIsoReportView: React.FC<MultiDocIsoReportViewProps> = ({
  onBackToGenerator,
  projectName = 'Advannotech IoT Strategic Telemetry Program',
  onOpenIsoFolders,
}) => {
  const uploadInputId = useId();
  const formatInputId = useId();
  const [files, setFiles] = useState<ExtractedFile[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [report, setReport] = useState<MultiDocIsoReport | null>(null);
  const [activeReportTab, setActiveReportTab] = useState<'analytics' | 'documents' | 'consistency' | 'capa' | 'format-benchmark'>('analytics');
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  // User-Guided Report Requirements State
  const [guidedRequirements, setGuidedRequirements] = useState<UserGuidedRequirements>(DEFAULT_GUIDED_REQUIREMENTS);
  const [isRequirementsExpanded, setIsRequirementsExpanded] = useState<boolean>(true);

  // Example Document Format Benchmark State
  const [formatBenchmark, setFormatBenchmark] = useState<FormatExampleBenchmark | null>(null);
  const [isParsingFormat, setIsParsingFormat] = useState(false);
  const [formatUploadError, setFormatUploadError] = useState<string | null>(null);

  // File Upload Handler (Multiple files supported)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFileList = e.target.files;
    if (!uploadedFileList || uploadedFileList.length === 0) return;

    setIsParsing(true);
    try {
      const parsedList: ExtractedFile[] = [];
      for (let i = 0; i < uploadedFileList.length; i++) {
        const file = uploadedFileList[i];
        const parsed = await parseFileClientSide(file);
        parsedList.push(parsed);
      }
      setFiles((prev) => [...prev, ...parsedList]);
    } catch (err) {
      console.error('Error parsing files:', err);
    } finally {
      setIsParsing(false);
      // Reset input value to allow re-upload of same file name
      e.target.value = '';
    }
  };

  // Format Example Benchmark Handlers (Upload sample document format)
  const handleFormatFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsingFormat(true);
    setFormatUploadError(null);
    try {
      const parsed = await parseFileClientSide(file);
      const benchmark = extractFormatBenchmarkFromText(parsed.name, parsed.text);
      setFormatBenchmark(benchmark);
      // If portfolio already audited, instantly re-evaluate with the new format benchmark
      if (files.length > 0) {
        setReport(analyzeMultiDocPortfolio(files, projectName, guidedRequirements, benchmark));
      }
    } catch (err: any) {
      console.error('Format upload error:', err);
      setFormatUploadError(err?.message || 'Failed to extract format benchmark from file.');
    } finally {
      setIsParsingFormat(false);
      e.target.value = '';
    }
  };

  const handleSelectFormatPreset = (presetKey: 'advannotech' | 'ieee' | 'agile') => {
    let preset: FormatExampleBenchmark;
    if (presetKey === 'advannotech') {
      preset = SAMPLE_FORMAT_BENCHMARK;
    } else if (presetKey === 'ieee') {
      preset = {
        fileName: 'IEEE_ISO_Technical_Spec_Format.docx',
        detectedSections: [
          'Abstract & Purpose Statement',
          'Normative Standards & References',
          'Terms, Definitions & Governance Demarcation',
          'Technical Requirements & Verification Gates',
          'Change Control & Audit Conformance Log'
        ],
        hasTables: true,
        hasNumberedClauses: true,
        hasExecutiveSummary: true,
        targetWordCount: 1800,
        formatRulesSummary: 'IEEE/ISO formal technical specification: 5 numbered clause blocks, normative references table, and verification gates.'
      };
    } else {
      preset = {
        fileName: 'Agile_PMO_Executive_Brief_Format.docx',
        detectedSections: [
          'Executive Summary & Sprint Deliverables',
          'Milestone Stage Gates & Velocity',
          'Risk Heatmap & Immediate Action Items',
          'Stakeholder RACI Table'
        ],
        hasTables: true,
        hasNumberedClauses: false,
        hasExecutiveSummary: true,
        targetWordCount: 1000,
        formatRulesSummary: 'Agile governance brief: 4 succinct sections, executive summary cards, and stakeholder RACI breakdown.'
      };
    }
    setFormatBenchmark(preset);
    if (files.length > 0) {
      setReport(analyzeMultiDocPortfolio(files, projectName, guidedRequirements, preset));
    }
  };

  const handleClearFormatBenchmark = () => {
    setFormatBenchmark(null);
    if (files.length > 0) {
      setReport(analyzeMultiDocPortfolio(files, projectName, guidedRequirements, null));
    }
  };

  const handleLoadSamplePortfolio = () => {
    setFiles([...SAMPLE_MULTI_DOC_PORTFOLIO]);
    const benchmark = formatBenchmark || SAMPLE_FORMAT_BENCHMARK;
    setFormatBenchmark(benchmark);
    // Automatically run audit on sample bundle with guided requirements & format benchmark
    const sampleReport = analyzeMultiDocPortfolio(
      SAMPLE_MULTI_DOC_PORTFOLIO,
      projectName,
      guidedRequirements,
      benchmark
    );
    setReport(sampleReport);
    setActiveReportTab('analytics');
  };

  const handleRemoveFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    if (report) {
      const remaining = files.filter((f) => f.id !== id);
      if (remaining.length > 0) {
        setReport(analyzeMultiDocPortfolio(remaining, projectName, guidedRequirements, formatBenchmark));
      } else {
        setReport(null);
      }
    }
  };

  const handleClearAll = () => {
    setFiles([]);
    setReport(null);
  };

  const handleRunAudit = () => {
    if (files.length === 0) return;
    setIsAuditing(true);
    setTimeout(() => {
      const generatedReport = analyzeMultiDocPortfolio(
        files,
        projectName,
        guidedRequirements,
        formatBenchmark
      );
      setReport(generatedReport);
      setIsAuditing(false);
      setActiveReportTab('analytics');
    }, 400);
  };

  // SVG Chart Markup
  const greenCount = report ? report.documents.filter((d) => d.ragStatus === 'GREEN').length : 0;
  const amberCount = report ? report.documents.filter((d) => d.ragStatus === 'AMBER').length : 0;
  const redCount = report ? report.documents.filter((d) => d.ragStatus === 'RED').length : 0;

  const barChartSvg = report ? generateComplianceBarChartSvg(report.documents) : '';
  const radarChartSvg = report ? generateRadarChartSvg(report.pmbokDomains) : '';
  const donutChartSvg = report ? generateDonutChartSvg(greenCount, amberCount, redCount) : '';
  const processChartSvg = report ? generateProcessGroupChartSvg(report.isoProcessGroups) : '';
  const standardsComparisonSvg = report ? generateIsoStandardsComparisonSvg(report.documents) : '';

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 animate-fade-in text-slate-200">
      {/* Top Banner / Mode Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0F172A] via-[#0B1528] to-[#0F172A] border border-cyan-500/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              <BarChart3 className="w-5 h-5" />
            </span>
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
              ISO Standards Multi-Document Reporting
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-mono">
              ISO 21500 / 9001 / 31000
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-300 max-w-3xl leading-relaxed">
            Upload multiple project documents (Charters, SOWs, Schedules, Risk Registers, Meeting Minutes) to generate an integrated ISO Standards Governance Report with publication-grade analytics, comparative graphs, and cross-document traceability.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {onOpenIsoFolders && (
            <button
              onClick={onOpenIsoFolders}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 transition-all cursor-pointer shadow-xs hover:scale-105 active:scale-95"
              title="View and download standard ISO 21500 governance directory structure (.zip)"
            >
              <FolderTree className="w-3.5 h-3.5 text-cyan-400" />
              <span>ISO 21500 Folders (.zip)</span>
            </button>
          )}

          <button
            onClick={handleLoadSamplePortfolio}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-all cursor-pointer shadow-xs"
            title="Load 5 pre-configured Advannotech project documents for immediate testing"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Load Sample Portfolio (5 Docs)</span>
          </button>

          {onBackToGenerator && (
            <button
              onClick={onBackToGenerator}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
            >
              <span>Back to 5-Step</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Multi-Document Upload Workstation */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Upload className="w-4 h-4 text-cyan-400" />
              1. Ingest Multiple Project Documents
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Select or drag & drop multiple files (.docx, .pdf, .xlsx, .csv, .txt, .md). All files remain 100% in-memory client-side.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {files.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-xs text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
              >
                Clear All ({files.length})
              </button>
            )}

            <label
              htmlFor={uploadInputId}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isParsing ? 'Extracting Files...' : 'Add Documents'}</span>
            </label>
            <input
              id={uploadInputId}
              type="file"
              multiple
              accept=".docx,.pdf,.xlsx,.xls,.csv,.txt,.md"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>

        {/* Uploaded Files Table / Cards */}
        {files.length === 0 ? (
          <label
            htmlFor={uploadInputId}
            className="border-2 border-dashed border-slate-800 hover:border-cyan-500/50 rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-slate-900/30 hover:bg-slate-900/60 group"
          >
            <div className="p-3.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 group-hover:scale-110 transition-transform mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <span className="text-sm font-bold text-white">
              Click or drag multiple project documents here
            </span>
            <span className="text-xs text-slate-400 mt-1 max-w-md">
              Upload charters, SOWs, schedule spreadsheets, risk logs, or meeting minutes. Or click "Load Sample Portfolio" above to test instantly.
            </span>
          </label>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/90 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">Document Name</th>
                    <th className="p-3">File Size</th>
                    <th className="p-3">Word Count</th>
                    <th className="p-3">Detected ISO Type</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-300">
                  {files.map((file, idx) => {
                    return (
                      <tr key={file.id} className="hover:bg-slate-900/40">
                        <td className="p-3 font-mono text-slate-500">{idx + 1}</td>
                        <td className="p-3 font-semibold text-white flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span className="truncate max-w-xs">{file.name}</span>
                        </td>
                        <td className="p-3 font-mono text-slate-400">
                          {Math.round(file.size / 1024)} KB
                        </td>
                        <td className="p-3 font-mono text-slate-400">
                          {file.wordCount.toLocaleString()} words
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                            {file.name.toLowerCase().includes('charter')
                              ? 'Project Charter'
                              : file.name.toLowerCase().includes('sow')
                              ? 'Statement of Work'
                              : file.name.toLowerCase().includes('schedule') || file.name.toLowerCase().includes('cost')
                              ? 'Schedule & Cost Baseline'
                              : file.name.toLowerCase().includes('risk')
                              ? 'Risk & Quality Log'
                              : file.name.toLowerCase().includes('minute')
                              ? 'Meeting Minutes'
                              : 'Governance Artifact'}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleRemoveFile(file.id)}
                            className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors cursor-pointer"
                            title="Remove document"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Run Audit Trigger */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400">
                {files.length} document(s) queued for ISO 21500 / 9001 multi-document cross-audit.
              </span>

              <button
                onClick={handleRunAudit}
                disabled={isAuditing}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 shadow-lg shadow-cyan-500/25 transition-all cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                {isAuditing ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>{isAuditing ? 'Auditing Portfolio...' : 'Generate ISO Standards Report'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: USER-GUIDED REPORT REQUIREMENTS & FORMAT BENCHMARK */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                2. User-Guided Report Requirements & Document Format
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Customize the audit scope, target ISO standards, passing threshold, and provide an example of what the document format needs to be.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsRequirementsExpanded(!isRequirementsExpanded)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
            >
              <span>{isRequirementsExpanded ? 'Collapse Settings' : 'Expand Settings'}</span>
              {isRequirementsExpanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {isRequirementsExpanded && (
          <div className="space-y-6 pt-1">
            {/* Audit Focus Presets */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-white uppercase tracking-wider block">
                Audit Focus Objective & Preset Profile
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {[
                  {
                    key: 'Comprehensive Governance',
                    label: 'Governance & Alignment',
                    desc: 'Full ISO 21500 / 21502 baseline governance & traceability.',
                    standards: ['ISO 21500', 'ISO 21502', 'ISO 9001', 'ISO 31000', 'ISO/IEC 27001'],
                  },
                  {
                    key: 'Technical Architecture & Cybersecurity',
                    label: 'Technical & Cyber Risk',
                    desc: 'ISO/IEC 27001 data protection, TLS 1.3 encryption & SLA resilience.',
                    standards: ['ISO/IEC 27001', 'ISO 31000', 'ISO 21500'],
                  },
                  {
                    key: 'Commercial & Financial Control',
                    label: 'Commercial & Cost Control',
                    desc: 'Budget reconciliation, milestone billing, and scope variance.',
                    standards: ['ISO 9001', 'ISO 21500', 'ISO 31000'],
                  },
                  {
                    key: 'Quality & CAPA Compliance',
                    label: 'Quality Assurance & CAPA',
                    desc: 'ISO 9001 configuration control, non-conformance fixes & audits.',
                    standards: ['ISO 9001', 'ISO 31000', 'ISO 21502'],
                  },
                ].map((preset) => {
                  const isSelected = guidedRequirements.auditFocus === preset.key;
                  return (
                    <button
                      key={preset.key}
                      type="button"
                      onClick={() =>
                        setGuidedRequirements((prev) => ({
                          ...prev,
                          auditFocus: preset.key as any,
                          targetStandards: preset.standards,
                        }))
                      }
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-950/70 border-cyan-500/60 shadow-xs'
                          : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/70'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-bold ${isSelected ? 'text-cyan-300' : 'text-white'}`}>
                          {preset.label}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug">{preset.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Governing ISO Standards & Passing Threshold */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* ISO Standards Selection */}
              <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 space-y-2.5">
                <label className="text-xs font-bold text-white uppercase tracking-wider block">
                  Governing ISO Standards to Validate
                </label>
                <div className="space-y-1.5">
                  {[
                    { id: 'ISO 21500', name: 'ISO 21500:2021 · Project Governance & Scope Control' },
                    { id: 'ISO 21502', name: 'ISO 21502:2020 · Project Management Delivery Practices' },
                    { id: 'ISO 9001', name: 'ISO 9001:2015 · Quality Gates & Baseline Change Control' },
                    { id: 'ISO 31000', name: 'ISO 31000:2018 · Risk Probability vs Impact Matrix' },
                    { id: 'ISO/IEC 27001', name: 'ISO/IEC 27001:2022 · Information Security & Access Controls' },
                  ].map((std) => {
                    const isChecked = guidedRequirements.targetStandards.includes(std.id);
                    return (
                      <div
                        key={std.id}
                        onClick={() => {
                          setGuidedRequirements((prev) => {
                            const updated = isChecked
                              ? prev.targetStandards.filter((s) => s !== std.id)
                              : [...prev.targetStandards, std.id];
                            return { ...prev, targetStandards: updated.length > 0 ? updated : [std.id] };
                          });
                        }}
                        className={`flex items-center gap-2.5 p-2 rounded-lg border transition-all cursor-pointer ${
                          isChecked
                            ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-200'
                            : 'bg-slate-900/30 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-cyan-400 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-600 shrink-0" />
                        )}
                        <span className="text-xs font-medium">{std.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Threshold & Lead Auditor Designation */}
              <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 space-y-3.5">
                <div>
                  <label className="text-xs font-bold text-white uppercase tracking-wider block mb-1.5">
                    Passing Compliance Threshold: <span className="text-cyan-400 font-mono">{guidedRequirements.passingThreshold}%</span>
                  </label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[75, 80, 85, 90, 95].map((th) => (
                      <button
                        key={th}
                        type="button"
                        onClick={() =>
                          setGuidedRequirements((prev) => ({ ...prev, passingThreshold: th }))
                        }
                        className={`py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                          guidedRequirements.passingThreshold === th
                            ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-xs'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {th}%
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-white uppercase tracking-wider block mb-1">
                    Designated Lead Auditor & Authority
                  </label>
                  <input
                    type="text"
                    value={guidedRequirements.auditorName}
                    onChange={(e) =>
                      setGuidedRequirements((prev) => ({ ...prev, auditorName: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-hidden focus:border-cyan-500 font-medium"
                    placeholder="e.g. Valiant Khoza (Lead Software Engineer)"
                  />
                </div>
              </div>
            </div>

            {/* OPTION TO UPLOAD AN EXAMPLE OF WHAT THE DOCUMENT FORMAT NEEDS TO BE */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-[#0B1728] to-slate-950 border border-cyan-500/30 space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-amber-400" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      Example Document Format Benchmark (Upload or Select Format Example)
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Upload an example of what the document format needs to be (.docx, .pdf, .md, .txt, .json). All portfolio documents will be benchmarked against this structural layout.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <label
                    htmlFor={formatInputId}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors cursor-pointer shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isParsingFormat ? 'Extracting Benchmark...' : 'Upload Format Example'}</span>
                  </label>
                  <input
                    id={formatInputId}
                    type="file"
                    accept=".docx,.pdf,.xlsx,.csv,.txt,.md,.json"
                    onChange={handleFormatFileUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {formatUploadError && (
                <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{formatUploadError}</span>
                </div>
              )}

              {/* Format Presets Row */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-slate-400 font-medium">Or choose format benchmark:</span>
                <button
                  type="button"
                  onClick={() => handleSelectFormatPreset('advannotech')}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-cyan-300 transition-colors cursor-pointer font-semibold text-[11px]"
                >
                  Advannotech Executive Standard (8 Sections)
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectFormatPreset('ieee')}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-slate-300 transition-colors cursor-pointer font-semibold text-[11px]"
                >
                  IEEE/ISO Formal Technical Spec
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectFormatPreset('agile')}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-slate-300 transition-colors cursor-pointer font-semibold text-[11px]"
                >
                  Agile PMO Executive Brief
                </button>
              </div>

              {/* Active Format Benchmark Card */}
              {formatBenchmark ? (
                <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs font-bold text-amber-300">
                        Active Format Benchmark: {formatBenchmark.fileName}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                        Target ~{formatBenchmark.targetWordCount.toLocaleString()} words
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleClearFormatBenchmark}
                      className="text-[11px] text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                    >
                      Clear Benchmark
                    </button>
                  </div>

                  <p className="text-xs text-slate-300">
                    {formatBenchmark.formatRulesSummary}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {formatBenchmark.detectedSections.map((sec, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-900/90 text-cyan-300 border border-cyan-500/30 font-medium"
                      >
                        §{idx + 1} {sec}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                  <span>
                    No custom example format uploaded yet. Using standard <strong>Advannotech Corporate Governance Format</strong> benchmark.
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSelectFormatPreset('advannotech')}
                    className="text-cyan-400 hover:text-cyan-300 font-semibold underline cursor-pointer"
                  >
                    Load Advannotech Preset
                  </button>
                </div>
              )}
            </div>

            {/* Re-analyze Button if Report is already generated */}
            {report && (
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleRunAudit}
                  disabled={isAuditing}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors cursor-pointer shadow-md shadow-cyan-500/20"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isAuditing ? 'animate-spin' : ''}`} />
                  <span>Re-Analyze Portfolio with Updated Requirements & Format</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* GENERATED ISO AUDIT REPORT DASHBOARD */}
      {report && (
        <div className="bg-[#0F172A] border border-cyan-500/30 rounded-2xl p-6 shadow-2xl space-y-6 animate-fade-in">
          {/* Executive Scorecard Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                  ISO 21500 / ISO 9001 Formal Audit
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Report ID: {report.id}
                </span>
              </div>
              <h2 className="text-xl font-black text-white tracking-tight">
                Enterprise Multi-Document Governance & Analytics Report
              </h2>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                {report.executiveSummary}
              </p>
            </div>

            {/* Scorecard Badges */}
            <div className="flex items-center gap-3 shrink-0">
              {/* Score Meter */}
              <div className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-900 border border-slate-800 min-w-[120px]">
                <span
                  className={`text-3xl font-black font-mono tracking-tight ${
                    report.portfolioRagStatus === 'GREEN'
                      ? 'text-emerald-400'
                      : report.portfolioRagStatus === 'AMBER'
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}
                >
                  {report.portfolioScore}%
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mt-0.5">
                  ISO Conformance
                </span>
              </div>

              {/* Consistency Index */}
              <div className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-900 border border-slate-800 min-w-[130px]">
                <span className="text-3xl font-black font-mono tracking-tight text-cyan-400">
                  {report.consistencyIndex}%
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mt-0.5">
                  Cross-Doc Consistency
                </span>
              </div>

              {/* RAG Status */}
              <div className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-900 border border-slate-800 min-w-[130px]">
                <span
                  className={`text-sm font-black px-2.5 py-1 rounded-lg border uppercase tracking-wider ${
                    report.portfolioRagStatus === 'GREEN'
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
                      : report.portfolioRagStatus === 'AMBER'
                      ? 'bg-amber-950 text-amber-300 border-amber-500/50'
                      : 'bg-rose-950 text-rose-300 border-rose-500/50'
                  }`}
                >
                  {report.portfolioRagStatus}
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mt-1">
                  Portfolio Health
                </span>
              </div>

              {/* Format Benchmark Match Meter */}
              {report.portfolioFormatMatchScore !== undefined && (
                <div className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-900 border border-slate-800 min-w-[130px]">
                  <span className="text-3xl font-black font-mono tracking-tight text-amber-400">
                    {report.portfolioFormatMatchScore}%
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mt-0.5">
                    Format Match
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Report Sub-navigation Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex flex-wrap gap-2 text-xs">
              <button
                onClick={() => setActiveReportTab('analytics')}
                className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeReportTab === 'analytics'
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Visual Analytics & Graphs (5)</span>
              </button>

              <button
                onClick={() => setActiveReportTab('documents')}
                className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeReportTab === 'documents'
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Document Register ({report.documents.length})</span>
              </button>

              <button
                onClick={() => setActiveReportTab('consistency')}
                className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeReportTab === 'consistency'
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Cross-Doc Traceability ({report.crossDocConsistency.length})</span>
              </button>

              <button
                onClick={() => setActiveReportTab('capa')}
                className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeReportTab === 'capa'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-amber-950/40 text-amber-300 hover:bg-amber-900 border border-amber-500/30'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>ISO CAPA Action Plan ({report.capaActions.length})</span>
              </button>

              <button
                onClick={() => setActiveReportTab('format-benchmark')}
                className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeReportTab === 'format-benchmark'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-amber-950/40 text-amber-300 hover:bg-amber-900 border border-amber-500/30'
                }`}
              >
                <FileCode className="w-3.5 h-3.5 text-amber-400" />
                <span>Format Benchmark Alignment</span>
              </button>
            </div>

            {/* Quick Export Dropdown / Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => exportMultiDocIsoCsv(report)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
                title="Download CSV of all metrics and scores"
              >
                CSV
              </button>
              <button
                onClick={() => exportMultiDocIsoReportDocx(report)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
                title="Download Microsoft Word (.docx) ISO report"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Word (.docx)</span>
              </button>
              <button
                onClick={() => exportMultiDocIsoReportHtml(report)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors cursor-pointer shadow-md shadow-cyan-500/20"
                title="Print or save as PDF formatted with embedded vector graphics"
              >
                <Printer className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Export PDF</span>
              </button>
            </div>
          </div>

          {/* TAB 1: VISUAL ANALYTICS & GRAPHICS */}
          {activeReportTab === 'analytics' && (
            <div className="space-y-6">
              {/* Row 1: Bar Chart + Radar Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Graph 1: Document Compliance Horizontal Bar Chart */}
                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
                      Document Compliance vs ISO Benchmark (85%)
                    </span>
                    <span className="text-[10px] text-cyan-400 font-mono">Horizontal Bar</span>
                  </div>
                  <div
                    className="overflow-hidden rounded-lg border border-slate-800 bg-[#0F172A]"
                    dangerouslySetInnerHTML={{ __html: barChartSvg }}
                  />
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Evaluates individual document score against ISO 21500 formal project governance benchmark (85% target threshold).
                  </p>
                </div>

                {/* Graph 2: PMBOK & ISO Performance Radar Chart */}
                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                      ISO 21500 & PMBOK Performance Radar
                    </span>
                    <span className="text-[10px] text-cyan-400 font-mono">Polar Spider Chart</span>
                  </div>
                  <div
                    className="overflow-hidden rounded-lg border border-slate-800 bg-[#0F172A] flex items-center justify-center p-2"
                    dangerouslySetInnerHTML={{ __html: radarChartSvg }}
                  />
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Polar mapping of 8 governance performance domains across the combined document portfolio.
                  </p>
                </div>
              </div>

              {/* Row 2: Donut Chart + Process Group Progress */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Graph 3: Donut Chart */}
                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <PieChart className="w-3.5 h-3.5 text-emerald-400" />
                      Portfolio RAG Status Distribution
                    </span>
                    <span className="text-[10px] text-cyan-400 font-mono">Donut Chart</span>
                  </div>
                  <div
                    className="overflow-hidden rounded-lg border border-slate-800 bg-[#0F172A] flex items-center justify-center p-2"
                    dangerouslySetInnerHTML={{ __html: donutChartSvg }}
                  />
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Breakdown of Green (Compliant), Amber (Observations), and Red (Non-Conformance) audit findings.
                  </p>
                </div>

                {/* Graph 4: Process Groups Life-Cycle */}
                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-amber-400" />
                      ISO 21500 Process Groups Coverage
                    </span>
                    <span className="text-[10px] text-cyan-400 font-mono">Stage Gates</span>
                  </div>
                  <div
                    className="overflow-hidden rounded-lg border border-slate-800 bg-[#0F172A] flex items-center justify-center p-2"
                    dangerouslySetInnerHTML={{ __html: processChartSvg }}
                  />
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Life-cycle distribution tracking ISO process group density from Initiating to Final Closing.
                  </p>
                </div>
              </div>

              {/* Row 3: Multi-ISO Standards Benchmark Comparison Chart */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                    Multi-ISO Standards Portfolio Conformance vs 85% Target
                  </span>
                  <span className="text-[10px] text-cyan-400 font-mono">ISO 21500 / 21502 / 9001 / 31000 / 27001</span>
                </div>
                <div
                  className="overflow-hidden rounded-lg border border-slate-800 bg-[#0F172A]"
                  dangerouslySetInnerHTML={{ __html: standardsComparisonSvg }}
                />
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Evaluates aggregated portfolio compliance across ISO 21500 (Governance), ISO 21502 (Project Delivery), ISO 9001 (Quality Assurance), ISO 31000 (Risk Contingency), and ISO/IEC 27001 (Cybersecurity & Information Protection).
                </p>
              </div>

              {/* Row 4: Governance Burndown Chart */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                    Portfolio CAPA Governance Burndown
                  </span>
                  <span className="text-[10px] text-cyan-400 font-mono">Velocity</span>
                </div>
                <BurndownChart 
                  actionItems={report.capaActions.map(a => ({ 
                    item: a.actionRequired, 
                    responsiblePerson: a.assignedLead || 'Advannotech', 
                    dueDate: a.dueDate || new Date().toISOString().split('T')[0],
                    priority: a.priority === 'RED' ? 'High' : a.priority === 'AMBER' ? 'Medium' : 'Low'
                  }))} 
                />
                <p className="text-[11px] text-slate-400 leading-relaxed italic">
                  Visualizing the resolution velocity of Corrective and Preventive Actions (CAPA) detected across the multi-document portfolio.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: DOCUMENT-BY-DOCUMENT REGISTER */}
          {activeReportTab === 'documents' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-400 flex items-center justify-between">
                <span>Detailed ISO 21500 & 9001 clause audits for all {report.documents.length} artifacts.</span>
                <span className="text-cyan-400 font-mono font-bold">
                  {report.documents.filter((d) => d.ragStatus === 'GREEN').length} Green Conforming
                </span>
              </div>

              <div className="space-y-3">
                {report.documents.map((doc) => {
                  const isExpanded = selectedDocId === doc.id;
                  const isGreen = doc.ragStatus === 'GREEN';
                  const isAmber = doc.ragStatus === 'AMBER';

                  return (
                    <div
                      key={doc.id}
                      className="rounded-xl border border-slate-800 bg-slate-900/70 overflow-hidden"
                    >
                      <div
                        onClick={() => setSelectedDocId(isExpanded ? null : doc.id)}
                        className="p-4 flex items-center justify-between gap-3 cursor-pointer select-none hover:bg-slate-800/40 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className={`text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider shrink-0 border ${
                              isGreen
                                ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
                                : isAmber
                                ? 'bg-amber-950 text-amber-300 border-amber-500/50'
                                : 'bg-rose-950 text-rose-300 border-rose-500/50'
                            }`}
                          >
                            {doc.ragStatus}: {doc.overallScore}%
                          </span>

                          <div className="truncate">
                            <span className="text-sm font-bold text-white block truncate">{doc.fileName}</span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              {doc.detectedType} • {doc.wordCount} words • {doc.clauses.length} ISO clauses checked
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="p-4 pt-2 border-t border-slate-800 space-y-3 bg-slate-950/60">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                              <strong className="text-emerald-400 block mb-1">ISO Conforming Strengths:</strong>
                              <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                                {doc.strengths.map((s, idx) => (
                                  <li key={idx}>{s}</li>
                                ))}
                              </ul>
                            </div>

                            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                              <strong className="text-amber-400 block mb-1">Audit Observations & Non-Conformance:</strong>
                              <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                                {doc.vulnerabilities.map((v, idx) => (
                                  <li key={idx}>{v}</li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* Clauses Breakdown Table */}
                          <div className="overflow-x-auto rounded-lg border border-slate-800">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-slate-900 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
                                <tr>
                                  <th className="p-2.5">Clause</th>
                                  <th className="p-2.5">Title</th>
                                  <th className="p-2.5">Score</th>
                                  <th className="p-2.5">Findings</th>
                                  <th className="p-2.5">Evidence Excerpt</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                                {doc.clauses.map((c, i) => (
                                  <tr key={i} className="hover:bg-slate-900/40">
                                    <td className="p-2.5 font-mono text-cyan-300 whitespace-nowrap">{c.clauseNumber}</td>
                                    <td className="p-2.5 font-semibold text-white whitespace-nowrap">{c.clauseTitle}</td>
                                    <td className="p-2.5 font-mono font-bold">{c.score}%</td>
                                    <td className="p-2.5 text-slate-300">{c.findings}</td>
                                    <td className="p-2.5 font-mono text-[10px] text-slate-400">{c.evidenceExcerpt}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: CROSS-DOCUMENT TRACEABILITY & CONSISTENCY MATRIX */}
          {activeReportTab === 'consistency' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-400 flex items-center justify-between">
                <span>Pairwise consistency checks detecting schedule drift, scope overlap, and budget divergence.</span>
                <span className="text-cyan-400 font-mono font-bold">
                  {report.consistencyIndex}% Portfolio Consistency Index
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/90 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
                    <tr>
                      <th className="p-3">Document Pair</th>
                      <th className="p-3">Alignment Domain</th>
                      <th className="p-3">Consistency</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Audit Observations & Synergies</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-slate-300">
                    {report.crossDocConsistency.map((item, idx) => {
                      const isAligned = item.status === 'Aligned';
                      const isConflict = item.status === 'Conflicting Data';

                      return (
                        <tr key={idx} className="hover:bg-slate-900/40">
                          <td className="p-3 font-semibold text-white">
                            <div className="text-cyan-300">{item.docA}</div>
                            <div className="text-slate-400 text-[10px]">vs {item.docB}</div>
                          </td>
                          <td className="p-3">{item.alignmentDomain}</td>
                          <td className="p-3 font-mono font-bold text-white">{item.consistencyScore}%</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                isAligned
                                  ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                                  : isConflict
                                  ? 'bg-rose-950 text-rose-300 border-rose-500/40'
                                  : 'bg-amber-950 text-amber-300 border-amber-500/40'
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>
                          <td className="p-3 text-slate-300 max-w-md">{item.observation}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: ISO CAPA ACTION PLAN */}
          {activeReportTab === 'capa' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-400 flex items-center justify-between">
                <span>Prioritized Corrective and Preventive Actions (CAPA) pursuant to ISO 9001 §10.2.</span>
                <span className="text-amber-400 font-semibold font-mono">
                  {report.capaActions.filter((c) => c.priority === 'RED').length} Critical Blockers
                </span>
              </div>

              <div className="space-y-3">
                {report.capaActions.map((action) => {
                  const isRed = action.priority === 'RED';

                  return (
                    <div
                      key={action.id}
                      className={`p-4 rounded-xl border ${
                        isRed
                          ? 'bg-rose-950/20 border-rose-500/40 shadow-xs'
                          : 'bg-amber-950/20 border-amber-500/30'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                                isRed
                                  ? 'bg-rose-950 text-rose-300 border-rose-500/50'
                                  : 'bg-amber-950 text-amber-300 border-amber-500/50'
                              }`}
                            >
                              {action.priority} Priority
                            </span>
                            <span className="font-mono text-xs font-bold text-white">{action.id}</span>
                            <span className="text-[10px] text-cyan-400 font-mono">({action.isoStandardRef})</span>
                          </div>

                          <h4 className="text-xs font-bold text-white">{action.clauseSummary}</h4>
                          <p className="text-xs text-slate-300">{action.actionRequired}</p>

                          <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-400">
                            <span>
                              Affected: <strong className="text-slate-200">{action.affectedDocuments.join(', ')}</strong>
                            </span>
                            <span>•</span>
                            <span>
                              Assignee: <strong className="text-amber-300">{action.assignedLead}</strong>
                            </span>
                            <span>•</span>
                            <span>Due: {action.dueDate}</span>
                          </div>
                        </div>

                        <span className="text-[10px] font-mono font-bold text-cyan-400 bg-slate-900 px-2 py-1 rounded border border-slate-800 shrink-0">
                          Pending Verification
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: FORMAT BENCHMARK CONFORMANCE REGISTER */}
          {activeReportTab === 'format-benchmark' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-amber-400" />
                    <span>Format Benchmark: Layout & Structural Conformance</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Benchmarking all uploaded documents against your target format example: <strong className="text-amber-300">{report.formatExample?.fileName || 'Advannotech Corporate Governance Standard'}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-mono font-bold px-3 py-1 rounded-lg bg-amber-950 text-amber-300 border border-amber-500/40">
                    Portfolio Match: {report.portfolioFormatMatchScore || 85}%
                  </span>
                </div>
              </div>

              {/* Active Benchmark Specification Overview */}
              {report.formatExample && (
                <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300">
                      Target Document Sections in Example ({report.formatExample.detectedSections.length}):
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Target Length: ~{report.formatExample.targetWordCount.toLocaleString()} words
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {report.formatExample.detectedSections.map((sec, sIdx) => (
                      <span key={sIdx} className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-cyan-300 border border-cyan-500/30 font-medium">
                        §{sIdx + 1} {sec}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Document-by-Document Format Conformance Breakdown */}
              <div className="space-y-4">
                {report.documents.map((doc) => {
                  const matchScore = doc.formatMatchScore ?? 85;
                  const matched = doc.matchedSections || [];
                  const missing = doc.missingFormatSections || [];

                  return (
                    <div
                      key={doc.id}
                      className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-cyan-400" />
                            <h4 className="text-sm font-bold text-white">{doc.fileName}</h4>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-mono">
                              {doc.detectedType}
                            </span>
                          </div>
                          <span className="text-xs text-slate-400 font-mono mt-0.5 block">
                            {doc.wordCount.toLocaleString()} words • {Math.round(doc.fileSize / 1024)} KB
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="text-xs text-slate-400 block">Format Score</span>
                            <span className={`text-lg font-black font-mono ${matchScore >= 85 ? 'text-emerald-400' : matchScore >= 70 ? 'text-amber-400' : 'text-rose-400'}`}>
                              {matchScore}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Section Alignment Register */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                            Matched Sections from Format Template ({matched.length})
                          </span>
                          {matched.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {matched.map((m, mIdx) => (
                                <span key={mIdx} className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                                  ✓ {m}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-500 italic">No exact section header matches found.</span>
                          )}
                        </div>

                        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                            Sections Missing to Achieve 100% Template Conformance ({missing.length})
                          </span>
                          {missing.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {missing.map((mis, misIdx) => (
                                <span key={misIdx} className="text-[10px] px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-500/30">
                                  + {mis}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-emerald-400 italic">✓ Fully conforms to all template section headings.</span>
                          )}
                        </div>
                      </div>

                      {/* Formatting Recommendation */}
                      <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2">
                        <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                        <div>
                          <strong>Formatting Guidance:</strong> {missing.length > 0
                            ? `To achieve publication-grade conformance with ${report.formatExample?.fileName || 'Advannotech format benchmark'}, synthesize missing clauses for ${missing.slice(0, 2).join(' and ')} and ensure dual-signoff endorsement blocks are present.`
                            : `Conforms to structural benchmarks. Maintain configuration control and version table consistency.`
                          }
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Report Footer Actions */}
          <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="text-xs text-slate-400">
              Auditor: <strong className="text-white">{report.auditorName}</strong> • {report.auditorOrg} • Conforms to ISO 21500:2021
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => exportMultiDocIsoCsv(report)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
              >
                Export CSV
              </button>
              <button
                onClick={() => exportMultiDocIsoReportDocx(report)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Word (.docx)</span>
              </button>
              <button
                onClick={() => exportMultiDocIsoReportHtml(report)}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors cursor-pointer shadow-md shadow-cyan-500/20"
              >
                <Printer className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Export Full Report (PDF)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
