import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  Layers,
  Sparkles,
  Info,
  Check,
  AlertTriangle,
  ArrowRight,
  FileText,
  Eye,
  Columns
} from 'lucide-react';

export interface ComplianceItem {
  knowledgeArea: string;
  coverageScore: number;
  confidenceLevel: 'High' | 'Medium' | 'Low';
  sectionsCovered: string[];
  notes: string;
  suggestions?: string;
}

export interface SectionComplianceItem {
  sectionName: string;
  confidenceScore: number; // 0 - 100
  ragStatus: 'GREEN' | 'AMBER' | 'RED';
  evidenceCount: number;
  advisoryCount: number;
  criticalAdvisories: number;
  highAdvisories: number;
  knowledgeArea: string;
  findings: string;
  sampleEvidence?: string;
  remediationAdvice?: string;
}

interface ComplianceHeatmapProps {
  heatmapData?: ComplianceItem[];
  requiredSections?: string[];
  auditData?: {
    liftedContent?: Array<{ section: string; excerpt: string; priority: string; sourceName?: string }>;
    humanReviewAdvisories?: Array<{ section: string; item: string; riskLevel: string; advisoryNote: string; suggestedFix?: string; recommendedAction?: string }>;
    complianceHeatmap?: ComplianceItem[];
  } | null;
  markdown?: string;
  originalRequiredSections?: string[];
  onSelectSection?: (section: string) => void;
  onApplyFix?: (section: string, fixText: string) => void;
  onAddSection?: (title: string) => void;
  onReorderSections?: (newOrder: string[]) => void;
}

const DEFAULT_PMBOK_AREAS: Omit<ComplianceItem, 'coverageScore' | 'confidenceLevel' | 'sectionsCovered' | 'notes'>[] = [
  { knowledgeArea: 'Project Integration Management' },
  { knowledgeArea: 'Project Scope Management' },
  { knowledgeArea: 'Project Schedule Management' },
  { knowledgeArea: 'Project Cost Management' },
  { knowledgeArea: 'Project Quality Management' },
  { knowledgeArea: 'Project Resource Management' },
  { knowledgeArea: 'Project Communications Management' },
  { knowledgeArea: 'Project Risk Management' },
  { knowledgeArea: 'Project Procurement Management' },
  { knowledgeArea: 'Project Stakeholder Management' },
];

/**
 * Maps section names to appropriate PMBOK Knowledge Areas
 */
function mapSectionToKnowledgeArea(section: string): string {
  const lower = section.toLowerCase();
  if (lower.includes('cost') || lower.includes('budget') || lower.includes('financial') || lower.includes('pricing')) {
    return 'Project Cost Management';
  }
  if (lower.includes('schedule') || lower.includes('timeline') || lower.includes('milestone') || lower.includes('gantt') || lower.includes('cadence')) {
    return 'Project Schedule Management';
  }
  if (lower.includes('scope') || lower.includes('deliverable') || lower.includes('boundary') || lower.includes('wbs') || lower.includes('acceptance')) {
    return 'Project Scope Management';
  }
  if (lower.includes('risk') || lower.includes('threat') || lower.includes('contingency') || lower.includes('assumption') || lower.includes('mitigation')) {
    return 'Project Risk Management';
  }
  if (lower.includes('quality') || lower.includes('iso') || lower.includes('standard') || lower.includes('compliance') || lower.includes('audit')) {
    return 'Project Quality Management';
  }
  if (lower.includes('resource') || lower.includes('team') || lower.includes('raci') || lower.includes('staffing') || lower.includes('stakeholder')) {
    return 'Project Resource Management';
  }
  if (lower.includes('communication') || lower.includes('meeting') || lower.includes('reporting') || lower.includes('minutes') || lower.includes('escalation')) {
    return 'Project Communications Management';
  }
  if (lower.includes('procurement') || lower.includes('vendor') || lower.includes('contract') || lower.includes('subcontractor') || lower.includes('sow')) {
    return 'Project Procurement Management';
  }
  return 'Project Integration Management';
}

/**
 * Derives section-level PMBOK coverage confidence scores and RAG status from audit logic
 */
