import React, { useRef } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  FilePlus,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Sparkles,
  Loader2,
  ShieldCheck,
  FileCheck,
  Users,
  Info,
  Database,
  Search
} from 'lucide-react';
import { PMIDocumentDefinition } from '../data/documents';
import { ExtractedFile, parseFileClientSide } from '../utils/fileParsers';
import { StakeholderImpactMatrix } from './StakeholderImpactMatrix';
import { RegisterManager } from './RegisterManager';
import { ProjectRisk, ProjectAssumption, MatrixStakeholder } from '../data/projectRegisters';
import { performForensicSearch, SearchResult } from '../utils/vectorStore';

export interface FoundItem {
  field: string;
  valueSummary: string;
  source: string;
  confidence?: 'high' | 'medium';
}

export interface MissingItem {
  field: string;
  question: string;
  hint: string;
  suggestedDefault?: string;
}

export interface UncertainItem {
  field: string;
  conflictSummary: string;
  options: string[];
}

export interface ClarificationAnswer {
  status: 'answered' | 'tbc' | 'na';
  value: string;
}

interface Step3ClarifyProps {
  selectedDoc: PMIDocumentDefinition;
  foundItems: FoundItem[];
  missingItems: MissingItem[];
  uncertainItems: UncertainItem[];
  answers: Record<string, ClarificationAnswer>;
  onAnswerChange: (field: string, answer: ClarificationAnswer) => void;
  isLoading: boolean;
  onRerunAnalysis: () => void;
  onAddFiles: (files: ExtractedFile[]) => void;
  onProceed: () => void;
  onBack: () => void;
  hasProgressData?: boolean;
  stakeholderMatrix: MatrixStakeholder[];
  onStakeholderMatrixChange: (matrix: MatrixStakeholder[]) => void;
  projectRisks: ProjectRisk[];
  onProjectRisksChange: (risks: ProjectRisk[]) => void;
  projectAssumptions: ProjectAssumption[];
  onProjectAssumptionsChange: (assumptions: ProjectAssumption[]) => void;
  files: ExtractedFile[];
}

