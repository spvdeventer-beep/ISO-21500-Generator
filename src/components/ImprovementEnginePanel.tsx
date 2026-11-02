import React, { useState } from 'react';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Send,
  Copy,
  Check,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Download,
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';
import {
  ImprovementEngineItem,
  generateSmeEmailTemplate
} from '../utils/improvementEngine';

interface ImprovementEnginePanelProps {
  items: ImprovementEngineItem[];
  onApplyFix: (item: ImprovementEngineItem, customData?: string) => void;
  docTitle?: string;
  projectName?: string;
  onRefresh?: () => void;
}

export const ImprovementEnginePanel: React.FC<ImprovementEnginePanelProps> = ({
  items,
  onApplyFix,
  docTitle = 'PMBOK Project Document',
  projectName = 'Advannotech Strategic Initiative',
  onRefresh,
}) => {
  const [filter, setFilter] = useState<'all' | 'red' | 'amber' | 'resolved'>('all');
  const [expandedItemId, setExpandedItemId] = useState<string | null>(items[0]?.id || null);
  const [userInputs, setUserInputs] = useState<Record<string, string>>({});
  const [copiedEmailId, setCopiedEmailId] = useState<string | null>(null);
  const [resolvedMap, setResolvedMap] = useState<Record<string, boolean>>({});

  const redCount = items.filter((i) => i.flag === 'RED' && !resolvedMap[i.id]).length;
  const amberCount = items.filter((i) => i.flag === 'AMBER' && !resolvedMap[i.id]).length;
  const resolvedCount = Object.values(resolvedMap).filter(Boolean).length;
  const totalCount = items.length;
  const progressPercent = totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 100;

  const filteredItems = items.filter((item) => {
    const isResolved = resolvedMap[item.id];
    if (filter === 'resolved') return isResolved;
    if (isResolved && filter !== 'all') return false;
    if (filter === 'red') return item.flag === 'RED';
    if (filter === 'amber') return item.flag === 'AMBER';
    return true;
  });

  const handleCopyEmail = (item: ImprovementEngineItem) => {
    const email = generateSmeEmailTemplate(item, docTitle, projectName);
    navigator.clipboard.writeText(email);
    setCopiedEmailId(item.id);
    setTimeout(() => setCopiedEmailId(null), 2500);
  };

  const handleApplyCustomData = (item: ImprovementEngineItem) => {
    const inputVal = userInputs[item.id]?.trim();
    const finalVal = inputVal || item.missingDataPrompt.sampleValue;
    onApplyFix(item, finalVal);
    setResolvedMap((prev) => ({ ...prev, [item.id]: true }));
  };

  const handleApplyClause = (item: ImprovementEngineItem) => {
    onApplyFix(item);
    setResolvedMap((prev) => ({ ...prev, [item.id]: true }));
  };

  const toggleResolved = (itemId: string) => {
    setResolvedMap((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const handleExportPlan = () => {
    const mdLines = [
      `# PMBOK 7th Edition Improvement & Remediation Plan`,
      `**Document:** ${docTitle}`,
      `**Project:** ${projectName}`,
      `**Date:** ${new Date().toISOString().split('T')[0]}`,
      `**Overall Status:** ${resolvedCount}/${totalCount} Flags Remediated (${progressPercent}%)\n`,
      `---\n`,
      `## Actionable Remediation Items\n`,
    ];

    items.forEach((item, idx) => {
      const isResolved = !!resolvedMap[item.id];
      mdLines.push(`### ${idx + 1}. [${item.flag}] ${item.title}`);
      mdLines.push(`- **Section:** ${item.sectionOrField}`);
      mdLines.push(`- **Status:** ${isResolved ? 'RESOLVED' : 'PENDING'}`);
      mdLines.push(`- **Defect:** ${item.defectSummary}`);
      mdLines.push(`- **Actionable Steps:**`);
      item.actionableSteps.forEach((s) => mdLines.push(`  - ${s}`));
      mdLines.push(`- **Recommended Source Files:** ${item.sourceFileReferences.recommendedFileType}`);
      mdLines.push(`- **Specific Table/Section to Inspect:** ${item.sourceFileReferences.sectionToInspect}`);
      mdLines.push(`- **Missing Data Prompt:** "${item.missingDataPrompt.promptText}" (Assignee: ${item.missingDataPrompt.responsibleRole})`);
      mdLines.push(`- **Recommended Remediation Clause:**\n\`\`\`markdown\n${item.suggestedFixClause}\n\`\`\`\n`);
    });

    const blob = new Blob([mdLines.join('\n')], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${docTitle.replace(/\s+/g, '_')}_Improvement_Plan.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Improvement Engine Header Banner */}
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-cyan-950/40 border border-amber-500/40 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Sparkles className="w-4 h-4" />
              </span>
              <h3 className="text-base font-black text-white tracking-tight flex items-center gap-2">
                PMBOK Improvement Engine
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                  Forensic Remediation
                </span>
              </h3>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Automated remediation intelligence: guides you through resolving RED & AMBER flagged content by referencing specific source files, prompting for missing parameters, and generating ready-to-inject compliance clauses.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleExportPlan}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer transition-colors"
              title="Download Remediation Action Plan as Markdown"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Plan</span>
            </button>
          </div>
        </div>

        {/* Progress & Stat Counters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-800">
          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Red Blockers
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-black text-rose-400">{redCount}</span>
              <span className="text-[10px] text-slate-400">Critical Priority</span>
            </div>
          </div>

          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Amber Warnings
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-black text-amber-400">{amberCount}</span>
              <span className="text-[10px] text-slate-400">Medium Priority</span>
            </div>
          </div>

          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Remediated
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-black text-emerald-400">{resolvedCount}</span>
              <span className="text-[10px] text-slate-400">of {totalCount} issues</span>
            </div>
          </div>

          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Resolution Rate
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-black text-cyan-400">{progressPercent}%</span>
              <span className="text-[10px] text-slate-400">Coverage</span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-3">
          <div
            className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            filter === 'all'
              ? 'bg-slate-200 text-slate-950 shadow-sm'
              : 'bg-slate-800/80 text-slate-400 hover:text-white'
          }`}
        >
          All Issues ({totalCount})
        </button>

        <button
          onClick={() => setFilter('red')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            filter === 'red'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-rose-950/40 text-rose-300 hover:bg-rose-900/50 border border-rose-500/30'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
          <span>Red Blockers ({items.filter((i) => i.flag === 'RED' && !resolvedMap[i.id]).length})</span>
        </button>

        <button
          onClick={() => setFilter('amber')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            filter === 'amber'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-amber-950/40 text-amber-300 hover:bg-amber-900/50 border border-amber-500/30'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span>Amber Warnings ({items.filter((i) => i.flag === 'AMBER' && !resolvedMap[i.id]).length})</span>
        </button>

        <button
          onClick={() => setFilter('resolved')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            filter === 'resolved'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/50 border border-emerald-500/30'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Resolved ({resolvedCount})</span>
        </button>
      </div>

      {/* Items List */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center bg-[#0F172A] border border-slate-800 rounded-2xl text-slate-400 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="text-sm font-semibold text-white">No items found for this filter</p>
            <p className="text-xs text-slate-400">
              {filter === 'resolved'
                ? 'No items have been marked as resolved yet.'
                : 'All items in this category have been addressed.'}
            </p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isResolved = !!resolvedMap[item.id];
            const isRed = item.flag === 'RED';
            const isExpanded = expandedItemId === item.id;
            const hasUploadedMatch = !!item.sourceFileReferences.alreadyUploadedMatch;

            return (
              <div
                key={item.id}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isResolved
                    ? 'bg-slate-900/50 border-slate-800 opacity-70'
                    : isRed
                    ? 'bg-[#0F172A] border-rose-500/50 shadow-md shadow-rose-950/20'
                    : 'bg-[#0F172A] border-amber-500/40 shadow-md shadow-amber-950/20'
                }`}
              >
                {/* Header row */}
                <div
                  onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                  className="p-4 flex items-center justify-between gap-3 cursor-pointer select-none hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider shrink-0 border ${
                        isResolved
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
                          : isRed
                          ? 'bg-rose-950 text-rose-300 border-rose-500/60'
                          : 'bg-amber-950 text-amber-300 border-amber-500/60'
                      }`}
                    >
                      {isResolved ? '✓ RESOLVED' : isRed ? '🔴 RED BLOCKER' : '🟡 AMBER'}
                    </span>

                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white truncate">{item.title}</span>
                        <span className="text-[11px] text-cyan-400 font-mono">({item.sectionOrField})</span>
                      </div>
                      <p className="text-xs text-slate-400 truncate max-w-xl">
                        {item.defectSummary}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleResolved(item.id);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        isResolved
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50 hover:bg-emerald-900'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {isResolved ? 'Resolved' : 'Mark Fixed'}
                    </button>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Card Body */}
                {isExpanded && (
                  <div className="p-4 pt-2 border-t border-slate-800/80 space-y-4 bg-slate-950/40">
                    {/* Defect & Impact Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                          Audit Defect Identified
                        </span>
                        <p className="text-xs text-slate-200 leading-relaxed">
                          {item.defectSummary}
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Info className="w-3.5 h-3.5 text-cyan-400" />
                          PMBOK 7th Ed. / ISO Impact
                        </span>
                        <p className="text-xs text-slate-200 leading-relaxed">
                          {item.impactAnalysis}
                        </p>
                      </div>
                    </div>

                    {/* Actionable Steps (Ordered Checklist) */}
                    <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                      <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-cyan-400" />
                        Specific Actionable Steps to Remediate
                      </span>
                      <div className="space-y-1.5">
                        {item.actionableSteps.map((step, sIdx) => (
                          <div key={sIdx} className="flex items-start gap-2.5 text-xs text-slate-200">
                            <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-bold flex items-center justify-center shrink-0 text-[10px]">
                              {sIdx + 1}
                            </span>
                            <span className="pt-0.5 leading-relaxed">{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Source File References Box */}
                    <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-emerald-400" />
                          Recommended Source File References
                        </span>
                        {hasUploadedMatch && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Match in Uploaded Files: {item.sourceFileReferences.alreadyUploadedMatch}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-400 font-semibold block">
                            Document Type to Consult:
                          </span>
                          <span className="text-cyan-300 font-semibold block bg-slate-950 p-2 rounded-lg border border-slate-800">
                            {item.sourceFileReferences.recommendedFileType}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-400 font-semibold block">
                            Target Section / Table to Inspect:
                          </span>
                          <span className="text-slate-200 font-mono text-[11px] block bg-slate-950 p-2 rounded-lg border border-slate-800">
                            {item.sourceFileReferences.sectionToInspect}
                          </span>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-400">
                        <strong>Typical file naming convention:</strong>{' '}
                        {item.sourceFileReferences.exampleFileNames.join(' • ')}
                      </div>
                    </div>

                    {/* Interactive Prompt for Missing Data Points */}
                    <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/30 via-slate-900 to-amber-950/20 border border-cyan-500/40 space-y-3">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                        <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                          Prompt for Missing Data Point
                        </span>
                        <span className="text-[10px] text-slate-300 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800">
                          Responsible SME: <strong className="text-amber-300">{item.missingDataPrompt.responsibleRole}</strong>
                        </span>
                      </div>

                      <label className="block text-xs text-white font-medium">
                        {item.missingDataPrompt.promptText}
                      </label>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={userInputs[item.id] ?? ''}
                          onChange={(e) =>
                            setUserInputs((prev) => ({ ...prev, [item.id]: e.target.value }))
                          }
                          placeholder={item.missingDataPrompt.placeholder}
                          className="flex-1 bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 outline-hidden"
                        />
                        <button
                          onClick={() => handleApplyCustomData(item)}
                          className="px-3.5 py-2 rounded-lg text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors cursor-pointer flex items-center justify-center gap-1.5 shrink-0 shadow-md shadow-cyan-500/20"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Inject & Auto-Fix</span>
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px]">
                        <span className="text-slate-400">
                          Sample baseline:{' '}
                          <button
                            type="button"
                            onClick={() =>
                              setUserInputs((prev) => ({
                                ...prev,
                                [item.id]: item.missingDataPrompt.sampleValue,
                              }))
                            }
                            className="text-cyan-400 underline hover:text-cyan-300 cursor-pointer"
                          >
                            {item.missingDataPrompt.sampleValue}
                          </button>
                        </span>

                        <button
                          type="button"
                          onClick={() => handleCopyEmail(item)}
                          className="flex items-center gap-1 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 px-2 py-1 rounded border border-slate-700 cursor-pointer transition-colors"
                        >
                          {copiedEmailId === item.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-300 font-bold">Email Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy SME Inquiry Email</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Standard Clause Preview & Apply Option */}
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-300">
                          Standard PMBOK 7th Ed. Compliance Clause
                        </span>
                        <button
                          onClick={() => handleApplyClause(item)}
                          className="px-2.5 py-1 rounded text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>Apply Standard Clause to Canvas</span>
                        </button>
                      </div>

                      <pre className="text-[11px] text-slate-300 font-mono bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 overflow-x-auto whitespace-pre-wrap">
                        {item.suggestedFixClause}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