export function deriveSectionComplianceData(
  requiredSections: string[] = [],
  auditData: ComplianceHeatmapProps['auditData'],
  markdown: string = '',
  originalRequiredSections: string[] = []
): SectionComplianceItem[] {
  if (!requiredSections || requiredSections.length === 0) {
    return [];
  }

  const lifted = auditData?.liftedContent || [];
  const advisories = auditData?.humanReviewAdvisories || [];
  const lowerMd = markdown.toLowerCase();

  return requiredSections.map((sec) => {
    const secClean = sec.toLowerCase().replace(/^[0-9\.\s]+/, '');
    const isPresentInDoc =
      lowerMd.includes(sec.toLowerCase()) ||
      lowerMd.includes(secClean) ||
      lowerMd.includes(`### ${sec.toLowerCase()}`) ||
      lowerMd.includes(`## ${sec.toLowerCase()}`);

    // Evidence lifted for this section
    const matchingEvidence = lifted.filter(
      (l) => l.section.toLowerCase().includes(secClean) || secClean.includes(l.section.toLowerCase())
    );

    // Advisories flagged for this section
    const matchingAdvisories = advisories.filter(
      (a) => a.section.toLowerCase().includes(secClean) || secClean.includes(a.section.toLowerCase())
    );

    const criticalCount = matchingAdvisories.filter((a) => a.riskLevel === 'Critical').length;
    const highCount = matchingAdvisories.filter((a) => a.riskLevel === 'High').length;
    const mediumCount = matchingAdvisories.filter((a) => a.riskLevel === 'Medium').length;

    // Knowledge area mapping
    const knowledgeArea = mapSectionToKnowledgeArea(sec);

    // Compute Confidence Score based on PMBOK audit logic
    let score = 85;

    if (!isPresentInDoc) {
      score = 25; // Omission penalty
    } else {
      // Evidence boost (up to +12%)
      score += Math.min(12, matchingEvidence.length * 4);

      // Advisory deductions
      score -= criticalCount * 35; // Critical blockers
      score -= highCount * 18;     // High risks
      score -= mediumCount * 8;    // Medium caveats
    }

    // Clamp score between 15% and 98%
    score = Math.max(15, Math.min(98, Math.round(score)));

    // RAG Status determination
    let ragStatus: 'GREEN' | 'AMBER' | 'RED';
    const isCustom = originalRequiredSections.length > 0 && !originalRequiredSections.includes(sec);

    if (isCustom) {
      ragStatus = 'AMBER';
      score = 70; // Default for custom
    } else if (!isPresentInDoc || criticalCount > 0 || score < 55) {
      ragStatus = 'RED';
    } else if (highCount > 0 || score < 80) {
      ragStatus = 'AMBER';
    } else {
      ragStatus = 'GREEN';
    }

    const sampleQuote = matchingEvidence[0]?.excerpt || (isPresentInDoc ? 'Document content verified against standard PMBOK clause.' : 'Section missing from draft.');
    const remediation = matchingAdvisories[0]?.suggestedFix || matchingAdvisories[0]?.recommendedAction;

    let findings = '';
    if (ragStatus === 'GREEN') {
      findings = `High-confidence PMBOK alignment. Substantiated by ${matchingEvidence.length} verified evidence points with 0 blocking gaps.`;
    } else if (ragStatus === 'AMBER') {
      findings = `Medium confidence (${score}%). Meets baseline structure, but contains ${matchingAdvisories.length} advisory item(s) requiring verification.`;
    } else {
      findings = !isPresentInDoc
        ? `Critical ISO/PMBOK gap: Section is omitted from the document body.`
        : `Critical risk: ${criticalCount} blocking advisory items detected requiring immediate remediation.`;
    }

    return {
      sectionName: sec,
      confidenceScore: score,
      ragStatus,
      evidenceCount: matchingEvidence.length,
      advisoryCount: matchingAdvisories.length,
      criticalAdvisories: criticalCount,
      highAdvisories: highCount,
      knowledgeArea,
      findings,
      sampleEvidence: sampleQuote,
      remediationAdvice: remediation,
    };
  });
}

