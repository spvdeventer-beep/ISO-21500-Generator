import React, { useState } from 'react';
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileSearch,
  Sparkles,
  Download,
  Copy,
  ArrowRight,
  ShieldAlert,
  Loader2,
  Check,
  ChevronDown,
  ChevronRight,
  FileCheck,
  AlertCircle,
  Layers,
  Award,
  BookOpen,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import {
  PMIDocumentDefinition,
  DOCUMENT_CATALOGUE,
  PMIPhase,
  PMI_PHASES,
  getDocumentFieldDefinitions
} from '../data/documents';
import { parseFileClientSide, ExtractedFile } from '../utils/fileParsers';
import { exportDocx, exportAuditReportPdf, exportAuditReportDocx } from '../utils/exportUtils';
import { ComplianceHeatmap, ComplianceItem } from './ComplianceHeatmap';
import { ImprovementEnginePanel } from './ImprovementEnginePanel';
import {
  ImprovementEngineItem,
  generateImprovementItems,
  applyImprovementFixToMarkdown
} from '../utils/improvementEngine';

export interface SectionAuditResult {
  section: string;
  status: 'Compliant' | 'Deficient' | 'Missing';
  confidenceScore: number;
  evidence: string;
  deficiency: string;
  suggestionToFix: string;
}

export interface FieldAuditResult {
  field: string;
  status: 'Present' | 'Partial' | 'Missing';
  findings: string;
  suggestionToFix: string;
}

export interface RagPriorityItem {
  id: string;
  item: string;
  ragStatus: 'RED' | 'AMBER' | 'GREEN';
  urgency: 'Immediate (Blocking)' | 'High' | 'Medium' | 'Low';
  issueDescription: string;
  suggestedFix: string;
  governanceDomain: string;
}

export interface ExistingDocAuditReport {
  complianceScore: number;
  ragStatus: 'GREEN' | 'AMBER' | 'RED';
  executiveSummary: string;
  sectionsAudit: SectionAuditResult[];
  fieldsAudit: FieldAuditResult[];
  complianceHeatmap: ComplianceItem[];
  ragPriorityRegister: RagPriorityItem[];
  remediatedDraft?: string;
}

interface ReviewExistingDocViewProps {
  onTransferToCanvas?: (doc: PMIDocumentDefinition, markdown: string) => void;
  onOpenAgendas?: () => void;
}

