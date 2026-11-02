import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Printer,
  Sparkles,
  Send,
  Eye,
  Edit3,
  FileSpreadsheet,
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  CheckCircle2,
  HelpCircle,
  Columns,
  RefreshCw,
  Loader2,
  Info,
  History,
  Layout,
  Layers,
  Flame,
  ShieldAlert,
  Users,
  Clock,
  TrendingDown,
  Network,
  BarChart3
} from 'lucide-react';
import { marked } from 'marked';
import { PMIDocumentDefinition } from '../data/documents';
import {
  exportDocx,
  exportMarkdown,
  exportActionItemsCsv,
  exportAuditReportPdf,
  exportAuditReportDocx,
  exportDocumentPdf,
  exportRasciCsv,
  ActionItemExport
} from '../utils/exportUtils';
import { DocumentCanvas } from './DocumentCanvas';
import { VersionHistoryDrawer, DocumentSnapshot } from './VersionHistoryDrawer';
import { ComplianceHeatmap, ComplianceItem, deriveSectionComplianceData } from './ComplianceHeatmap';
import { ImprovementEnginePanel } from './ImprovementEnginePanel';
import {
  ImprovementEngineItem,
  generateImprovementItems,
  applyImprovementFixToMarkdown
} from '../utils/improvementEngine';
import { RiskHeatmapChart } from './RiskHeatmapChart';
import { StakeholderImpactMatrix } from './StakeholderImpactMatrix';
import { INITIAL_STAKEHOLDERS, MatrixStakeholder } from '../data/projectRegisters';
import { ProjectRisk, extractRisksFromDocument } from '../utils/riskData';
import { StageDocDownloadModal } from './StageDocDownloadModal';
import { RasciSpreadsheet } from './RasciSpreadsheet';
import { ResourceAssignmentTimeline } from './ResourceAssignmentTimeline';
import { DependencyNetwork } from './DependencyNetwork';
import { RiskMitigationTrend } from './RiskMitigationTrend';
import { BurndownChart } from './BurndownChart';
import { ResourceLoadChart } from './ResourceLoadChart';

export interface AuditData {
  liftedContent: {
    section: string;
    sourceName: string;
    excerpt: string;
    priority: 'Critical' | 'High' | 'Medium' | 'Low';
  }[];
  excludedContent: {
    sourceName: string;
    excludedSummary: string;
    reason: string;
  }[];
  humanReviewAdvisories: {
    item: string;
    section: string;
    riskLevel: 'Critical' | 'High' | 'Medium';
    advisoryNote: string;
    recommendedAction: string;
    suggestedFix?: string;
  }[];
  complianceHeatmap?: ComplianceItem[];
  actionItems?: ActionItemExport[];
}

interface Step5ReviewProps {
  selectedDoc: PMIDocumentDefinition;
  markdown: string;
  onChangeMarkdown: (newMd: string) => void;
  auditData: AuditData | null;
  docCode: string;
  date: string;
  projectName: string;
  onRefine: (instruction: string) => Promise<void>;
  isRefining: boolean;
  onStartOver: () => void;
  onOpenAgendas?: () => void;
  selectedStandard?: 'PMBOK 7' | 'PMBOK 8' | 'PRINCE2 7';
  customLogo?: string | null;
  selectedResources?: any[];
  selectedSections?: string[];
  onAddSection?: (title: string) => void;
  onReorderSections?: (newOrder: string[]) => void;
  answers?: Record<string, string>;
  verifiedTimelineData?: Record<string, string> | null;
  stakeholderMatrix: MatrixStakeholder[];
  projectRisks: ProjectRisk[];
}

const PMBOK_PRINCIPLES = [
  { id: 'stewardship', name: 'Stewardship', description: 'Be a diligent, respectful, and caring steward.', keywords: ['governance', 'approval', 'roles', 'executive summary', 'charter', 'sponsor', 'authority'] },
  { id: 'team', name: 'Team', description: 'Create a collaborative project team environment.', keywords: ['team', 'resource', 'raci', 'rasci', 'roles', 'onboarding', 'release'] },
  { id: 'stakeholders', name: 'Stakeholders', description: 'Effectively engage with stakeholders.', keywords: ['stakeholder', 'engagement', 'communication', 'interest', 'power', 'influence'] },
  { id: 'value', name: 'Value', description: 'Focus on value.', keywords: ['business case', 'objectives', 'benefits', 'success criteria', 'value', 'roi', 'need'] },
  { id: 'systems-thinking', name: 'Systems Thinking', description: 'Recognize, evaluate, and respond to system interactions.', keywords: ['integration', 'dependencies', 'complexity', 'assumptions', 'constraints', 'holistic'] },
  { id: 'leadership', name: 'Leadership', description: 'Demonstrate leadership behaviors.', keywords: ['sponsor', 'project manager', 'governance', 'steering committee', 'lead', 'chair'] },
  { id: 'tailoring', name: 'Tailoring', description: 'Tailor based on context.', keywords: ['methodology', 'approach', 'framework', 'custom', 'adapted', 'standard'] },
  { id: 'quality', name: 'Quality', description: 'Build quality into processes and deliverables.', keywords: ['quality', 'metric', 'compliance', 'standard', 'uat', 'testing', 'defect', 'inspection'] },
  { id: 'complexity', name: 'Complexity', description: 'Address complexity.', keywords: ['risk', 'assumption', 'complexity', 'technical feasibility', 'uncertainty'] },
  { id: 'risk', name: 'Risk', description: 'Optimize risk responses.', keywords: ['risk', 'contingency', 'reserves', 'mitigation', 'opportunity', 'treat'] },
  { id: 'adaptability', name: 'Adaptability and Resilience', description: 'Embrace adaptability and resilience.', keywords: ['change', 'agile', 'contingency', 'alternative', 'flexible', 'emerging'] },
  { id: 'change', name: 'Change', description: 'Enable change to achieve the envisioned future state.', keywords: ['change management', 'change control', 'transition', 'handover', 'transformation'] },
];