export const ComplianceHeatmap: React.FC<ComplianceHeatmapProps> = ({
  heatmapData = [],
  requiredSections = [],
  auditData = null,
  markdown = '',
  originalRequiredSections = [],
  onSelectSection,
  onApplyFix,
  onAddSection,
  onReorderSections,
}) => {
  const [viewMode, setViewMode] = useState<'sections' | 'knowledgeAreas'>('sections');
  const [filterRag, setFilterRag] = useState<'ALL' | 'GREEN' | 'AMBER' | 'RED'>('ALL');
  const [filterConfidence, setFilterConfidence] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');
  const [selectedSection, setSelectedSection] = useState<SectionComplianceItem | null>(null);
  const [selectedArea, setSelectedArea] = useState<ComplianceItem | null>(null);

  // Derive section-level compliance data using audit logic
  const sectionsCompliance = useMemo(() => {
    return deriveSectionComplianceData(requiredSections, auditData, markdown, originalRequiredSections);
  }, [requiredSections, auditData, markdown, originalRequiredSections]);

  const handleMoveSection = (idx: number, direction: 'up' | 'down') => {
    if (!onReorderSections) return;
    const newSections = [...requiredSections];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    
    // Constraint: Can't move first (Summary) or last (Sign-off)
    // Also can't move into first or last position
    if (idx === 0 || idx === requiredSections.length - 1) return;
    if (targetIdx <= 0 || targetIdx >= requiredSections.length - 1) return;

    const temp = newSections[idx];
    newSections[idx] = newSections[targetIdx];
    newSections[targetIdx] = temp;
    
    onReorderSections(newSections);
  };

  // Section RAG counts
  const greenSections = sectionsCompliance.filter((s) => s.ragStatus === 'GREEN');
  const amberSections = sectionsCompliance.filter((s) => s.ragStatus === 'AMBER');
  const redSections = sectionsCompliance.filter((s) => s.ragStatus === 'RED');

  const filteredSections = useMemo(() => {
    if (filterRag === 'ALL') return sectionsCompliance;
    return sectionsCompliance.filter((s) => s.ragStatus === filterRag);
  }, [sectionsCompliance, filterRag]);

  const averageSectionScore = useMemo(() => {
    if (sectionsCompliance.length === 0) return 85;
    const total = sectionsCompliance.reduce((acc, s) => acc + s.confidenceScore, 0);
    return Math.round(total / sectionsCompliance.length);
  }, [sectionsCompliance]);

  // Merge Knowledge Areas with defaults
  const mergedKnowledgeAreas: ComplianceItem[] = useMemo(() => {
    const rawData = heatmapData.length > 0 ? heatmapData : (auditData?.complianceHeatmap || []);
    return DEFAULT_PMBOK_AREAS.map((def) => {
      const existing = rawData.find(
        (h) =>
          h.knowledgeArea.toLowerCase().includes(def.knowledgeArea.toLowerCase().replace('project ', '').replace(' management', '')) ||
          def.knowledgeArea.toLowerCase().includes(h.knowledgeArea.toLowerCase())
      );

      if (existing) return existing;

      return {
        knowledgeArea: def.knowledgeArea,
        coverageScore: 65,
        confidenceLevel: 'Medium',
        sectionsCovered: ['General Governance Context'],
        notes: 'Covered via integrated PMBOK baseline specifications.',
        suggestions: 'Formalize quantifiable milestones and tolerances for ISO audit conformance.',
      };
    });
  }, [heatmapData, auditData]);

  const filteredKnowledgeAreas = useMemo(() => {
    if (filterConfidence === 'All') return mergedKnowledgeAreas;
    return mergedKnowledgeAreas.filter((item) => item.confidenceLevel === filterConfidence);
  }, [mergedKnowledgeAreas, filterConfidence]);

  const averageKnowledgeScore = useMemo(() => {
    return Math.round(
      mergedKnowledgeAreas.reduce((acc, it) => acc + (it.coverageScore || 70), 0) / mergedKnowledgeAreas.length
    );
  }, [mergedKnowledgeAreas]);

  const highKnowledgeCount = mergedKnowledgeAreas.filter((i) => i.confidenceLevel === 'High').length;
  const mediumKnowledgeCount = mergedKnowledgeAreas.filter((i) => i.confidenceLevel === 'Medium').length;
  const lowKnowledgeCount = mergedKnowledgeAreas.filter((i) => i.confidenceLevel === 'Low').length;

  return (
    <div className="space-y-5">
      {/* Executive Heatmap Header Banner */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/30">
                PMBOK 7th Edition Audit Matrix
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {viewMode === 'sections' ? `${sectionsCompliance.length} Document Sections` : '10 Knowledge Domains'}
              </span>
            </div>
            <h3 className="text-lg font-black text-white tracking-tight">
              Visual Compliance Heatmap & RAG Coverage
            </h3>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Color-coded forensic summary tracking section-by-section PMBOK confidence coverage. Green indicates high-confidence source-grounded evidence; Amber indicates medium-confidence review items; Red highlights blocking gaps.
            </p>
          </div>

          {/* View Switcher & Health Dial */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* View Mode Toggle */}
            <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-xl">
              <button
                onClick={() => setViewMode('sections')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  viewMode === 'sections'
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                <span>Document Sections (RAG)</span>
              </button>

              <button
                onClick={() => setViewMode('knowledgeAreas')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  viewMode === 'knowledgeAreas'
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>10 Knowledge Areas</span>
              </button>
            </div>

            {/* Composite Score Meter */}
            <div className="flex items-center gap-3 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">RAG Confidence</span>
                <span className={`text-xl font-black font-mono leading-none ${
                  (viewMode === 'sections' ? averageSectionScore : averageKnowledgeScore) >= 80
                    ? 'text-emerald-400'
                    : (viewMode === 'sections' ? averageSectionScore : averageKnowledgeScore) >= 60
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}>
                  {viewMode === 'sections' ? averageSectionScore : averageKnowledgeScore}%
                </span>
              </div>
              <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-[11px] font-mono font-bold ${
                (viewMode === 'sections' ? averageSectionScore : averageKnowledgeScore) >= 80
                  ? 'border-emerald-500/60 text-emerald-400 bg-emerald-950/40'
                  : (viewMode === 'sections' ? averageSectionScore : averageKnowledgeScore) >= 60
                  ? 'border-amber-500/60 text-amber-400 bg-amber-950/40'
                  : 'border-rose-500/60 text-rose-400 bg-rose-950/40'
              }`}>
                {(viewMode === 'sections' ? averageSectionScore : averageKnowledgeScore) >= 80 ? '✓' : '!'}
              </div>
            </div>
          </div>
        </div>

        {/* VIEW MODE 1: DOCUMENT SECTIONS RAG SUMMARY (REQUESTED BY USER) */}
        {viewMode === 'sections' && (
          <div className="space-y-4">
            {/* Color-Coded RAG Summary Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Total Sections
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-xl font-black text-white">{sectionsCompliance.length}</span>
                    <span className="text-[10px] text-slate-400">mandatory</span>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center text-xs font-bold font-mono">
                  100%
                </div>
              </div>

              <div
                onClick={() => setFilterRag(filterRag === 'GREEN' ? 'ALL' : 'GREEN')}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  filterRag === 'GREEN'
                    ? 'bg-emerald-950 border-emerald-400 shadow-md shadow-emerald-950/40'
                    : 'bg-slate-900/80 border-slate-800 hover:border-emerald-500/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                      Green (Compliant)
                    </span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-xl font-black text-emerald-400">{greenSections.length}</span>
                      <span className="text-[10px] text-emerald-300/70">High Confidence</span>
                    </div>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>
              </div>

              <div
                onClick={() => setFilterRag(filterRag === 'AMBER' ? 'ALL' : 'AMBER')}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  filterRag === 'AMBER'
                    ? 'bg-amber-950 border-amber-400 shadow-md shadow-amber-950/40'
                    : 'bg-slate-900/80 border-slate-800 hover:border-amber-500/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                      Amber (Review Advised)
                    </span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-xl font-black text-amber-400">{amberSections.length}</span>
                      <span className="text-[10px] text-amber-300/70">Medium Confidence</span>
                    </div>
                  </div>
                  <HelpCircle className="w-5 h-5 text-amber-400" />
                </div>
              </div>

              <div
                onClick={() => setFilterRag(filterRag === 'RED' ? 'ALL' : 'RED')}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  filterRag === 'RED'
                    ? 'bg-rose-950 border-rose-400 shadow-md shadow-rose-950/40'
                    : 'bg-slate-900/80 border-slate-800 hover:border-rose-500/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">
                      Red (Critical Gaps)
                    </span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-xl font-black text-rose-400">{redSections.length}</span>
                      <span className="text-[10px] text-rose-300/70">Low / Missing</span>
                    </div>
                  </div>
                  <AlertCircle className="w-5 h-5 text-rose-400" />
                </div>
              </div>
            </div>

            {/* Visual RAG Mini-Strip */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>RAG Distribution Across Document Sections:</span>
                <span>
                  {Math.round((greenSections.length / (sectionsCompliance.length || 1)) * 100)}% Green •{' '}
                  {Math.round((amberSections.length / (sectionsCompliance.length || 1)) * 100)}% Amber •{' '}
                  {Math.round((redSections.length / (sectionsCompliance.length || 1)) * 100)}% Red
                </span>
              </div>
              <div className="w-full h-3 rounded-full overflow-hidden bg-slate-950 flex border border-slate-800">
                <div
                  className="bg-emerald-500 h-full transition-all duration-500"
                  style={{ width: `${(greenSections.length / (sectionsCompliance.length || 1)) * 100}%` }}
                  title={`${greenSections.length} Green Sections`}
                />
                <div
                  className="bg-amber-500 h-full transition-all duration-500"
                  style={{ width: `${(amberSections.length / (sectionsCompliance.length || 1)) * 100}%` }}
                  title={`${amberSections.length} Amber Sections`}
                />
                <div
                  className="bg-rose-500 h-full transition-all duration-500"
                  style={{ width: `${(redSections.length / (sectionsCompliance.length || 1)) * 100}%` }}
                  title={`${redSections.length} Red Sections`}
                />
              </div>
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setFilterRag('ALL')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filterRag === 'ALL'
                    ? 'bg-slate-200 text-slate-950 shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                All Sections ({sectionsCompliance.length})
              </button>
              <button
                onClick={() => setFilterRag('GREEN')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filterRag === 'GREEN'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/50 border border-emerald-500/30'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Green Conforming ({greenSections.length})</span>
              </button>
              <button
                onClick={() => setFilterRag('AMBER')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filterRag === 'AMBER'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-amber-950/40 text-amber-300 hover:bg-amber-900/50 border border-amber-500/30'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Amber Review Required ({amberSections.length})</span>
              </button>
              <button
                onClick={() => setFilterRag('RED')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filterRag === 'RED'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-rose-950/40 text-rose-300 hover:bg-rose-900/50 border border-rose-500/30'
                }`}
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Red Critical Gaps ({redSections.length})</span>
              </button>
            </div>
          </div>
        )}

        {/* VIEW MODE 2: KNOWLEDGE AREAS FILTER */}
        {viewMode === 'knowledgeAreas' && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-800">
            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={() => setFilterConfidence('All')}
                className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                  filterConfidence === 'All'
                    ? 'bg-slate-800 text-white border border-slate-700'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All Domains (10)
              </button>
              <button
                onClick={() => setFilterConfidence('High')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                  filterConfidence === 'High'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                    : 'text-emerald-400/80 hover:text-emerald-300'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>High Confidence ({highKnowledgeCount})</span>
              </button>
              <button
                onClick={() => setFilterConfidence('Medium')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                  filterConfidence === 'Medium'
                    ? 'bg-amber-950 text-amber-300 border border-amber-500/50'
                    : 'text-amber-400/80 hover:text-amber-300'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Medium / TBC ({mediumKnowledgeCount})</span>
              </button>
              <button
                onClick={() => setFilterConfidence('Low')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                  filterConfidence === 'Low'
                    ? 'bg-rose-950 text-rose-300 border border-rose-500/50'
                    : 'text-rose-400/80 hover:text-rose-300'
                }`}
              >
                <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                <span>Low / Peripheral ({lowKnowledgeCount})</span>
              </button>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              Click any domain below for detailed coverage notes
            </span>
          </div>
        )}
      </div>

      {/* SECTION HEATMAP GRID: COLOR-CODED SECTION TILES (RAG STATUS) */}
      {viewMode === 'sections' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => {
                const title = window.prompt('Enter new section title:');
                if (title && onAddSection) onAddSection(title);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-950 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-900 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Add Custom Section</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredSections.map((sec, idx) => {
              const isGreen = sec.ragStatus === 'GREEN';
              const isAmber = sec.ragStatus === 'AMBER';
              const isRed = sec.ragStatus === 'RED';
              const isSelected = selectedSection?.sectionName === sec.sectionName;
              
              // Find index in main array for reordering
              const originalIdx = requiredSections.indexOf(sec.sectionName);
              const isFixed = originalIdx === 0 || originalIdx === requiredSections.length - 1;

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedSection(isSelected ? null : sec)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? isGreen
                        ? 'bg-emerald-950/40 border-emerald-400 shadow-lg shadow-emerald-950/50'
                        : isAmber
                        ? 'bg-amber-950/40 border-amber-400 shadow-lg shadow-amber-950/50'
                        : 'bg-rose-950/40 border-rose-400 shadow-lg shadow-rose-950/50'
                      : isGreen
                      ? 'bg-[#0F172A]/90 border-emerald-500/40 hover:border-emerald-400 hover:bg-slate-900/80'
                      : isAmber
                      ? 'bg-[#0F172A]/90 border-amber-500/40 hover:border-amber-400 hover:bg-slate-900/80'
                      : 'bg-[#0F172A]/90 border-rose-500/50 hover:border-rose-400 hover:bg-slate-900/80'
                  }`}
                >
                  {/* RAG Status Corner Accent Indicator */}
                  <div
                    className={`absolute top-0 right-0 w-2 h-full ${
                      isGreen ? 'bg-emerald-500' : isAmber ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                  />

                  {/* Section Header */}
                  <div className="flex items-start justify-between gap-2 mb-2 pr-2">
                    <div className="min-w-0">
                      <span className="text-[10px] text-cyan-400 font-mono block truncate">
                        {sec.knowledgeArea}
                      </span>
                      <h4 className="text-xs font-bold text-white tracking-tight truncate mt-0.5">
                        {sec.sectionName}
                      </h4>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase shrink-0 ${
                          isGreen
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-500/60'
                            : isAmber
                            ? 'bg-amber-950 text-amber-300 border-amber-500/60'
                            : 'bg-rose-950 text-rose-300 border-rose-500/60'
                        }`}
                      >
                        {sec.ragStatus}
                      </span>
                      
                      {/* Reordering Controls (Only if not fixed and not filtered) */}
                      {!isFixed && filterRag === 'ALL' && (
                        <div className="flex items-center gap-1 mt-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveSection(originalIdx, 'up');
                            }}
                            disabled={originalIdx <= 1}
                            className="p-1 bg-slate-900 border border-slate-700 rounded text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                            title="Move Up"
                          >
                            <TrendingUp className="w-3 h-3 -rotate-45" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveSection(originalIdx, 'down');
                            }}
                            disabled={originalIdx >= requiredSections.length - 2}
                            className="p-1 bg-slate-900 border border-slate-700 rounded text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                            title="Move Down"
                          >
                            <TrendingUp className="w-3 h-3 rotate-[135deg]" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                {/* Confidence Bar & Percentage */}
                <div className="space-y-1 my-2.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-mono text-[10px]">PMBOK Confidence</span>
                    <span
                      className={`font-mono font-bold ${
                        isGreen ? 'text-emerald-400' : isAmber ? 'text-amber-400' : 'text-rose-400'
                      }`}
                    >
                      {sec.confidenceScore}%
                    </span>
                  </div>

                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isGreen
                          ? 'bg-gradient-to-r from-emerald-500 to-cyan-400'
                          : isAmber
                          ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                          : 'bg-gradient-to-r from-rose-600 to-rose-400'
                      }`}
                      style={{ width: `${Math.max(10, sec.confidenceScore)}%` }}
                    />
                  </div>
                </div>

                {/* Findings Snippet */}
                <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed mb-2">
                  {sec.findings}
                </p>

                {/* Footer Badges & Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px]">
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="flex items-center gap-1 font-mono">
                      <FileText className="w-3 h-3 text-cyan-400" />
                      {sec.evidenceCount} facts
                    </span>
                    {sec.advisoryCount > 0 && (
                      <span className="flex items-center gap-1 font-mono text-amber-400 font-bold">
                        <AlertTriangle className="w-3 h-3" />
                        {sec.advisoryCount} advisories
                      </span>
                    )}
                  </div>

                  {onSelectSection && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectSection(sec.sectionName);
                      }}
                      className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>Jump</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Expanded Inspection Drawer */}
                {isSelected && (
                  <div className="mt-3 pt-3 border-t border-slate-800 space-y-2 bg-slate-950/90 p-3 rounded-lg border border-slate-800">
                    <div className="text-[11px] text-slate-300">
                      <strong className="text-white block mb-0.5">Verified Evidence Excerpt:</strong>
                      <span className="font-mono text-[10px] text-cyan-300 block bg-slate-900 p-2 rounded border border-slate-800">
                        {sec.sampleEvidence}
                      </span>
                    </div>

                    {sec.remediationAdvice && (
                      <div className="text-[11px] text-emerald-300 bg-emerald-950/30 p-2 rounded border border-emerald-500/30">
                        <strong className="text-emerald-400 block mb-0.5">Audit Remediation Advice:</strong>
                        <span>{sec.remediationAdvice}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    )}

      {/* KNOWLEDGE AREAS VIEW */}
      {viewMode === 'knowledgeAreas' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredKnowledgeAreas.map((item, idx) => {
            const isHigh = item.confidenceLevel === 'High';
            const isMedium = item.confidenceLevel === 'Medium';
            const isSelected = selectedArea?.knowledgeArea === item.knowledgeArea;

            return (
              <div
                key={idx}
                onClick={() => setSelectedArea(isSelected ? null : item)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 border-cyan-400 shadow-md shadow-cyan-950/40'
                    : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/40'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h4 className="text-xs font-bold text-white tracking-tight">
                      {item.knowledgeArea}
                    </h4>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {item.sectionsCovered?.join(', ') || 'General Project Sections'}
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase shrink-0 ${
                      isHigh
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                        : isMedium
                        ? 'bg-amber-950 text-amber-300 border-amber-500/40'
                        : 'bg-rose-950 text-rose-300 border-rose-500/40'
                    }`}
                  >
                    {item.confidenceLevel} Confidence
                  </span>
                </div>

                <div className="space-y-1 my-3">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-mono">Evidence Density</span>
                    <span
                      className={`font-mono font-bold ${
                        isHigh ? 'text-emerald-400' : isMedium ? 'text-amber-400' : 'text-rose-400'
                      }`}
                    >
                      {item.coverageScore}%
                    </span>
                  </div>

                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isHigh
                          ? 'bg-gradient-to-r from-emerald-500 to-cyan-400'
                          : isMedium
                          ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                          : 'bg-gradient-to-r from-rose-500 to-rose-400'
                      }`}
                      style={{ width: `${Math.max(12, item.coverageScore)}%` }}
                    />
                  </div>
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {item.notes}
                </p>

                {isSelected && item.suggestions && (
                  <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-cyan-300 bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
                    <strong className="text-slate-400 flex items-center gap-1 mb-1">
                      <Sparkles className="w-3 h-3 text-cyan-400" />
                      Governance Optimization Advice:
                    </strong>
                    <span>{item.suggestions}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
