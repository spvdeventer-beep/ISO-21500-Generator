import React, { useMemo } from 'react';
import { 
  ShieldCheck, 
  AlertCircle, 
  HelpCircle, 
  CheckCircle2, 
  X, 
  BarChart3,
  Users,
  Users2,
  CalendarDays,
  Target,
  Search,
  Activity,
  Zap,
  TriangleAlert,
  LayoutDashboard
} from 'lucide-react';
import { PMIDocumentDefinition, PMStandard } from '../data/documents';
import { FoundItem, MissingItem, UncertainItem } from './Step3Clarify';

interface AuditReadinessSummaryProps {
  isOpen: boolean;
  onClose: () => void;
  healthScore: number;
  foundItems: FoundItem[];
  missingItems: MissingItem[];
  uncertainItems: UncertainItem[];
  selectedDoc: PMIDocumentDefinition | null;
  selectedStandard: PMStandard;
}

type PerformanceDomain = 
  | 'Stakeholder' 
  | 'Team' 
  | 'Development Approach & Life Cycle' 
  | 'Planning' 
  | 'Project Work' 
  | 'Delivery' 
  | 'Measurement' 
  | 'Uncertainty'
  | 'General Governance';

const DOMAIN_ICONS: Record<PerformanceDomain, React.ElementType> = {
  'Stakeholder': Users,
  'Team': Users2,
  'Development Approach & Life Cycle': Zap,
  'Planning': CalendarDays,
  'Project Work': Activity,
  'Delivery': Target,
  'Measurement': BarChart3,
  'Uncertainty': TriangleAlert,
  'General Governance': ShieldCheck
};

/**
 * Maps field names to PMBOK 7th Edition Performance Domains
 */
function getDomainForField(fieldName: string): PerformanceDomain {
  const f = fieldName.toLowerCase();
  if (f.includes('stakeholder') || f.includes('sponsor') || f.includes('approv')) return 'Stakeholder';
  if (f.includes('team') || f.includes('manager') || f.includes('resource') || f.includes('person')) return 'Team';
  if (f.includes('milestone') || f.includes('date') || f.includes('schedule') || f.includes('window')) return 'Planning';
  if (f.includes('budget') || f.includes('cost') || f.includes('financial')) return 'Project Work';
  if (f.includes('scope') || f.includes('deliverable') || f.includes('requirement')) return 'Delivery';
  if (f.includes('success') || f.includes('objective') || f.includes('metric') || f.includes('kpi')) return 'Measurement';
  if (f.includes('risk') || f.includes('assumption') || f.includes('constraint') || f.includes('uncertainty')) return 'Uncertainty';
  if (f.includes('approach') || f.includes('lifecycle') || f.includes('method')) return 'Development Approach & Life Cycle';
  return 'General Governance';
}