export const Step5Review: React.FC<Step5ReviewProps> = ({
  selectedDoc,
  markdown,
  onChangeMarkdown,
  auditData,
  docCode,
  date,
  projectName,
  onRefine,
  isRefining,
  onStartOver,
  onOpenAgendas,
  selectedStandard,
  customLogo,
  selectedResources,
  selectedSections,
  onAddSection,
  onReorderSections,
  answers,
  verifiedTimelineData,
  stakeholderMatrix,
  projectRisks,
}) => {
  const [activeTab, setActiveTab] = useState<'canvas' | 'preview' | 'editor' | 'split' | 'audit' | 'timeline'>('canvas');
  const [auditSubView, setAuditSubView] = useState<'improvement' | 'heatmap' | 'coverage' | 'risk-matrix' | 'risk-trend' | 'burndown' | 'resource-load' | 'stakeholders' | 'dependencies' | 'provenance' | 'advisories'>('improvement');
  const [isMonochromeLogo, setIsMonochromeLogo] = useState<boolean>(true);
  const [refinePrompt, setRefinePrompt] = useState('');
  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);
  const [acknowledgedAdvisories, setAcknowledgedAdvisories] = useState<Record<number, boolean>>({});
  // Stage Document Completion Pop-up Download Modal
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(true);

  // We use props passed from App.tsx for centralized state consistency

  // Compute Improvement Engine items for RED & AMBER remediation
  const improvementItems = React.useMemo(() => {
    return generateImprovementItems(auditData, selectedDoc, []);
  }, [auditData, selectedDoc]);

  // Compute Section-Level Compliance Data (Simplified RAG Status for all sections)
  const sectionsCompliance = React.useMemo(() => {
    return deriveSectionComplianceData(selectedSections || selectedDoc.requiredSections, auditData, markdown, selectedDoc.requiredSections);
  }, [selectedSections, selectedDoc.requiredSections, auditData, markdown]);

  const greenSections = sectionsCompliance.filter((s) => s.ragStatus === 'GREEN');
  const amberSections = sectionsCompliance.filter((s) => s.ragStatus === 'AMBER');
  const redSections = sectionsCompliance.filter((s) => s.ragStatus === 'RED');

  // Version Control Snapshots
  const [snapshots, setSnapshots] = useState<DocumentSnapshot[]>([
    {
      id: 'snap-v1',
      version: 'v1.0',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      markdown,
      notes: 'Initial formal release draft',
      wordCount: markdown.trim() ? markdown.trim().split(/\s+/).length : 0,
      charCount: markdown.length,
    },
  ]);
  const [activeSnapshotId, setActiveSnapshotId] = useState<string | null>('snap-v1');
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);

  // Sync initial snapshot if markdown was empty when component initialized
  useEffect(() => {
    if (snapshots.length === 1 && snapshots[0].markdown.length === 0 && markdown.length > 0) {
      setSnapshots([
        {
          id: 'snap-v1',
          version: 'v1.0',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          markdown,
          notes: 'Initial formal release draft',
          wordCount: markdown.trim() ? markdown.trim().split(/\s+/).length : 0,
          charCount: markdown.length,
        },
      ]);
    }
  }, [markdown]);

  const handleCreateSnapshot = (notes: string) => {
    const nextVerNum = (snapshots.length * 0.1 + 1.0).toFixed(1);
    const newSnap: DocumentSnapshot = {
      id: `snap-${Date.now()}`,
      version: `v${nextVerNum}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      markdown,
      notes,
      wordCount: markdown.trim() ? markdown.trim().split(/\s+/).length : 0,
      charCount: markdown.length,
    };
    setSnapshots((prev) => [...prev, newSnap]);
    setActiveSnapshotId(newSnap.id);
  };

  const handleRestoreSnapshot = (snap: DocumentSnapshot) => {
    onChangeMarkdown(snap.markdown);
    setActiveSnapshotId(snap.id);
  };

  const handleDeleteSnapshot = (id: string) => {
    setSnapshots((prev) => prev.filter((s) => s.id !== id));
  };

  const handleRefineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refinePrompt.trim() || isRefining) return;
    const prompt = refinePrompt.trim();
    setRefinePrompt('');

    // Pre-snapshot before refinement
    handleCreateSnapshot(`Pre-refine: ${prompt.slice(0, 30)}...`);

    await onRefine(prompt);
  };

  const showNotice = (msg: string) => {
    setDownloadNotice(msg);
    setTimeout(() => setDownloadNotice(null), 3500);
  };

  const handleExportPdf = async () => {
    try {
      setIsExportingPdf(true);
      await exportDocumentPdf(markdown, docCode, selectedDoc.title, projectName, date, customLogo, isMonochromeLogo, answers);
      showNotice(`✓ Direct PDF download initiated: ${docCode}_${selectedDoc.title}.pdf`);
    } catch (err: any) {
      console.error('PDF export error:', err);
      // Fallback: try browser print
      try {
        window.print();
      } catch (printErr) {
        showNotice('Failed to generate PDF. Markdown downloaded instead.');
        exportMarkdown(markdown, docCode, selectedDoc.title);
      }
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handlePrint = () => {
    try {
      window.print();
    } catch {
      handleExportPdf();
    }
  };

  const handleExportWord = async () => {
    try {
      setIsExportingDocx(true);
      await exportDocx(markdown, docCode, selectedDoc.title, projectName, date);
      showNotice(`✓ Word document download initiated: ${docCode}.docx`);
    } catch (err: any) {
      console.error('Word export error:', err);
      showNotice('Word export encountered an issue; downloading Markdown copy.');
      exportMarkdown(markdown, docCode, selectedDoc.title);
    } finally {
      setIsExportingDocx(false);
    }
  };

  const handleExportMarkdown = () => {
    exportMarkdown(markdown, docCode, selectedDoc.title);
    showNotice(`✓ Markdown download initiated: ${docCode}.md`);
  };

  const handleExportCsv = () => {
    if (selectedDoc.id === 'rasci-matrix') {
      // Parse markdown to get rows for CSV export
      const lines = markdown.split('\n');
      const tableStartIndex = lines.findIndex(l => l.includes('| Task / Deliverable |') || l.includes('| Task |'));
      if (tableStartIndex !== -1) {
        const dataLines = lines.slice(tableStartIndex + 2).filter(l => l.trim().startsWith('|'));
        const rows = dataLines.map((line) => {
          const parts = line.split('|').map(p => p.trim());
          return {
            task: parts[1] || '',
            responsible: parts[2] || '',
            accountable: parts[3] || '',
            supportive: parts[4] || '',
            consulted: parts[5] || '',
            informed: parts[6] || ''
          };
        });
        exportRasciCsv(rows, docCode);
        showNotice(`✓ RASCI Matrix CSV download initiated`);
      }
      return;
    }
    if (!auditData?.actionItems || auditData.actionItems.length === 0) return;
    exportActionItemsCsv(auditData.actionItems, docCode, selectedDoc.title);
    showNotice(`✓ Action items CSV download initiated`);
  };

  const handleExportAuditReport = () => {
    if (!auditData) return;
    exportAuditReportPdf(
      auditData,
      docCode,
      selectedDoc.title,
      projectName,
      date,
      acknowledgedAdvisories,
      improvementItems,
      projectRisks,
      stakeholderMatrix
    );
  };

  const handleExportAuditDocx = async () => {
    if (!auditData) return;
    await exportAuditReportDocx(
      auditData,
      docCode,
      selectedDoc.title,
      projectName,
      date,
      improvementItems,
      projectRisks,
      stakeholderMatrix
    );
  };

  const handleApplyImprovementFix = (item: ImprovementEngineItem, customData?: string) => {
    const updated = applyImprovementFixToMarkdown(markdown, item, customData);
    onChangeMarkdown(updated);
    handleCreateSnapshot(`Improvement Engine: Remediated [${item.flag}] ${item.title}`);
  };

  const toggleAdvisory = (idx: number) => {
    setAcknowledgedAdvisories((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const handleApplyAdvisoryFix = (adv: any, idx: number) => {
    const fixText = adv.suggestedFix || adv.recommendedAction;
    const sectionTarget = `### ${adv.section}`;
    let updatedMd = markdown;
    if (updatedMd.includes(sectionTarget)) {
      updatedMd = updatedMd.replace(
        sectionTarget,
        `${sectionTarget}\n\n> [Advannotech Compliance Remediation - ${adv.item}]:\n> ${fixText}\n`
      );
    } else {
      updatedMd = `${updatedMd}\n\n### ${adv.section} (Remediated Compliance Clause)\n> [Advannotech Compliance Remediation - ${adv.item}]:\n> ${fixText}\n`;
    }
    onChangeMarkdown(updatedMd);
    toggleAdvisory(idx);
    setActiveTab('canvas');
  };

  const isMeetingMinutes = selectedDoc.id === 'meeting-minutes';
  const htmlContent = marked.parse(markdown) as string;

  const totalAdvisories = auditData?.humanReviewAdvisories?.length || 0;
  const acknowledgedCount = Object.values(acknowledgedAdvisories).filter(Boolean).length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header & Export Toolbar */}
      <div className="no-print bg-[#0F172A] border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs">
            <span className="font-mono font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
              {docCode}
            </span>
            <span className="text-slate-400">· Version 1.0 · {date}</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Audit-Ready
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight mt-1">
            {selectedDoc.title}
          </h2>
        </div>

        {/* Action & Export Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Suggested Meeting Agendas Trigger */}
          {onOpenAgendas && (
            <button
              onClick={onOpenAgendas}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 hover:border-cyan-500/40 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-xs"
              title="Browse suggested agendas for Stakeholder meetings, update calls, kick-off & close-out sessions"
            >
              <FileCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Meeting Agendas</span>
            </button>
          )}

          {/* Version Control Snapshots Button */}
          <button
            onClick={() => setIsHistoryDrawerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 hover:border-cyan-500/40 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-xs"
            title="Open Version Control & Snapshot history"
          >
            <History className="w-3.5 h-3.5 text-cyan-400" />
            <span>Versions ({snapshots.length})</span>
          </button>

          {/* Audit Inspector Tab Pill */}
          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
              activeTab === 'audit'
                ? 'bg-amber-950 border-amber-400 text-amber-200 shadow-sm'
                : 'bg-slate-900 border-slate-700 text-amber-300 hover:bg-slate-800'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Compliance & Audit</span>
            {totalAdvisories > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-amber-500 text-slate-950 rounded-full text-[10px] font-black">
                {totalAdvisories}
              </span>
            )}
          </button>

          {/* Word .docx */}
          <button
            onClick={handleExportWord}
            disabled={isExportingDocx}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-950/90 hover:bg-blue-900 text-blue-200 border border-blue-500/40 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs"
            title="Download formal Microsoft Word document (.docx)"
          >
            {isExportingDocx ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5 text-blue-400" />
            )}
            <span>Export Word (.docx)</span>
          </button>

          {/* Export Audit Report PDF */}
          {auditData && (
            <button
              onClick={handleExportAuditReport}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-950/80 hover:bg-amber-900 text-amber-200 border border-amber-500/40 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs"
              title="Download formal Provenance & Exclusion Audit Report (PDF)"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Audit Report PDF</span>
            </button>
          )}

          {/* Pop-up Stage Download Modal Button */}
          <button
            onClick={() => setIsDownloadModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-950 to-teal-950 hover:from-emerald-900 hover:to-teal-900 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs hover:scale-[1.02]"
            title="Open stage completion pop-up download dialog"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Download Modal</span>
          </button>

          {/* Download PDF (Direct Binary PDF Download with jsPDF) */}
          <button
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 font-bold rounded-lg text-xs transition-all cursor-pointer shadow-md shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98]"
            title="Download clean multi-page A4 PDF directly to your computer"
          >
            {isExportingPdf ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
            )}
            <span>Download PDF</span>
          </button>

          {/* Browser Print View (utilizing print styles defined in index.css) */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-lg text-xs font-semibold transition-all cursor-pointer"
            title="Open browser print dialogue (A4 formatted with index.css)"
          >
            <Printer className="w-3.5 h-3.5 text-slate-400" />
            <span>Print</span>
          </button>

          {/* Logo Rendering Toggle */}
          {customLogo && (
            <div className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-[10px] font-bold">
              <span className="text-slate-500 uppercase tracking-tighter">Logo:</span>
              <button
                onClick={() => setIsMonochromeLogo(!isMonochromeLogo)}
                className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                  isMonochromeLogo 
                    ? 'bg-slate-700 text-white' 
                    : 'bg-cyan-500 text-slate-950'
                }`}
              >
                {isMonochromeLogo ? 'Monochrome' : 'Full Color'}
              </button>
            </div>
          )}

          {/* Markdown .md */}
          <button
            onClick={handleExportMarkdown}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-lg text-xs font-semibold transition-all cursor-pointer"
            title="Download raw markdown file"
          >
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>.MD</span>
          </button>

          {/* Meeting Minutes Action Items CSV */}
          {isMeetingMinutes && auditData?.actionItems && auditData.actionItems.length > 0 && (
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-semibold transition-all cursor-pointer"
              title="Download Action Items spreadsheet (.csv)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Action Items CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* Refine prompt input bar */}
      <div className="no-print bg-[#0F172A] border border-cyan-500/30 rounded-xl p-3 shadow-md">
        <form onSubmit={handleRefineSubmit} className="flex items-center gap-2">
          <div className="relative flex-1">
            <Sparkles className="w-4 h-4 text-cyan-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={refinePrompt}
              onChange={(e) => setRefinePrompt(e.target.value)}
              placeholder="Refine draft (e.g. 'Expand the risk mitigation contingencies', 'Add formal sign-off line for CFO', 'Tighten ISO 27001 wording')..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <button
            type="submit"
            disabled={!refinePrompt.trim() || isRefining}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all shrink-0 cursor-pointer ${
              refinePrompt.trim() && !isRefining
                ? 'bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            {isRefining ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>{isRefining ? 'Refining...' : 'Refine'}</span>
          </button>
        </form>
      </div>

      {/* View Switcher Tabs (Canvas [Default], Preview, Editor, Split, Audit) */}
      <div className="no-print flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('canvas')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
              activeTab === 'canvas'
                ? 'bg-gradient-to-r from-cyan-950 to-sky-950 text-cyan-200 border border-cyan-500/50 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layout className="w-3.5 h-3.5 text-cyan-400" />
            <span>Document Canvas (Easy Edit)</span>
          </button>

          <button
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
              activeTab === 'preview'
                ? 'bg-cyan-950 text-cyan-200 border border-cyan-500/40 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Formatted Preview</span>
          </button>

          <button
            onClick={() => setActiveTab('editor')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
              activeTab === 'editor'
                ? 'bg-cyan-950 text-cyan-200 border border-cyan-500/40 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Raw Markdown</span>
          </button>

          <button
            onClick={() => setActiveTab('split')}
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
              activeTab === 'split'
                ? 'bg-cyan-950 text-cyan-200 border border-cyan-500/40 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Split View</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
              activeTab === 'audit'
                ? 'bg-amber-950 text-amber-200 border border-amber-500/40 shadow-xs'
                : 'text-amber-400/80 hover:text-amber-300'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Compliance & Audit</span>
          </button>

          {selectedDoc.phase === 'Monitoring & Controlling' && (
            <button
              onClick={() => setActiveTab('timeline')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                activeTab === 'timeline'
                  ? 'bg-cyan-950 text-cyan-200 border border-cyan-500/50 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Resource Timeline</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleCreateSnapshot(`Snapshot ${snapshots.length + 1}`)}
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
            title="Create a point-in-time snapshot of the document"
          >
            <History className="w-3.5 h-3.5" />
            <span>Snapshot State</span>
          </button>

          <button
            onClick={onStartOver}
            className="text-xs text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
          >
            Generate Another Document &rarr;
          </button>
        </div>
      </div>

      {/* Simplified Color-Coded Section Compliance Heatmap (PMBOK RAG Summary) */}
      {sectionsCompliance && sectionsCompliance.length > 0 && (
        <div className="no-print bg-[#0F172A] border border-slate-800 rounded-xl p-3.5 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 uppercase tracking-wider">
                Section Compliance Heatmap
              </span>
              <span className="text-xs text-white font-bold">
                PMBOK Coverage & RAG Health Summary
              </span>
            </div>

            <div className="flex items-center gap-3 text-[11px] font-mono">
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                {greenSections.length} Green
              </span>
              <span className="text-amber-400 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                {amberSections.length} Amber
              </span>
              <span className="text-rose-400 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                {redSections.length} Red
              </span>
              <button
                onClick={() => {
                  setActiveTab('audit');
                  setAuditSubView('heatmap');
                }}
                className="text-cyan-400 hover:text-cyan-300 font-semibold underline ml-1 cursor-pointer"
              >
                Full Heatmap &rarr;
              </button>
            </div>
          </div>

          {/* Horizontal Color-Coded Heatmap Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {sectionsCompliance.map((sec, idx) => {
              const isGreen = sec.ragStatus === 'GREEN';
              const isAmber = sec.ragStatus === 'AMBER';
              return (
                <div
                  key={idx}
                  onClick={() => {
                    setActiveTab('canvas');
                  }}
                  className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                    isGreen
                      ? 'bg-emerald-950/40 border-emerald-500/40 hover:border-emerald-400 text-emerald-200'
                      : isAmber
                      ? 'bg-amber-950/40 border-amber-500/40 hover:border-amber-400 text-amber-200'
                      : 'bg-rose-950/40 border-rose-500/50 hover:border-rose-400 text-rose-200'
                  }`}
                  title={`${sec.sectionName}: ${sec.confidenceScore}% (${sec.ragStatus}) - ${sec.findings}`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                    <span className="truncate max-w-[80px]">SEC {idx + 1}</span>
                    <span className="font-bold">{sec.confidenceScore}%</span>
                  </div>
                  <div className="text-[11px] font-bold truncate text-white leading-tight">
                    {sec.sectionName}
                  </div>
                  <div className="mt-1 w-full bg-slate-900 h-1 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${isGreen ? 'bg-emerald-400' : isAmber ? 'bg-amber-400' : 'bg-rose-500'}`}
                      style={{ width: `${sec.confidenceScore}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEWPORT BODY */}
      <div>
        {/* TAB 1: DOCUMENT CANVAS (EASY EDIT) */}
        {activeTab === 'canvas' && (
          selectedDoc.id === 'rasci-matrix' ? (
            <RasciSpreadsheet
              markdown={markdown}
              onChangeMarkdown={onChangeMarkdown}
              docCode={docCode}
              docTitle={selectedDoc.title}
              projectName={projectName}
              date={date}
              onExportPdf={handleExportPdf}
            />
          ) : (
            <DocumentCanvas
              markdown={markdown}
              onChangeMarkdown={onChangeMarkdown}
              docCode={docCode}
              docTitle={selectedDoc.title}
              projectName={projectName}
              date={date}
              onExportWord={handleExportWord}
              onExportPdf={handleExportPdf}
              isExportingWord={isExportingDocx}
            />
          )
        )}

        {/* TAB 2: AUDIT, COMPLIANCE HEATMAP & PROVENANCE INSPECTOR */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            {/* Audit Sub-navigation */}
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
              <button
                onClick={() => setAuditSubView('improvement')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  auditSubView === 'improvement'
                    ? 'bg-amber-950 text-amber-200 border border-amber-500/50 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>⚡ Improvement Engine ({improvementItems.length})</span>
              </button>

              <button
                onClick={() => setAuditSubView('heatmap')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  auditSubView === 'heatmap'
                    ? 'bg-cyan-950 text-cyan-200 border border-cyan-500/50'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-cyan-400" />
                <span>Compliance Heatmap</span>
              </button>

              <button
                onClick={() => setAuditSubView('coverage')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  auditSubView === 'coverage'
                    ? 'bg-blue-950 text-blue-200 border border-blue-500/50 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>Audit Coverage (PMBOK 7)</span>
              </button>

              <button
                onClick={() => setAuditSubView('risk-matrix')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  auditSubView === 'risk-matrix'
                    ? 'bg-rose-950 text-rose-200 border border-rose-500/50'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                <span>🎯 Risk Heatmap ({projectRisks.length})</span>
              </button>

              <button
                onClick={() => setAuditSubView('risk-trend')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  auditSubView === 'risk-trend'
                    ? 'bg-rose-950 text-rose-200 border border-rose-500/50'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                <span>Risk Trend</span>
              </button>

              <button
                onClick={() => setAuditSubView('burndown')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  auditSubView === 'burndown'
                    ? 'bg-cyan-950 text-cyan-200 border border-cyan-500/50'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <TrendingDown className="w-3.5 h-3.5 text-cyan-400" />
                <span>Burndown</span>
              </button>

              <button
                onClick={() => setAuditSubView('resource-load')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  auditSubView === 'resource-load'
                    ? 'bg-blue-950 text-blue-200 border border-blue-500/50'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
                <span>Resource Load</span>
              </button>

              <button
                onClick={() => setAuditSubView('stakeholders')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  auditSubView === 'stakeholders'
                    ? 'bg-cyan-950 text-cyan-200 border border-cyan-500/50'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                <span>👥 Stakeholder Matrix ({stakeholderMatrix.length})</span>
              </button>

              <button
                onClick={() => setAuditSubView('dependencies')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  auditSubView === 'dependencies'
                    ? 'bg-indigo-950 text-indigo-200 border border-indigo-500/50 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Network className="w-3.5 h-3.5 text-indigo-400" />
                <span>🔗 Dependency Network</span>
              </button>

              <button
                onClick={() => setAuditSubView('provenance')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  auditSubView === 'provenance'
                    ? 'bg-cyan-950 text-cyan-200 border border-cyan-500/50'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Source Provenance ({auditData?.liftedContent?.length || 0})</span>
              </button>

              <button
                onClick={() => setAuditSubView('advisories')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  auditSubView === 'advisories'
                    ? 'bg-amber-950 text-amber-200 border border-amber-500/50'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Gaps & RAG Fix Priority ({totalAdvisories})</span>
              </button>

              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={handleExportAuditDocx}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg text-xs border border-slate-700 transition-all cursor-pointer"
                  title="Export Audit Report as Word Document"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Audit (Word)</span>
                </button>

                <button
                  onClick={handleExportAuditReport}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs shadow-md transition-all cursor-pointer"
                  title="Print / Save Audit Report as PDF"
                >
                  <Printer className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Audit (PDF)</span>
                </button>
              </div>
            </div>

            {/* Sub-view: PMBOK Improvement Engine */}
            {auditSubView === 'improvement' && (
              <ImprovementEnginePanel
                items={improvementItems}
                onApplyFix={handleApplyImprovementFix}
                docTitle={selectedDoc.title}
                projectName={projectName}
              />
            )}

            {/* Sub-view: PMBOK Compliance Heatmap */}
            {auditSubView === 'heatmap' && (
              <ComplianceHeatmap
                heatmapData={auditData?.complianceHeatmap || []}
                requiredSections={selectedSections || selectedDoc.requiredSections}
                originalRequiredSections={selectedDoc.requiredSections}
                auditData={auditData}
                markdown={markdown}
                onSelectSection={() => setActiveTab('canvas')}
                onAddSection={onAddSection}
                onReorderSections={onReorderSections}
              />
            )}

            {/* Sub-view: Audit Coverage (PMBOK 7 Principles Mapping) */}
            {auditSubView === 'coverage' && (
              <div className="bg-[#0F172A] border border-blue-500/30 rounded-xl overflow-hidden animate-in fade-in duration-500">
                <div className="bg-blue-950/20 px-6 py-4 border-b border-blue-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/30">
                      <ShieldCheck className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">PMBOK 7th Edition Principles Coverage</h3>
                      <p className="text-[10px] text-blue-300/70 mt-0.5">Audit mapping of generated sections against the 12 Principles of Project Management</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-blue-950/40 rounded-full border border-blue-500/20">
                    <span className="text-[10px] font-bold text-blue-300 uppercase">Status:</span>
                    <span className="text-xs font-black text-white">
                      {Math.round((PMBOK_PRINCIPLES.filter(p => {
                        const currentSections = selectedSections || selectedDoc.requiredSections;
                        return p.keywords.some(kw => currentSections.some(s => s.toLowerCase().includes(kw)));
                      }).length / 12) * 100)}% Coverage
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase font-mono text-[10px]">
                      <tr>
                        <th className="p-4 w-1/4">Principle</th>
                        <th className="p-4 w-1/3">Description</th>
                        <th className="p-4 w-1/4">Covered By Section(s)</th>
                        <th className="p-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 text-slate-300">
                      {PMBOK_PRINCIPLES.map((principle) => {
                        const currentSections = selectedSections || selectedDoc.requiredSections;
                        const matchedSections = currentSections.filter(s => 
                          principle.keywords.some(kw => s.toLowerCase().includes(kw))
                        );
                        const isCovered = matchedSections.length > 0;

                        return (
                          <tr key={principle.id} className="hover:bg-blue-500/5 transition-colors group">
                            <td className="p-4">
                              <div className="flex flex-col">
                                <span className="font-bold text-white group-hover:text-blue-300 transition-colors">{principle.name}</span>
                                <span className="text-[9px] text-slate-500 mt-1 font-mono uppercase tracking-tighter">PMBOK 7.1.x</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <p className="text-slate-400 leading-relaxed italic">"{principle.description}"</p>
                            </td>
                            <td className="p-4">
                              {isCovered ? (
                                <div className="flex flex-wrap gap-1.5">
                                  {matchedSections.map((s, idx) => (
                                    <span key={idx} className="px-2 py-0.5 bg-blue-500/10 text-blue-300 border border-blue-500/20 rounded text-[9px] font-semibold whitespace-nowrap">
                                      {s.split('.')[0] === s ? s : s.split('.')[1]?.trim() || s}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-slate-600 italic">No direct section mapping identified</span>
                              )}
                            </td>
                            <td className="p-4 text-center">
                              {isCovered ? (
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full text-[10px] font-bold">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Covered</span>
                                </div>
                              ) : (
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded-full text-[10px] font-bold">
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                  <span>Missing</span>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 bg-blue-950/10 border-t border-blue-500/20 flex items-center gap-3">
                  <div className="p-2 rounded-full bg-blue-500/20">
                    <Info className="w-4 h-4 text-blue-300" />
                  </div>
                  <p className="text-xs text-blue-300/80 leading-relaxed">
                    <strong>Governance Note:</strong> This audit coverage mapping is based on semantic keyword matching between PMBOK principles and your chosen document structure. 
                    Adding custom sections or including specific terminology in your draft can further align the document with PMBOK standards.
                  </p>
                </div>
              </div>
            )}

            {/* Sub-view: Automated Risk Probability vs Impact Heatmap (Recharts) */}
            {auditSubView === 'risk-matrix' && (
              <RiskHeatmapChart
                risks={projectRisks}
                onUpdateRisks={() => {}} 
                projectName={projectName}
              />
            )}

            {/* Sub-view: Risk Mitigation Trend (D3.js) */}
            {auditSubView === 'risk-trend' && (
              <RiskMitigationTrend risks={projectRisks} />
            )}

            {/* Sub-view: Governance Burndown (D3.js) */}
            {auditSubView === 'burndown' && (
              <BurndownChart actionItems={auditData?.actionItems || []} />
            )}

            {/* Sub-view: Resource Load (D3.js) */}
            {auditSubView === 'resource-load' && (
              <ResourceLoadChart resources={selectedResources || []} projectName={projectName} />
            )}

            {/* Sub-view: Stakeholder Impact Matrix (D3) */}
            {auditSubView === 'stakeholders' && (
              <StakeholderImpactMatrix
                stakeholders={stakeholderMatrix}
                onUpdateStakeholders={() => {}} 
                projectName={projectName}
              />
            )}

            {/* Sub-view: Dependency & Communication Network (D3) */}
            {auditSubView === 'dependencies' && (
              <DependencyNetwork 
                stakeholders={stakeholderMatrix}
                risks={projectRisks}
                projectName={projectName}
              />
            )}

            {/* Sub-view: Provenance Matrix & Exclusions */}
            {auditSubView === 'provenance' && (
              <div className="space-y-6">
                {/* Section Contribution Matrix */}
                <div className="bg-[#0F172A] border border-slate-800 rounded-xl overflow-hidden">
                  <div className="bg-slate-900/90 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
                      <FileCheck className="w-4 h-4 text-cyan-400" />
                      <span>Lifted Evidence & Contribution Matrix ({auditData?.liftedContent?.length || 0})</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">Verified Origins</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase font-mono text-[10px]">
                        <tr>
                          <th className="p-3">Section</th>
                          <th className="p-3">Source Origin</th>
                          <th className="p-3">Lifted Excerpt / Evidence</th>
                          <th className="p-3">Priority</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80 text-slate-300">
                        {auditData?.liftedContent?.map((item, i) => (
                          <tr key={i} className="hover:bg-slate-900/40">
                            <td className="p-3 font-semibold text-white whitespace-nowrap">{item.section}</td>
                            <td className="p-3 font-mono text-cyan-300 whitespace-nowrap">{item.sourceName}</td>
                            <td className="p-3 text-slate-300">{item.excerpt}</td>
                            <td className="p-3 whitespace-nowrap">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                  item.priority === 'Critical'
                                    ? 'bg-rose-950 text-rose-300 border-rose-500/40'
                                    : item.priority === 'High'
                                    ? 'bg-amber-950 text-amber-300 border-amber-500/40'
                                    : 'bg-slate-900 text-slate-300 border-slate-700'
                                }`}
                              >
                                {item.priority}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Excluded Content Log */}
                <div className="bg-[#0F172A] border border-slate-800 rounded-xl overflow-hidden">
                  <div className="bg-slate-900/90 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <Info className="w-4 h-4 text-slate-400" />
                      <span>Excluded Source Content ({auditData?.excludedContent?.length || 0})</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">Exclusion Justifications</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase font-mono text-[10px]">
                        <tr>
                          <th className="p-3">Source Name</th>
                          <th className="p-3">Excluded Content Summary</th>
                          <th className="p-3">Justification for Exclusion</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80 text-slate-300">
                        {auditData?.excludedContent?.map((item, i) => (
                          <tr key={i} className="hover:bg-slate-900/40">
                            <td className="p-3 font-mono text-slate-400 whitespace-nowrap">{item.sourceName}</td>
                            <td className="p-3 text-slate-300">{item.excludedSummary}</td>
                            <td className="p-3 text-amber-300/80 font-mono text-[11px]">{item.reason}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Sub-view: Gaps & RAG Fix Priorities */}
            {auditSubView === 'advisories' && (
              <div className="bg-[#0F172A] border border-amber-500/40 rounded-xl overflow-hidden">
                <div className="bg-amber-950/30 px-4 py-3 border-b border-amber-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>Forensic Gaps & RAG Fix Priority Register ({totalAdvisories})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-500/40">
                      RED: Critical
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/40">
                      AMBER: Medium
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/40">
                      GREEN: Low
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  {auditData?.humanReviewAdvisories && auditData.humanReviewAdvisories.length > 0 ? (
                    auditData.humanReviewAdvisories.map((adv, idx) => {
                      const isAck = !!acknowledgedAdvisories[idx];
                      const isCritical = adv.riskLevel === 'Critical';
                      const isHigh = adv.riskLevel === 'High';
                      const ragLabel = isCritical
                        ? 'RED (Critical Fix Priority)'
                        : isHigh
                        ? 'AMBER (Medium Fix Priority)'
                        : 'GREEN (Low Fix Priority)';

                      return (
                        <div
                          key={idx}
                          className={`p-3.5 rounded-lg border transition-all ${
                            isAck
                              ? 'bg-slate-950/60 border-slate-800 opacity-60'
                              : isCritical
                              ? 'bg-rose-950/30 border-rose-500/50 shadow-xs'
                              : isHigh
                              ? 'bg-amber-950/20 border-amber-500/40'
                              : 'bg-emerald-950/10 border-emerald-500/30'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                                    isCritical
                                      ? 'bg-rose-950 text-rose-200 border-rose-500/60'
                                      : isHigh
                                      ? 'bg-amber-950 text-amber-200 border-amber-500/60'
                                      : 'bg-emerald-950 text-emerald-200 border-emerald-500/60'
                                  }`}
                                >
                                  {ragLabel}
                                </span>
                                <span className="text-xs font-bold text-white">{adv.item}</span>
                                <span className="text-[10px] text-slate-400 font-mono">({adv.section})</span>
                              </div>

                              <p className="text-xs text-slate-300">{adv.advisoryNote}</p>

                              <div className="text-[11px] text-cyan-300 bg-slate-900/80 p-2 rounded border border-slate-800">
                                <strong className="text-slate-400">Remediation Action:</strong>{' '}
                                {adv.recommendedAction}
                              </div>

                              {/* Concrete Suggestion to Fix Issue */}
                              <div className="text-[11px] text-emerald-300 bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-500/30 space-y-1.5 mt-2">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                                    <Sparkles className="w-3.5 h-3.5" />
                                    Remediation Fix Suggestion:
                                  </span>
                                  <button
                                    onClick={() => handleApplyAdvisoryFix(adv, idx)}
                                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors cursor-pointer"
                                  >
                                    Apply Fix to Document
                                  </button>
                                </div>
                                <p className="text-slate-200 text-[11px] leading-relaxed font-sans">
                                  {adv.suggestedFix || adv.recommendedAction}
                                </p>
                              </div>
                            </div>

                            <button
                              onClick={() => toggleAdvisory(idx)}
                              className={`px-3 py-1.5 rounded text-xs font-semibold shrink-0 cursor-pointer transition-colors border ${
                                isAck
                                  ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                              }`}
                            >
                              {isAck ? '✓ Remediated' : 'Mark Remediated'}
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-6 text-xs text-slate-400">
                      <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                      <span>Zero blocking gaps detected across all PMBOK standards.</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2.5: RESOURCE TIMELINE (GANTT) */}
        {activeTab === 'timeline' && selectedResources && (
          <ResourceAssignmentTimeline 
            resources={selectedResources}
            startDate={verifiedTimelineData?.startDate || date}
            projectName={projectName}
          />
        )}

        {/* TAB 3: FORMATTED PREVIEW */}
        {activeTab === 'preview' && (
          <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-8 shadow-xl document-print-container">
            {/* Dynamic Print Header with Logo */}
            <div className="print-only mb-8">
              <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4 mb-6">
                <div>
                  <h1 className="text-2xl font-black text-slate-950 uppercase tracking-tighter leading-none">Advannotech (Pty) Ltd</h1>
                  <p className="text-[10px] text-slate-600 font-bold uppercase mt-1">Enterprise Project Governance · Midrand, South Africa</p>
                </div>
                {customLogo && (
                  <div className={`h-16 w-32 flex items-center justify-end ${isMonochromeLogo ? 'grayscale contrast-125 brightness-75' : ''}`}>
                    <img src={customLogo} alt="Corporate Logo" className="max-h-full max-w-full object-contain" />
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-[9px] text-slate-700 uppercase font-bold bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <p>Document: <span className="text-slate-950">{selectedDoc.title}</span></p>
                  <p>Reference: <span className="text-slate-950">{docCode}</span></p>
                </div>
                <div className="text-right">
                  <p>Project: <span className="text-slate-950">{projectName}</span></p>
                  <p>Date: <span className="text-slate-950">{date}</span></p>
                </div>
              </div>
            </div>

            <div
              className="prose-advannotech"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          </div>
        )}

        {/* TAB 4: RAW MARKDOWN EDITOR */}
        {activeTab === 'editor' && (
          <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Raw Markdown Editor</span>
              <span className="font-mono">{markdown.length.toLocaleString()} characters</span>
            </div>
            <textarea
              rows={28}
              value={markdown}
              onChange={(e) => onChangeMarkdown(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg p-4 font-mono text-xs text-slate-100 leading-relaxed focus:outline-none focus:border-cyan-400"
            />
          </div>
        )}

        {/* TAB 5: SPLIT VIEW */}
        {activeTab === 'split' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-3 flex flex-col h-[750px]">
              <div className="text-xs font-semibold text-slate-400 mb-2 px-1">Raw Markdown</div>
              <textarea
                value={markdown}
                onChange={(e) => onChangeMarkdown(e.target.value)}
                className="flex-1 w-full bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-xs text-slate-100 leading-relaxed focus:outline-none focus:border-cyan-400 resize-none"
              />
            </div>

            <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-6 h-[750px] overflow-y-auto">
              <div className="text-xs font-semibold text-slate-400 mb-3 border-b border-slate-800 pb-2">
                Live Rendered Preview
              </div>
              <div
                className="prose-advannotech"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Version Control History Drawer */}
      <VersionHistoryDrawer
        isOpen={isHistoryDrawerOpen}
        onClose={() => setIsHistoryDrawerOpen(false)}
        snapshots={snapshots}
        activeSnapshotId={activeSnapshotId}
        onRestoreSnapshot={handleRestoreSnapshot}
        onCreateSnapshot={handleCreateSnapshot}
        onDeleteSnapshot={handleDeleteSnapshot}
      />

      {/* Pop-up Download Modal (shown when stage document is done) */}
      <StageDocDownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        selectedDoc={selectedDoc}
        docCode={docCode}
        projectName={projectName}
        date={date}
        markdown={markdown}
        onDownloadPdf={handleExportPdf}
        onPrintPdf={handlePrint}
        onDownloadDocx={handleExportWord}
        onDownloadMarkdown={handleExportMarkdown}
        onDownloadAuditPdf={handleExportAuditReport}
        onDownloadCsv={handleExportCsv}
        hasAuditData={!!auditData}
        hasCsvData={isMeetingMinutes && !!auditData?.actionItems && auditData.actionItems.length > 0}
      />

      {/* Formal Multi-Page PDF Print Container (Strictly utilizes print styles defined in index.css) */}
      <div className="print-only document-print-container">
        {/* Professional Monochrome Minimalist Header */}
        <div className="document-header-print">
          <div style={{ display: 'flex', alignItems: 'center', gap: '15pt' }}>
            {/* Custom Logo or Minimalist Monochrome Hex Logo */}
            {customLogo ? (
              <div style={{ width: '45pt', height: '45pt', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className={isMonochromeLogo ? 'grayscale contrast-125 brightness-75' : ''}>
                <img src={customLogo} alt="Corporate Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              </div>
            ) : (
              <svg width="45" height="45" viewBox="0 0 100 100">
                <polygon points="50,5 90,27.5 90,72.5 50,95 10,72.5 10,27.5" fill="none" stroke="black" strokeWidth="8" />
                <circle cx="50" cy="50" r="10" fill="black" />
                <line x1="50" y1="5" x2="50" y2="50" stroke="black" strokeWidth="5" />
                <line x1="90" y1="72.5" x2="50" y2="50" stroke="black" strokeWidth="5" />
                <line x1="10" y1="72.5" x2="50" y2="50" stroke="black" strokeWidth="5" />
              </svg>
            )}
            <div>
              <div style={{ fontSize: '16pt', fontWeight: 900, letterSpacing: '-0.05em', textTransform: 'uppercase' }}>
                {customLogo ? 'Project Authority' : 'Advannotech'}
              </div>
              <div style={{ fontSize: '8pt', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#64748b' }}>
                {customLogo ? 'Corporate Governance & Engineering' : 'Engineering & Governance'}
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right', fontSize: '8pt', color: '#64748b' }}>
            <div style={{ fontWeight: 'bold', color: '#0f172a' }}>{docCode}</div>
            <div>Baseline: {date}</div>
            <div>Prepared in alignment with {selectedStandard}</div>
          </div>
        </div>

        <div style={{ marginBottom: '30pt', textAlign: 'center' }}>
          <h1 style={{ fontSize: '24pt', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', margin: '0' }}>{selectedDoc.title}</h1>
          <div style={{ fontSize: '10pt', color: '#475569', marginTop: '5pt' }}>Project: {projectName} | Phase: {selectedDoc.phase}</div>
        </div>

        {/* Live Parsed Document Content */}
        <div
          className="prose-advannotech"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />

        {/* Professional Signature Blocks */}
        <div className="signature-block">
          <div>
            <div className="signature-line">TECHNICAL ARCHITECTURE AUTHORITY</div>
            <div style={{ fontSize: '10pt', marginTop: '5pt' }}><strong>Valiant Khoza</strong></div>
            <div style={{ fontSize: '8pt', color: '#64748b' }}>Lead Software Engineer · Advannotech (Pty) Ltd</div>
          </div>
          <div>
            <div className="signature-line">PROJECT MANAGEMENT OFFICE (PMO)</div>
            <div style={{ fontSize: '10pt', marginTop: '5pt' }}><strong>Sarel van Deventer</strong></div>
            <div style={{ fontSize: '8pt', color: '#64748b' }}>Head of Delivery and Projects · Advannotech (Pty) Ltd</div>
          </div>
        </div>

        {/* Print Footer */}
        <div className="document-footer-print">
          <span>Advannotech (Pty) Ltd · {docCode} · {selectedStandard} Alignment</span>
          <span>Page Header/Footer Generated via AI Studio Build · Confidential</span>
        </div>
      </div>

      {/* Floating Quick Export/Print Button */}
      <div className="no-print fixed bottom-8 right-8 z-50 flex flex-col gap-3">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 font-black rounded-full shadow-2xl shadow-cyan-500/40 transition-all hover:scale-110 active:scale-95 group cursor-pointer"
          title="Instantly trigger formal PDF print layout"
        >
          <Printer className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          <span className="uppercase tracking-tighter">Quick Export PDF</span>
        </button>
      </div>
    </div>
  );
};