export const Step3Clarify: React.FC<Step3ClarifyProps> = ({
  selectedDoc,
  foundItems,
  missingItems,
  uncertainItems,
  answers,
  onAnswerChange,
  isLoading,
  onRerunAnalysis,
  onAddFiles,
  onProceed,
  onBack,
  hasProgressData = true,
  stakeholderMatrix,
  onStakeholderMatrixChange,
  projectRisks,
  onProjectRisksChange,
  projectAssumptions,
  onProjectAssumptionsChange,
  files,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || files.length === 0) return;
    
    setIsSearching(true);
    try {
      const results = await performForensicSearch(searchQuery, files);
      setSearchResults(results);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const isReport = selectedDoc.id === 'report-generator';
  const showProgressWarning = isReport && !hasProgressData;

  // Check if every missing and uncertain field has been either answered, marked TBC, or marked N/A
  const totalClarifications = missingItems.length + uncertainItems.length;
  const answeredCount = [...missingItems.map((m) => m.field), ...uncertainItems.map((u) => u.field)].filter(
    (field) => {
      const a = answers[field];
      if (!a) return false;
      if (a.status === 'tbc' || a.status === 'na') return true;
      return a.status === 'answered' && a.value.trim().length > 0;
    }
  ).length;

  const isComplete = answeredCount === totalClarifications;

  const handleQuickAddFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const newFiles: ExtractedFile[] = [];
    for (let i = 0; i < e.target.files.length; i++) {
      const parsed = await parseFileClientSide(e.target.files[i]);
      newFiles.push(parsed);
    }
    onAddFiles(newFiles);
    // Gap analysis will re-run automatically via parent effect
  };

  const handleMarkAllTbc = () => {
    [...missingItems, ...uncertainItems].forEach((item) => {
      if (!answers[item.field] || answers[item.field].status === 'answered' && !answers[item.field].value.trim()) {
        onAnswerChange(item.field, {
          status: 'tbc',
          value: 'Leave as TBC'
        });
      }
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
            Step 3 of 5 · Forensic Gap Analysis
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight mt-0.5">
            Clarify Information for {selectedDoc.title}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Our PMBOK engine mapped your source text against required ISO fields. Answer missing items or toggle them as TBC.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          <button
            onClick={onProceed}
            disabled={!isComplete || isLoading}
            className={`flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-lg transition-all shadow-md ${
              isComplete && !isLoading
                ? 'bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 cursor-pointer shadow-cyan-500/20 hover:scale-[1.02]'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <span>Generate Document</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {showProgressWarning && (
        <div className="p-4 bg-amber-950/40 border border-amber-500/30 rounded-xl flex items-start gap-4">
          <AlertTriangle className="w-5 h-5 text-amber-400 mt-1 shrink-0" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-amber-200">Missing Progress Data for Report</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              You are generating a <strong>Progress Report</strong>, but no existing "Progress Reports", "Status Updates", or "Weekly Summaries" were detected in your source material. We recommend uploading a previous status document or manually providing period progress in the fields below.
            </p>
          </div>
        </div>
      )}

      {/* Auto-re-run alert & upload more files */}
      <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <RefreshCw className={`w-4 h-4 text-cyan-400 ${isLoading ? 'animate-spin' : ''}`} />
          <span>
            {isLoading
              ? 'Analyzing source text against PMBOK standards...'
              : `Found ${foundItems.length} field${foundItems.length === 1 ? '' : 's'}. ${missingItems.length} missing, ${uncertainItems.length} uncertain.`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {totalClarifications > 0 && (
            <button
              onClick={handleMarkAllTbc}
              className="text-[11px] text-amber-300 hover:text-amber-200 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/30 px-2.5 py-1 rounded transition-colors cursor-pointer"
              title="Sets any unanswered fields to TBC"
            >
              Set Remaining as TBC
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".txt,.md,.docx,.pdf,.xlsx,.csv,.json,.vtt,.srt"
            onChange={handleQuickAddFile}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1 bg-cyan-950 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-900 rounded text-xs font-medium cursor-pointer transition-colors"
          >
            <FilePlus className="w-3.5 h-3.5" />
            <span>Upload More Files (Auto Re-run)</span>
          </button>
        </div>
      </div>

      {/* Forensic RAG Search Section */}
      <div className="bg-[#0F172A] border border-cyan-500/20 rounded-2xl overflow-hidden shadow-xl">
        <div className="bg-slate-900/90 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-tight">Forensic Artifact Search (RAG)</h3>
              <p className="text-[10px] text-slate-400 mt-0.5 italic">Semantic retrieval across {files.length} uploaded project artifacts</p>
            </div>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for evidence (e.g. 'Who is the budget holder?', 'What are the technical constraints?')..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors"
            />
            <button 
              type="submit"
              disabled={isSearching || !searchQuery.trim()}
              className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>Query Store</span>
            </button>
          </form>

          {searchResults.length > 0 ? (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Top Forensic Matches</div>
              {searchResults.map((res, i) => (
                <div key={i} className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2 hover:border-cyan-500/30 transition-all group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-xs font-bold text-white">{res.sourceName}</span>
                    </div>
                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-900/50">
                      Match: {Math.round(res.relevanceScore * 100)}%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 italic leading-relaxed bg-slate-900/40 p-2 rounded border border-slate-800/50">
                    "{res.snippet}"
                  </p>
                  <div className="text-[9px] text-slate-500 flex items-center gap-1.5 pt-1">
                    <Sparkles className="w-3 h-3 text-cyan-400/50" />
                    <span>Justification: {res.justification}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : searchQuery && !isSearching && (
            <div className="text-center py-4 text-[11px] text-slate-500 italic">
              No specific evidence found for that query. Try broader project keywords.
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="py-16 text-center space-y-3 bg-[#0F172A] rounded-xl border border-slate-800">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mx-auto" />
          <h3 className="text-sm font-semibold text-white">Conducting Forensic PMBOK Gap Analysis</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Extracting validated evidence, detecting cross-source contradictions, and isolating required gaps...
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* SECTION A: Confirmed Fields (Found in Source Material) */}
          {foundItems.length > 0 && (
            <div className="bg-[#0F172A] border border-slate-800 rounded-xl overflow-hidden">
              <div className="bg-slate-900/90 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Populated from Source Material ({foundItems.length})</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Forensic Grounding</span>
              </div>

              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                {foundItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-lg space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-200">{item.field}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 font-medium">
                        Found
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 line-clamp-2">{item.valueSummary}</p>
                    <div className="text-[10px] text-cyan-400 font-mono flex items-center gap-1 pt-1 border-t border-slate-800/60">
                      <FileCheck className="w-3 h-3 shrink-0" />
                      <span className="truncate">Evidence: {item.source}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION B: Conflicting / Uncertain Items */}
          {uncertainItems.length > 0 && (
            <div className="bg-[#0F172A] border border-amber-500/40 rounded-xl overflow-hidden shadow-md shadow-amber-950/10">
              <div className="bg-amber-950/30 px-4 py-3 border-b border-amber-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Conflicting Information Across Sources ({uncertainItems.length})</span>
                </div>
                <span className="text-[10px] text-amber-400 font-medium">Choose Authoritative Value</span>
              </div>

              <div className="p-4 space-y-4">
                {uncertainItems.map((item) => {
                  const currentAnswer = answers[item.field] || { status: 'answered', value: '' };

                  return (
                    <div
                      key={item.field}
                      className="p-4 bg-slate-950/80 border border-slate-800 rounded-lg space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-xs font-bold text-white">{item.field}</div>
                          <p className="text-xs text-amber-200 mt-0.5">{item.conflictSummary}</p>
                        </div>

                        {/* Status tag */}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            currentAnswer.status === 'tbc'
                              ? 'bg-amber-950 text-amber-300 border-amber-500/40'
                              : currentAnswer.status === 'na'
                              ? 'bg-slate-900 text-slate-400 border-slate-700'
                              : currentAnswer.value.trim()
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                              : 'bg-rose-950 text-rose-300 border-rose-500/40'
                          }`}
                        >
                          {currentAnswer.status === 'tbc'
                            ? 'Marked as TBC'
                            : currentAnswer.status === 'na'
                            ? 'Not Applicable'
                            : currentAnswer.value.trim()
                            ? 'Resolved'
                            : 'Required'}
                        </span>
                      </div>

                      {/* Competing Options Buttons */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] text-slate-400 font-semibold">
                          Select authoritative source value:
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {item.options.map((opt, oIdx) => (
                            <button
                              key={oIdx}
                              onClick={() =>
                                onAnswerChange(item.field, {
                                  status: 'answered',
                                  value: opt,
                                })
                              }
                              className={`text-left p-2.5 rounded-md text-xs transition-all border cursor-pointer ${
                                currentAnswer.status === 'answered' && currentAnswer.value === opt
                                  ? 'bg-cyan-950 border-cyan-400 text-cyan-200 font-semibold shadow-xs'
                                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                              }`}
                            >
                              <div className="text-[10px] text-slate-400 uppercase">Option {oIdx + 1}</div>
                              <div className="mt-0.5">{opt}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Custom input or override */}
                      <div className="space-y-1">
                        <input
                          type="text"
                          value={currentAnswer.status === 'answered' ? currentAnswer.value : ''}
                          onChange={(e) =>
                            onAnswerChange(item.field, {
                              status: 'answered',
                              value: e.target.value,
                            })
                          }
                          placeholder="Or type custom agreed value..."
                          className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                        />
                      </div>

                      {/* Quick Toggles */}
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() =>
                            onAnswerChange(item.field, {
                              status: 'tbc',
                              value: 'Leave as TBC',
                            })
                          }
                          className={`text-[11px] px-2.5 py-1 rounded border cursor-pointer transition-colors ${
                            currentAnswer.status === 'tbc'
                              ? 'bg-amber-950 border-amber-400 text-amber-200 font-bold'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-amber-300'
                          }`}
                        >
                          Leave as TBC
                        </button>

                        <button
                          onClick={() =>
                            onAnswerChange(item.field, {
                              status: 'na',
                              value: 'Not applicable',
                            })
                          }
                          className={`text-[11px] px-2.5 py-1 rounded border cursor-pointer transition-colors ${
                            currentAnswer.status === 'na'
                              ? 'bg-slate-800 border-slate-500 text-slate-200 font-bold'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          Not applicable
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION B.2: Stakeholder Matrix (Power vs Interest) */}
          <div className="bg-[#0F172A] border border-slate-800 rounded-xl overflow-hidden shadow-lg">
            <div className="bg-slate-900/90 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
                <Users className="w-4 h-4 text-cyan-400" />
                <span>Stakeholder Matrix (Power vs. Interest)</span>
              </div>
              <div className="flex items-center gap-2">
                <Info className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-[10px] text-slate-400 font-mono italic">Drag nodes on the D3 canvas to reposition stakeholders</span>
              </div>
            </div>

            <div className="p-0">
              <StakeholderImpactMatrix 
                stakeholders={stakeholderMatrix}
                onUpdateStakeholders={onStakeholderMatrixChange}
                projectName={selectedDoc.title}
              />
            </div>
          </div>

          {/* SECTION B.3: Project Registry Management (CSV Import/Export) */}
          <RegisterManager 
            stakeholders={stakeholderMatrix}
            onUpdateStakeholders={onStakeholderMatrixChange}
            risks={projectRisks}
            onUpdateRisks={onProjectRisksChange}
            assumptions={projectAssumptions}
            onUpdateAssumptions={onProjectAssumptionsChange}
          />


          {/* SECTION C: Missing Required Fields (All in one form) */}
          <div className="bg-[#0F172A] border border-slate-800 rounded-xl overflow-hidden">
            <div className="bg-slate-900/90 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider">
                <HelpCircle className="w-4 h-4 text-sky-400" />
                <span>Missing Fields Required for {selectedDoc.title} ({missingItems.length})</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {answeredCount}/{totalClarifications} Clarified
              </span>
            </div>

            {missingItems.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                <span className="text-white font-semibold">Zero Information Gaps!</span> All mandatory fields were successfully extracted from your source materials.
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {missingItems.map((item) => {
                  const currentAnswer = answers[item.field] || { status: 'answered', value: '' };

                  return (
                    <div
                      key={item.field}
                      className="p-4 bg-slate-950/80 border border-slate-800 rounded-lg space-y-2.5 transition-all"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-xs font-bold text-white">{item.field}</div>
                          <p className="text-xs text-sky-300 mt-0.5">{item.question}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5 font-mono">{item.hint}</p>
                        </div>

                        {/* Status Tag */}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border shrink-0 ${
                            currentAnswer.status === 'tbc'
                              ? 'bg-amber-950 text-amber-300 border-amber-500/40'
                              : currentAnswer.status === 'na'
                              ? 'bg-slate-900 text-slate-400 border-slate-700'
                              : currentAnswer.value.trim()
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                              : 'bg-rose-950 text-rose-300 border-rose-500/40'
                          }`}
                        >
                          {currentAnswer.status === 'tbc'
                            ? 'TBC'
                            : currentAnswer.status === 'na'
                            ? 'N/A'
                            : currentAnswer.value.trim()
                            ? 'Answered'
                            : 'Required'}
                        </span>
                      </div>

                      {/* Text Input */}
                      {currentAnswer.status === 'answered' && (
                        <textarea
                          rows={2}
                          value={currentAnswer.value}
                          onChange={(e) =>
                            onAnswerChange(item.field, {
                              status: 'answered',
                              value: e.target.value,
                            })
                          }
                          placeholder={`Enter details for ${item.field}...`}
                          className="w-full bg-slate-900 border border-slate-700 rounded-md p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 leading-relaxed"
                        />
                      )}

                      {/* Action Toggles */}
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() =>
                            onAnswerChange(item.field, {
                              status: 'answered',
                              value: currentAnswer.status === 'answered' ? currentAnswer.value : '',
                            })
                          }
                          className={`text-[11px] px-2.5 py-1 rounded border cursor-pointer transition-colors ${
                            currentAnswer.status === 'answered'
                              ? 'bg-cyan-950 border-cyan-400 text-cyan-200 font-semibold'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          Type Answer
                        </button>

                        <button
                          onClick={() =>
                            onAnswerChange(item.field, {
                              status: 'tbc',
                              value: 'Leave as TBC',
                            })
                          }
                          className={`text-[11px] px-2.5 py-1 rounded border cursor-pointer transition-colors ${
                            currentAnswer.status === 'tbc'
                              ? 'bg-amber-950 border-amber-400 text-amber-200 font-bold'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-amber-300'
                          }`}
                        >
                          Leave as TBC
                        </button>

                        <button
                          onClick={() =>
                            onAnswerChange(item.field, {
                              status: 'na',
                              value: 'Not applicable',
                            })
                          }
                          className={`text-[11px] px-2.5 py-1 rounded border cursor-pointer transition-colors ${
                            currentAnswer.status === 'na'
                              ? 'bg-slate-800 border-slate-500 text-slate-200 font-bold'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          Not applicable
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Navigation */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
            <div className="text-xs text-slate-400">
              {isComplete ? (
                <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  All fields accounted for. Ready to draft document.
                </span>
              ) : (
                <span className="text-amber-400 font-semibold">
                  {totalClarifications - answeredCount} field{totalClarifications - answeredCount === 1 ? '' : 's'} remaining. Type details or toggle to TBC / N/A.
                </span>
              )}
            </div>

            <button
              onClick={onProceed}
              disabled={!isComplete || isLoading}
              className={`flex items-center gap-2 px-6 py-2.5 text-xs font-bold rounded-lg transition-all shadow-md ${
                isComplete && !isLoading
                  ? 'bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 cursor-pointer shadow-cyan-500/20 hover:scale-[1.02]'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>Generate Formal Document</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