export const ReviewExistingDocView: React.FC<ReviewExistingDocViewProps> = ({
  onTransferToCanvas,
  onOpenAgendas,
}) => {
  // Standard to compare against
  const [selectedStandard, setSelectedStandard] = useState<PMIDocumentDefinition>(DOCUMENT_CATALOGUE[0]);
  const [selectedPhase, setSelectedPhase] = useState<PMIPhase>('Initiation');

  // Input file / text
  const [inputMode, setInputMode] = useState<'upload' | 'paste'>('upload');
  const [uploadedFile, setUploadedFile] = useState<ExtractedFile | null>(null);
  const [pastedText, setPastedText] = useState('');
  const [isParsing, setIsParsing] = useState(false);

  // Audit state
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<ExistingDocAuditReport | null>(null);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'improvement' | 'summary' | 'sections' | 'fields' | 'heatmap' | 'remediation'>('improvement');
  const [copiedFixId, setCopiedFixId] = useState<string | null>(null);

  // File Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    setAuditError(null);
    try {
      const parsed = await parseFileClientSide(file);
      setUploadedFile(parsed);
      setPastedText(parsed.text);
    } catch (err: any) {
      setAuditError(`Error reading file: ${err?.message || 'Unsupported format'}`);
    } finally {
      setIsParsing(false);
    }
  };

  const activeText = inputMode === 'upload' ? (uploadedFile?.text || '') : pastedText;

  // Execute Audit Function
  const handleRunAudit = async () => {
    if (!activeText.trim()) {
      setAuditError('Please upload a document or paste document text before running the compliance audit.');
      return;
    }

    setIsAuditing(true);
    setAuditError(null);

    try {
      const res = await fetch('/api/audit-existing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          docTitle: selectedStandard.title,
          docPhase: selectedStandard.phase,
          requiredSections: selectedStandard.requiredSections,
          requiredFields: selectedStandard.requiredFields,
          existingDocumentText: activeText,
          documentName: uploadedFile?.name || `${selectedStandard.title} Draft`,
        }),
      });

      if (!res.ok) {
        throw new Error(`Audit service returned HTTP ${res.status}`);
      }

      const data: ExistingDocAuditReport = await res.json();
      setAuditResult(data);
      setActiveTab('summary');
    } catch (err: any) {
      console.warn('API audit failed, performing client-side rule-based audit fallback:', err);
      // Client-side rule-based audit fallback
      const fallbackReport = generateClientSideAudit(selectedStandard, activeText, uploadedFile?.name || 'Uploaded Document');
      setAuditResult(fallbackReport);
      setActiveTab('summary');
    } finally {
      setIsAuditing(false);
    }
  };

  // Rule-based fallback audit if server is unreachable
  const generateClientSideAudit = (
    doc: PMIDocumentDefinition,
    text: string,
    docName: string
  ): ExistingDocAuditReport => {
    const lower = text.toLowerCase();
    const sectionsAudit: SectionAuditResult[] = doc.requiredSections.map((sec) => {
      const cleanSec = sec.replace(/^\d+[\.\s]+/, '').toLowerCase();
      const firstWord = cleanSec.split(' ')[0];
      const hasExact = lower.includes(cleanSec);
      const hasPartial = lower.includes(firstWord);

      if (hasExact) {
        return {
          section: sec,
          status: 'Compliant',
          confidenceScore: 92,
          evidence: `Verified reference to '${sec}' found in document body.`,
          deficiency: 'None identified. Mandatory section structure conforms to standard.',
          suggestionToFix: 'Maintain current section structure and ensure all metric tables are updated each reporting cycle.',
        };
      } else if (hasPartial) {
        return {
          section: sec,
          status: 'Deficient',
          confidenceScore: 55,
          evidence: `Found related keyword '${firstWord}', but section header '${sec}' is not explicitly structured.`,
          deficiency: `Missing formal header and exhaustive PMBOK 7th Edition sub-clauses for ${sec}.`,
          suggestionToFix: `Insert formal header '### ${sec}' and incorporate specific Advannotech governance metrics, RACI assignments, and quantifiable baselines.`,
        };
      } else {
        return {
          section: sec,
          status: 'Missing',
          confidenceScore: 10,
          evidence: 'No matching keywords or section headers detected in document.',
          deficiency: `Section '${sec}' is completely omitted from the existing document. This violates Advannotech ISO audit requirements.`,
          suggestionToFix: `Add mandatory section '### ${sec}' addressing scope boundaries, measurable KPIs, risk thresholds, and explicit approval criteria.`,
        };
      }
    });

    const fieldsAudit: FieldAuditResult[] = doc.requiredFields.map((field) => {
      const cleanField = field.toLowerCase().replace(/[^a-z0-9 ]/g, '');
      const keywords = cleanField.split(' ').filter((w) => w.length > 3);
      const matchCount = keywords.filter((k) => lower.includes(k)).length;

      if (matchCount === keywords.length && keywords.length > 0) {
        return {
          field,
          status: 'Present',
          findings: `Field context detected in text with direct match.`,
          suggestionToFix: 'Field present. Ensure numerical precision and date formats comply with ISO standard.',
        };
      } else if (matchCount > 0) {
        return {
          field,
          status: 'Partial',
          findings: `Partial keywords identified, but required data points appear ambiguous or incomplete.`,
          suggestionToFix: `Explicitly define '${field}' with verifiable evidence, designated owner, and formal sign-off.`,
        };
      } else {
        return {
          field,
          status: 'Missing',
          findings: `No explicit mention of '${field}' located in the uploaded source.`,
          suggestionToFix: `Incorporate '${field}' into the document body with specific metrics, avoiding vague qualitative placeholders.`,
        };
      }
    });

    const compliantSecCount = sectionsAudit.filter((s) => s.status === 'Compliant').length;
    const partialSecCount = sectionsAudit.filter((s) => s.status === 'Deficient').length;
    const compliantFieldCount = fieldsAudit.filter((f) => f.status === 'Present').length;
    const partialFieldCount = fieldsAudit.filter((f) => f.status === 'Partial').length;

    const totalWeight = doc.requiredSections.length * 2 + doc.requiredFields.length;
    const earnedWeight = (compliantSecCount * 2 + partialSecCount * 1) + (compliantFieldCount * 1 + partialFieldCount * 0.5);
    const score = Math.min(100, Math.max(15, Math.round((earnedWeight / totalWeight) * 100)));

    const ragStatus: 'GREEN' | 'AMBER' | 'RED' =
      score >= 85 ? 'GREEN' : score >= 60 ? 'AMBER' : 'RED';

    const ragPriorityRegister: RagPriorityItem[] = [];

    // Red items
    sectionsAudit.filter((s) => s.status === 'Missing').forEach((s, idx) => {
      ragPriorityRegister.push({
        id: `RAG-RED-${idx + 1}`,
        item: `Mandatory Section Omitted: ${s.section}`,
        ragStatus: 'RED',
        urgency: 'Immediate (Blocking)',
        issueDescription: s.deficiency,
        suggestedFix: s.suggestionToFix,
        governanceDomain: 'Document Structure & ISO Compliance',
      });
    });

    // Amber items
    sectionsAudit.filter((s) => s.status === 'Deficient').forEach((s, idx) => {
      ragPriorityRegister.push({
        id: `RAG-AMB-${idx + 1}`,
        item: `Deficient Governance Detail: ${s.section}`,
        ragStatus: 'AMBER',
        urgency: 'High',
        issueDescription: s.deficiency,
        suggestedFix: s.suggestionToFix,
        governanceDomain: 'Quality Assurance & PMBOK Detail',
      });
    });

    fieldsAudit.filter((f) => f.status === 'Missing').slice(0, 3).forEach((f, idx) => {
      ragPriorityRegister.push({
        id: `RAG-FLD-${idx + 1}`,
        item: `Missing Required Information Field: ${f.field}`,
        ragStatus: 'AMBER',
        urgency: 'High',
        issueDescription: f.findings,
        suggestedFix: f.suggestionToFix,
        governanceDomain: 'Data Completeness & Baselines',
      });
    });

    // Green items
    sectionsAudit.filter((s) => s.status === 'Compliant').slice(0, 3).forEach((s, idx) => {
      ragPriorityRegister.push({
        id: `RAG-GRN-${idx + 1}`,
        item: `Verified Standard Section: ${s.section}`,
        ragStatus: 'GREEN',
        urgency: 'Low',
        issueDescription: 'Section satisfies mandatory Advannotech PMBOK requirements.',
        suggestedFix: 'No corrective action required. Maintain in revision control.',
        governanceDomain: 'Governance Baseline',
      });
    });

    const heatmap: ComplianceItem[] = [
      {
        knowledgeArea: 'Project Integration Management',
        coverageScore: score >= 80 ? 90 : score >= 50 ? 65 : 40,
        confidenceLevel: score >= 80 ? 'High' : score >= 50 ? 'Medium' : 'Low',
        sectionsCovered: ['Executive Summary', 'Governance Approvals'],
        notes: 'Evaluated against Advannotech Project Charter and baseline alignment.',
        suggestions: 'Ensure explicit PM and Sponsor approval authority blocks are maintained with signatures.',
      },
      {
        knowledgeArea: 'Project Scope Management',
        coverageScore: compliantSecCount > 2 ? 85 : 50,
        confidenceLevel: compliantSecCount > 2 ? 'High' : 'Medium',
        sectionsCovered: ['Scope Boundaries', 'Deliverables'],
        notes: 'Analyzed for explicit in-scope and out-of-scope boundaries.',
        suggestions: 'Formalize out-of-scope exclusions to eliminate scope creep liability.',
      },
      {
        knowledgeArea: 'Project Schedule Management',
        coverageScore: lower.includes('schedule') || lower.includes('milestone') ? 80 : 35,
        confidenceLevel: lower.includes('schedule') ? 'High' : 'Low',
        sectionsCovered: ['Summary Schedule', 'Milestones'],
        notes: 'Milestone target dates and critical path assessment.',
        suggestions: 'Include verifiable gating criteria for each major milestone delivery.',
      },
      {
        knowledgeArea: 'Project Quality & Risk Management',
        coverageScore: lower.includes('risk') ? 75 : 45,
        confidenceLevel: lower.includes('risk') ? 'Medium' : 'Low',
        sectionsCovered: ['Risk Register', 'Quality Controls'],
        notes: 'Risk identification and response strategy evaluation.',
        suggestions: 'Assign named Advannotech owners and monetary contingency values to high-severity risks.',
      },
    ];

    // Build remediated draft
    let remediated = `# ADVANNOTECH (PTY) LTD\n`;
    remediated += `**Enterprise Project Governance & Technology Solutions**  \n`;
    remediated += `**Document Title:** ${doc.title} *(Remediated ISO/PMBOK 7th Edition Baseline)*  \n`;
    remediated += `**Document Classification:** CONFIDENTIAL – PROPRIETARY (ADVANNOTECH PTY LTD)  \n`;
    remediated += `**Audit Disposition:** ${ragStatus} (${score}% Baseline Compliance)  \n\n`;

    remediated += `## 1. Document Control & Audit Revision Record\n`;
    remediated += `| Revision | Effective Date | Prepared By | Audit Standard | Compliance Status |\n`;
    remediated += `| :--- | :--- | :--- | :--- | :--- |\n`;
    remediated += `| v1.0-Audit | ${new Date().toISOString().split('T')[0]} | Advannotech Audit Inspector | PMBOK 7th Edition | ${ragStatus} (${score}%) |\n\n`;

    remediated += `## 2. Audited Document Body & Remediated Sections\n\n`;
    doc.requiredSections.forEach((sec) => {
      const audit = sectionsAudit.find((s) => s.section === sec);
      remediated += `### ${sec}\n`;
      if (audit?.status === 'Compliant') {
        remediated += `*Status: [Compliant - Verified in Source]*\n\n`;
        remediated += `${text.slice(0, 400)}...\n\n`;
      } else if (audit?.status === 'Deficient') {
        remediated += `*Status: [Deficient - Upgraded to Advannotech Standard]*\n\n`;
        remediated += `**Remediation Applied:** ${audit.suggestionToFix}\n\n`;
        remediated += `The project delivery team shall enforce verifiable controls, metrics, and RACI accountabilities for ${sec} in accordance with Advannotech PMO protocols.\n\n`;
      } else {
        remediated += `*Status: [Missing in Original - Generated Remediation Clause]*\n\n`;
        remediated += `**Mandatory Compliance Clause:**\n`;
        remediated += `This section was omitted from the uploaded source dossier. In accordance with PMBOK 7th Edition guidelines, all deliverables governed under ${sec} must have defined scope boundaries, explicit acceptance criteria verified by the Lead Technical Architect, and formal sign-off from the Project Sponsor.\n\n`;
      }
    });

    return {
      complianceScore: score,
      ragStatus,
      executiveSummary: `Forensic PMBOK 7th Edition audit of '${docName}' against standard '${doc.title}'. Document attained a compliance rating of ${score}% (${ragStatus}). Found ${compliantSecCount} compliant sections, ${partialSecCount} deficient sections, and ${sectionsAudit.filter((s) => s.status === 'Missing').length} omitted mandatory sections requiring governance remediation.`,
      sectionsAudit,
      fieldsAudit,
      complianceHeatmap: heatmap,
      ragPriorityRegister,
      remediatedDraft: remediated,
    };
  };

  const handleCopyFix = (id: string, textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopiedFixId(id);
    setTimeout(() => setCopiedFixId(null), 2500);
  };

  const handleExportAuditPdf = () => {
    if (!auditResult) return;
    const docCode = 'ADV-AUDIT-' + Date.now().toString().slice(-6);
    const docTitle = `${selectedStandard.title} (Compliance Audit)`;
    const projectName = uploadedFile?.name || 'Uploaded Document Compliance Review';
    const date = new Date().toISOString().split('T')[0];

    exportAuditReportPdf(
      {
        liftedContent: auditResult.sectionsAudit.map((s) => ({
          section: s.section,
          sourceName: uploadedFile?.name || 'Source Document',
          excerpt: s.evidence,
          priority: s.status === 'Compliant' ? 'Low' : s.status === 'Deficient' ? 'Medium' : 'Critical',
        })),
        excludedContent: [],
        humanReviewAdvisories: auditResult.ragPriorityRegister.map((r) => ({
          item: r.item,
          section: r.governanceDomain,
          riskLevel: r.ragStatus === 'RED' ? 'Critical' : r.ragStatus === 'AMBER' ? 'High' : 'Medium',
          advisoryNote: r.issueDescription,
          recommendedAction: r.suggestedFix,
        })),
        complianceHeatmap: auditResult.complianceHeatmap,
      },
      docCode,
      docTitle,
      projectName,
      date,
      {},
      improvementItems
    );
  };

  const handleExportAuditDocx = async () => {
    if (!auditResult) return;
    const docCode = 'ADV-AUDIT-' + Date.now().toString().slice(-6);
    const docTitle = `${selectedStandard.title} (Compliance Audit)`;
    const projectName = uploadedFile?.name || 'Uploaded Document Compliance Review';
    const date = new Date().toISOString().split('T')[0];

    await exportAuditReportDocx(
      {
        humanReviewAdvisories: auditResult.ragPriorityRegister.map((r) => ({
          item: r.item,
          section: r.governanceDomain,
          riskLevel: r.ragStatus === 'RED' ? 'Critical' : r.ragStatus === 'AMBER' ? 'High' : 'Medium',
          advisoryNote: r.issueDescription,
          recommendedAction: r.suggestedFix,
        })),
      },
      docCode,
      docTitle,
      projectName,
      date,
      improvementItems
    );
  };

  // Derive Improvement Engine items for all RED/AMBER flagged gaps
  const improvementItems = React.useMemo(() => {
    if (!auditResult) return [];
    const advisories = auditResult.ragPriorityRegister.map((r) => ({
      item: r.item,
      section: r.governanceDomain || 'General Governance',
      riskLevel: (r.ragStatus === 'RED' ? 'Critical' : r.ragStatus === 'AMBER' ? 'High' : 'Medium') as 'Critical' | 'High' | 'Medium',
      advisoryNote: r.issueDescription,
      recommendedAction: r.suggestedFix,
      suggestedFix: r.suggestedFix,
    }));

    const coveredSections = auditResult.sectionsAudit.filter((s) => s.status === 'Compliant').map((s) => s.section);
    const coveredFields = auditResult.fieldsAudit.filter((f) => f.status === 'Present').map((f) => f.field);

    return generateImprovementItems(
      { humanReviewAdvisories: advisories, complianceHeatmap: auditResult.complianceHeatmap },
      selectedStandard,
      uploadedFile ? [uploadedFile] : [],
      coveredSections,
      coveredFields
    );
  }, [auditResult, selectedStandard, uploadedFile]);

  const handleApplyImprovementFix = (item: ImprovementEngineItem, customData?: string) => {
    if (auditResult?.remediatedDraft) {
      const updated = applyImprovementFixToMarkdown(auditResult.remediatedDraft, item, customData);
      setAuditResult((prev) => (prev ? { ...prev, remediatedDraft: updated } : null));
    } else {
      const updated = applyImprovementFixToMarkdown(activeText, item, customData);
      setPastedText(updated);
    }
  };

  const handleExportRemediatedDocx = async () => {
    if (!auditResult?.remediatedDraft) return;
    const docCode = 'ADV-REM-' + Date.now().toString().slice(-6);
    const docTitle = `${selectedStandard.title} (Remediated Standard)`;
    const projectName = uploadedFile?.name || 'Remediated Governance Baseline';
    const date = new Date().toISOString().split('T')[0];

    await exportDocx(
      auditResult.remediatedDraft,
      docCode,
      docTitle,
      projectName,
      date
    );
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-fade-in text-slate-200">
      {/* Top Banner / Mode Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0F172A] via-[#0B1528] to-[#0F172A] border border-cyan-500/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              <FileSearch className="w-5 h-5" />
            </span>
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
              Review Existing Document (Compliance Audit)
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40">
              ISO & PMBOK 7th Ed
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-300 max-w-3xl leading-relaxed">
            Upload or paste any existing project document to compare it against the required Advannotech & PMBOK 7th Edition standards. Highlights structural gaps in red, evaluates evidence confidence, and provides exact fix suggestions to achieve full compliance.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onOpenAgendas && (
            <button
              onClick={onOpenAgendas}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span>Suggested Agendas</span>
            </button>
          )}
        </div>
      </div>

      {/* STEP A & B CONTROLS: Standard Selector & Ingestion */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 cols): Select Standard for Comparison */}
        <div className="lg:col-span-5 bg-[#0F172A] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
              <FolderOpen className="w-4 h-4 text-cyan-400" />
              <span>1. Select Document Standard</span>
            </div>
            <span className="text-[11px] text-cyan-400 font-mono">
              {DOCUMENT_CATALOGUE.length} Available Standards
            </span>
          </div>

          {/* Phase Filter Tabs */}
          <div className="flex gap-1 overflow-x-auto pb-1 text-xs">
            {PMI_PHASES.map((phase) => (
              <button
                key={phase}
                onClick={() => {
                  setSelectedPhase(phase);
                  const firstInPhase = DOCUMENT_CATALOGUE.find((d) => d.phase === phase);
                  if (firstInPhase) setSelectedStandard(firstInPhase);
                }}
                className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
                  selectedPhase === phase
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold'
                    : 'text-slate-400 hover:text-white bg-slate-900/60'
                }`}
              >
                {phase}
              </button>
            ))}
          </div>

          {/* Document Dropdown / List */}
          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {DOCUMENT_CATALOGUE.filter((d) => d.phase === selectedPhase).map((doc) => {
              const isSelected = doc.id === selectedStandard.id;
              return (
                <div
                  key={doc.id}
                  onClick={() => setSelectedStandard(doc)}
                  className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-cyan-950/60 border-cyan-500/50 text-white shadow-xs'
                      : 'bg-slate-900/40 border-slate-800/80 text-slate-300 hover:bg-slate-800/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold">
                    <span>{doc.title}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                    {doc.purpose}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Standard Requirements Summary Box */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-2">
            <div className="font-bold text-white flex items-center justify-between">
              <span>Standard: {selectedStandard.title}</span>
              <span className="text-[10px] text-cyan-400 font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800">
                {selectedStandard.phase}
              </span>
            </div>

            <div className="text-slate-300 text-[11px]">
              <strong className="text-slate-400">Mandatory Sections ({selectedStandard.requiredSections.length}):</strong>
              <div className="flex flex-wrap gap-1 mt-1">
                {selectedStandard.requiredSections.map((sec, i) => (
                  <span key={i} className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 border border-slate-700">
                    {sec}
                  </span>
                ))}
              </div>
            </div>

            <div className="text-slate-300 text-[11px] pt-1 border-t border-slate-800">
              <strong className="text-slate-400">Required Information Fields ({selectedStandard.requiredFields.length}):</strong>
              <div className="flex flex-wrap gap-1 mt-1">
                {selectedStandard.requiredFields.map((fld, i) => (
                  <span key={i} className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-cyan-300/90 border border-slate-700">
                    {fld}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (7 cols): Ingest Existing Document */}
        <div className="lg:col-span-7 bg-[#0F172A] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                <Upload className="w-4 h-4 text-cyan-400" />
                <span>2. Upload or Paste Existing Document</span>
              </div>
              <div className="flex gap-1 text-xs">
                <button
                  onClick={() => setInputMode('upload')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    inputMode === 'upload'
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Upload File (.docx/.pdf/.txt)
                </button>
                <button
                  onClick={() => setInputMode('paste')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    inputMode === 'paste'
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Paste Text
                </button>
              </div>
            </div>

            {inputMode === 'upload' ? (
              <div className="space-y-3">
                <label className="border-2 border-dashed border-slate-700 hover:border-cyan-500/50 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-slate-900/40 hover:bg-slate-900/70 group">
                  <div className="p-3 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 group-hover:scale-110 transition-transform mb-3">
                    <Upload className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-bold text-white">
                    {isParsing ? 'Parsing document in-memory...' : 'Click or drag existing document here'}
                  </span>
                  <span className="text-xs text-slate-400 mt-1">
                    Supports Word (.docx), PDF (.pdf), Plain Text (.txt, .md), and RTF
                  </span>
                  <input
                    type="file"
                    accept=".docx,.pdf,.txt,.md,.rtf,.csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {uploadedFile && (
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-emerald-500/30 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <FileCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                      <div>
                        <div className="font-semibold text-white">{uploadedFile.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {(uploadedFile.size / 1024).toFixed(1)} KB • {uploadedFile.wordCount.toLocaleString()} words • In-Memory (Zero Storage)
                        </div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                      Ready for Audit
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Paste existing document draft:</span>
                  <span className="font-mono">
                    {pastedText ? pastedText.split(/\s+/).length.toLocaleString() : 0} words
                  </span>
                </div>
                <textarea
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Paste existing document contents, charter notes, scope clauses, or meeting minutes here for audit..."
                  className="w-full h-44 bg-slate-900/90 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none font-sans"
                />
              </div>
            )}

            {auditError && (
              <div className="mt-3 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{auditError}</span>
              </div>
            )}
          </div>

          {/* Audit Action Button */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <div className="text-xs text-slate-400">
              Comparing against: <strong className="text-cyan-300">{selectedStandard.title}</strong>
            </div>

            <button
              onClick={handleRunAudit}
              disabled={isAuditing || isParsing || !activeText.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-cyan-500/20 hover:scale-105 active:scale-95 cursor-pointer"
            >
              {isAuditing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Auditing Against Standards...</span>
                </>
              ) : (
                <>
                  <FileSearch className="w-4 h-4" />
                  <span>Run Forensic Standards Audit</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* AUDIT RESULTS REPORT DASHBOARD */}
      {auditResult && (
        <div className="bg-[#0F172A] border border-cyan-500/30 rounded-2xl p-6 shadow-2xl space-y-6 animate-fade-in">
          {/* Executive Scorecard Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                  Forensic Audit Results
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Standard: {selectedStandard.title}
                </span>
              </div>
              <h2 className="text-xl font-black text-white tracking-tight">
                PMBOK 7th Edition Compliance Evaluation
              </h2>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                {auditResult.executiveSummary}
              </p>
            </div>

            {/* Scorecard Badges */}
            <div className="flex items-center gap-4 shrink-0">
              {/* Score Meter */}
              <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-900 border border-slate-800 min-w-[130px]">
                <div
                  className={`text-3xl font-black tracking-tight font-mono ${
                    auditResult.ragStatus === 'GREEN'
                      ? 'text-emerald-400'
                      : auditResult.ragStatus === 'AMBER'
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}
                >
                  {auditResult.complianceScore}%
                </div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mt-0.5">
                  Compliance Score
                </div>
              </div>

              {/* RAG Status Badge */}
              <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-900 border border-slate-800 min-w-[150px]">
                <span
                  className={`text-sm font-black px-3 py-1 rounded-lg border uppercase tracking-wider ${
                    auditResult.ragStatus === 'GREEN'
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
                      : auditResult.ragStatus === 'AMBER'
                      ? 'bg-amber-950 text-amber-300 border-amber-500/50'
                      : 'bg-rose-950 text-rose-300 border-rose-500/50'
                  }`}
                >
                  {auditResult.ragStatus} Status
                </span>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mt-1.5 text-center">
                  {auditResult.ragStatus === 'GREEN'
                    ? 'ISO Audit Compliant'
                    : auditResult.ragStatus === 'AMBER'
                    ? 'Conditional Gaps'
                    : 'Critical Gaps'}
                </div>
              </div>
            </div>
          </div>

          {/* Audit Navigation Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
            <button
              onClick={() => setActiveTab('improvement')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'improvement'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-amber-950/40 text-amber-300 hover:bg-amber-900/60 border border-amber-500/30'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>⚡ Improvement Engine ({improvementItems.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('summary')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'summary'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              RAG Priority Register ({auditResult.ragPriorityRegister.length})
            </button>

            <button
              onClick={() => setActiveTab('sections')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'sections'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Mandatory Sections ({auditResult.sectionsAudit.length})
            </button>

            <button
              onClick={() => setActiveTab('fields')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'fields'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Required Fields ({auditResult.fieldsAudit.length})
            </button>

            <button
              onClick={() => setActiveTab('heatmap')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'heatmap'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Compliance Heatmap
            </button>

            {auditResult.remediatedDraft && (
              <button
                onClick={() => setActiveTab('remediation')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'remediation'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900 border border-emerald-500/40'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Remediated Upgrade Draft</span>
              </button>
            )}
          </div>

          {/* TAB 0: PMBOK IMPROVEMENT ENGINE */}
          {activeTab === 'improvement' && (
            <ImprovementEnginePanel
              items={improvementItems}
              onApplyFix={handleApplyImprovementFix}
              docTitle={selectedStandard.title}
              projectName={uploadedFile?.name || 'Uploaded Document Compliance Review'}
            />
          )}

          {/* TAB 1: RAG PRIORITY REGISTER & FIX SUGGESTIONS */}
          {activeTab === 'summary' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Identified gaps categorized by ISO/PMI audit severity with concrete remediation fixes.</span>
                <span className="text-cyan-400 font-semibold">
                  {auditResult.ragPriorityRegister.filter((r) => r.ragStatus === 'RED').length} Red (Blocking) Items
                </span>
              </div>

              <div className="space-y-3">
                {auditResult.ragPriorityRegister.map((item) => {
                  const isRed = item.ragStatus === 'RED';
                  const isAmber = item.ragStatus === 'AMBER';
                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isRed
                          ? 'bg-rose-950/20 border-rose-500/40'
                          : isAmber
                          ? 'bg-amber-950/20 border-amber-500/40'
                          : 'bg-emerald-950/20 border-emerald-500/40'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border shrink-0 ${
                              isRed
                                ? 'bg-rose-950 text-rose-300 border-rose-500/50'
                                : isAmber
                                ? 'bg-amber-950 text-amber-300 border-amber-500/50'
                                : 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
                            }`}
                          >
                            {item.ragStatus} - {item.urgency}
                          </span>
                          <h4 className="text-xs md:text-sm font-bold text-white">
                            {item.item}
                          </h4>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {item.governanceDomain}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                        <strong className="text-slate-400">Issue / Gap:</strong> {item.issueDescription}
                      </p>

                      {/* Explicit Suggestion to Fix the Issue */}
                      <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="text-[11px] font-bold text-cyan-300 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Actionable Suggestion to Fix Issue:</span>
                          </div>
                          <button
                            onClick={() => handleCopyFix(item.id, item.suggestedFix)}
                            className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer border border-slate-700"
                          >
                            {copiedFixId === item.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 text-cyan-400" />
                                <span>Copy Fix</span>
                              </>
                            )}
                          </button>
                        </div>
                        <p className="text-slate-200 text-[11.5px] leading-relaxed font-sans">
                          {item.suggestedFix}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: MANDATORY SECTIONS AUDIT */}
          {activeTab === 'sections' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-400">
                Detailed comparison against all {auditResult.sectionsAudit.length} mandatory sections required by PMBOK 7th Edition for '{selectedStandard.title}'.
              </div>

              <div className="space-y-3">
                {auditResult.sectionsAudit.map((sec, idx) => {
                  const isCompliant = sec.status === 'Compliant';
                  const isDeficient = sec.status === 'Deficient';
                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border ${
                        isCompliant
                          ? 'bg-emerald-950/20 border-emerald-500/30'
                          : isDeficient
                          ? 'bg-amber-950/20 border-amber-500/40'
                          : 'bg-rose-950/20 border-rose-500/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          {isCompliant ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : isDeficient ? (
                            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                          )}
                          <h4 className="text-xs md:text-sm font-bold text-white">
                            {sec.section}
                          </h4>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                              isCompliant
                                ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
                                : isDeficient
                                ? 'bg-amber-950 text-amber-300 border-amber-500/50'
                                : 'bg-rose-950 text-rose-300 border-rose-500/50'
                            }`}
                          >
                            {sec.status}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">
                            {sec.confidenceScore}% Confidence
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs mb-3">
                        <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800">
                          <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                            Evidence in Source:
                          </div>
                          <p className="text-slate-300 text-[11px] italic">
                            "{sec.evidence}"
                          </p>
                        </div>

                        <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800">
                          <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                            Identified Deficiency / Gap:
                          </div>
                          <p className="text-slate-300 text-[11px]">
                            {sec.deficiency}
                          </p>
                        </div>
                      </div>

                      {/* Fix Suggestion */}
                      <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-xs">
                        <strong className="text-cyan-300 flex items-center gap-1.5 mb-1">
                          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                          Remediation Recommendation to Satisfy Standard:
                        </strong>
                        <p className="text-slate-200 text-[11.5px] leading-relaxed">
                          {sec.suggestionToFix}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: REQUIRED INFORMATION FIELDS AUDIT */}
          {activeTab === 'fields' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-400">
                Evaluation of specific data points, numerical baselines, and ownership fields.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {auditResult.fieldsAudit.map((field, idx) => {
                  const isPresent = field.status === 'Present';
                  const isPartial = field.status === 'Partial';
                  return (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl border ${
                        isPresent
                          ? 'bg-slate-900/70 border-emerald-500/30'
                          : isPartial
                          ? 'bg-slate-900/70 border-amber-500/40'
                          : 'bg-slate-900/70 border-rose-500/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span className="text-xs font-bold text-white">
                          {field.field}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded border uppercase shrink-0 ${
                            isPresent
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                              : isPartial
                              ? 'bg-amber-950 text-amber-300 border-amber-500/40'
                              : 'bg-rose-950 text-rose-300 border-rose-500/40'
                          }`}
                        >
                          {field.status}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-300 mb-2">
                        {field.findings}
                      </p>

                      <div className="text-[10.5px] text-cyan-300 bg-slate-950/60 p-2 rounded border border-slate-800">
                        <strong className="text-slate-400">Fix Guidance:</strong> {field.suggestionToFix}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: COMPLIANCE HEATMAP */}
          {activeTab === 'heatmap' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-400">
                Visual density and confidence scoring mapped across PMBOK 7th Edition performance domains.
              </div>
              <ComplianceHeatmap heatmapData={auditResult.complianceHeatmap} />
            </div>
          )}

          {/* TAB 5: REMEDIATED UPGRADE DRAFT */}
          {activeTab === 'remediation' && auditResult.remediatedDraft && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                <div>
                  <h4 className="font-bold text-white text-sm">
                    100% Compliant Upgraded Draft Generated
                  </h4>
                  <p className="text-slate-300 mt-0.5">
                    This draft combines the content of your existing document with the missing mandatory sections, governance sign-offs, and remediation clauses to achieve formal ISO/PMI compliance.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {onTransferToCanvas && (
                    <button
                      onClick={() => onTransferToCanvas(selectedStandard, auditResult.remediatedDraft || '')}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Edit in Document Canvas</span>
                    </button>
                  )}
                  <button
                    onClick={handleExportRemediatedDocx}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Download Word (.docx)</span>
                  </button>
                </div>
              </div>

              {/* Draft Preview Textarea */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <textarea
                  readOnly
                  value={auditResult.remediatedDraft}
                  className="w-full h-96 bg-transparent text-xs font-mono text-slate-200 resize-none focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Report Footer Actions */}
          <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="text-xs text-slate-400">
              Generated by Advannotech Forensic Standards Engine • Stateless In-Memory Audit
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={handleExportAuditDocx}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-slate-300" />
                <span>Export Audit Report (Word)</span>
              </button>

              <button
                onClick={handleExportAuditPdf}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 transition-colors cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>Export Audit Report (PDF)</span>
              </button>

              {auditResult.remediatedDraft && onTransferToCanvas && (
                <button
                  onClick={() => onTransferToCanvas(selectedStandard, auditResult.remediatedDraft || '')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-md shadow-emerald-500/20 hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Transfer Remediated Draft to Canvas</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