export const AuditReadinessSummary: React.FC<AuditReadinessSummaryProps> = ({
  isOpen,
  onClose,
  healthScore,
  foundItems,
  missingItems,
  uncertainItems,
  selectedDoc,
  selectedStandard
}) => {
  const domainSummary = useMemo(() => {
    const domains: Record<PerformanceDomain, { found: number, missing: number, total: number }> = {
      'Stakeholder': { found: 0, missing: 0, total: 0 },
      'Team': { found: 0, missing: 0, total: 0 },
      'Development Approach & Life Cycle': { found: 0, missing: 0, total: 0 },
      'Planning': { found: 0, missing: 0, total: 0 },
      'Project Work': { found: 0, missing: 0, total: 0 },
      'Delivery': { found: 0, missing: 0, total: 0 },
      'Measurement': { found: 0, missing: 0, total: 0 },
      'Uncertainty': { found: 0, missing: 0, total: 0 },
      'General Governance': { found: 0, missing: 0, total: 0 },
    };

    foundItems.forEach(item => {
      const domain = getDomainForField(item.field);
      domains[domain].found++;
      domains[domain].total++;
    });

    missingItems.forEach(item => {
      const domain = getDomainForField(item.field);
      domains[domain].missing++;
      domains[domain].total++;
    });

    uncertainItems.forEach(item => {
      const domain = getDomainForField(item.field);
      domains[domain].missing++; // Treat uncertain as a gap for readiness
      domains[domain].total++;
    });

    return domains;
  }, [foundItems, missingItems, uncertainItems]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0F172A] border border-cyan-500/30 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Audit Readiness Summary</h3>
              <p className="text-xs text-slate-400">Forensic gap analysis and {selectedStandard} alignment report</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Top Level Score Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Health Score</span>
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-slate-800"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * healthScore) / 100}
                    className={`${healthScore >= 85 ? 'text-emerald-500' : healthScore >= 60 ? 'text-amber-500' : 'text-rose-500'} transition-all duration-1000 ease-out`}
                  />
                </svg>
                <span className="absolute text-2xl font-black text-white">{healthScore}%</span>
              </div>
              <span className={`mt-2 text-xs font-bold uppercase tracking-wide ${healthScore >= 85 ? 'text-emerald-400' : healthScore >= 60 ? 'text-amber-400' : 'text-rose-400'}`}>
                {healthScore >= 85 ? 'Audit Ready' : healthScore >= 60 ? 'Deficiencies Found' : 'Critical Gaps'}
              </span>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex flex-col justify-center col-span-2">
              <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <Search className="w-4 h-4 text-cyan-400" />
                Discovery Pipeline Status
              </h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-medium text-slate-300">Grounded evidence detected</span>
                  </div>
                  <span className="text-sm font-bold text-emerald-400">{foundItems.length} fields</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-medium text-slate-300">Mandatory fields missing</span>
                  </div>
                  <span className="text-sm font-bold text-rose-400">{missingItems.length} fields</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-medium text-slate-300">Conflicting source data</span>
                  </div>
                  <span className="text-sm font-bold text-amber-400">{uncertainItems.length} conflicts</span>
                </div>
              </div>
            </div>
          </div>

          {/* PMBOK Performance Domains Breakdown */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2 px-1">
              <BarChart3 className="w-4 h-4 text-sky-400" />
              {selectedStandard} Edition Performance Domain Health
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(domainSummary).map(([domain, stats]) => {
                if (stats.total === 0) return null;
                const Icon = DOMAIN_ICONS[domain as PerformanceDomain];
                const ratio = stats.found / stats.total;
                const statusColor = ratio >= 0.8 ? 'emerald' : ratio >= 0.5 ? 'amber' : 'rose';
                
                return (
                  <div key={domain} className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className={`p-2 rounded-lg bg-${statusColor}-500/10 text-${statusColor}-400 border border-${statusColor}-500/20`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="text-right">
                        <span className={`text-xs font-bold text-${statusColor}-400`}>{Math.round(ratio * 100)}%</span>
                        <div className="text-[9px] text-slate-500 font-mono">{stats.found}/{stats.total} covered</div>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="text-xs font-bold text-slate-200 line-clamp-1" title={domain}>{domain}</div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full bg-${statusColor}-500 transition-all duration-700 ease-out`}
                          style={{ width: `${ratio * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Immediate Attention Flags */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2 px-1">
              <TriangleAlert className="w-4 h-4 text-rose-400" />
              Immediate Attention Required
            </h4>
            
            {(missingItems.length === 0 && uncertainItems.length === 0) ? (
              <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-6 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm text-emerald-300 font-medium">No critical gaps identified in the current forensic stream.</p>
                <p className="text-xs text-emerald-500 mt-1">The project document is ready for high-integrity synthesis.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Uncertainty / Conflicts take priority */}
                {uncertainItems.map((item, idx) => (
                  <div key={`u-${idx}`} className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-4 flex gap-4">
                    <div className="mt-1">
                      <HelpCircle className="w-5 h-5 text-amber-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-amber-300 uppercase tracking-wide">Data Conflict</span>
                        <span className="text-[10px] font-mono text-amber-500/70">{getDomainForField(item.field)}</span>
                      </div>
                      <p className="text-sm font-semibold text-white mb-1">{item.field}</p>
                      <p className="text-xs text-slate-300 leading-relaxed">{item.conflictSummary}</p>
                    </div>
                  </div>
                ))}

                {/* Missing Items */}
                {missingItems.slice(0, 5).map((item, idx) => (
                  <div key={`m-${idx}`} className="bg-rose-950/20 border border-rose-500/30 rounded-xl p-4 flex gap-4">
                    <div className="mt-1">
                      <AlertCircle className="w-5 h-5 text-rose-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-rose-300 uppercase tracking-wide">Evidence Missing</span>
                        <span className="text-[10px] font-mono text-rose-500/70">{getDomainForField(item.field)}</span>
                      </div>
                      <p className="text-sm font-semibold text-white mb-1">{item.field}</p>
                      <p className="text-xs text-slate-300 leading-relaxed">{item.question}</p>
                      {item.hint && <p className="text-[10px] text-slate-500 mt-2 italic">Standard expectation: {item.hint}</p>}
                    </div>
                  </div>
                ))}

                {missingItems.length > 5 && (
                  <div className="text-center py-2">
                    <span className="text-xs text-slate-500">...and {missingItems.length - 5} other mandatory parameters missing.</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-all"
          >
            Return to Workstation
          </button>
        </div>
      </div>
    </div>
  );
};
