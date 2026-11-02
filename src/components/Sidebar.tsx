import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  FolderOpen,
  FileText,
  Search,
  CheckCircle2,
  Compass,
  CalendarCheck,
  PlaySquare,
  Activity,
  Award,
  Users,
  CheckSquare,
  Square,
  Sparkles,
  FileSearch,
  BarChart3,
  Zap,
  Hammer,
  FolderTree,
  BookOpen,
  Download,
  Upload,
  LayoutGrid
} from 'lucide-react';
import { HowToUseWiki } from './HowToUseWiki';
import {
  PMIPhase,
  PMI_PHASES,
  DOCUMENT_CATALOGUE,
  PMIDocumentDefinition,
  CUSTOM_DOCUMENT_DEFINITION
} from '../data/documents';
import { ADVANNOTECH_STAKEHOLDERS, AdvannotechResource } from '../data/stakeholders';

interface SidebarProps {
  selectedDoc: PMIDocumentDefinition | null;
  onSelectDoc: (doc: PMIDocumentDefinition) => void;
  onQuickGenerate?: (doc: PMIDocumentDefinition) => void;
  selectedResources: AdvannotechResource[];
  onToggleResource: (resource: AdvannotechResource) => void;
  onSelectCoreTeam: () => void;
  onClearResources: () => void;
  appMode?: 'generate' | 'audit-existing' | 'multi-doc-report';
  onSelectAppMode?: (mode: 'generate' | 'audit-existing' | 'multi-doc-report') => void;
  onOpenAgendas?: () => void;
  onOpenDesignDocPrompt?: () => void;
  onOpenStakeholderModal?: () => void;
  onOpenIsoFolders?: () => void;
  onDownloadIsoZip?: () => void;
  onUploadJobCard?: (files: File[]) => void;
  onUploadTranscript?: (file: File) => void;
  meetingDistribution?: 'internal' | 'external';
  onSetMeetingDistribution?: (dist: 'internal' | 'external') => void;
  documentReadiness?: Record<string, 'ready' | 'partial' | 'not-ready'>;
}

const PHASE_ICONS: Record<PMIPhase, React.ComponentType<{ className?: string }>> = {
  'Initiation': Compass,
  'Planning': CalendarCheck,
  'Execution': PlaySquare,
  'Monitoring & Controlling': Activity,
  'Closing': Award,
};

export const Sidebar: React.FC<SidebarProps> = ({
  selectedDoc,
  onSelectDoc,
  onQuickGenerate,
  selectedResources,
  onToggleResource,
  onSelectCoreTeam,
  onClearResources,
  appMode = 'generate',
  onSelectAppMode,
  onOpenAgendas,
  onOpenDesignDocPrompt,
  onOpenStakeholderModal,
  onOpenIsoFolders,
  onDownloadIsoZip,
  onUploadJobCard,
  onUploadTranscript,
  meetingDistribution = 'external',
  onSetMeetingDistribution,
  documentReadiness = {},
}) => {
  const [isWikiOpen, setIsWikiOpen] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'documents' | 'resources'>('documents');
  const [expandedPhases, setExpandedPhases] = useState<Record<string, boolean>>({
    'Initiation': true,
    'Planning': true,
    'Execution': false,
    'Monitoring & Controlling': false,
    'Closing': false,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [resourceFilter, setResourceFilter] = useState('');

  const togglePhase = (phase: string) => {
    setExpandedPhases((prev) => ({
      ...prev,
      [phase]: !prev[phase],
    }));
  };

  const filteredDocs = DOCUMENT_CATALOGUE.filter((d) =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.phase.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.purpose.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredResources = ADVANNOTECH_STAKEHOLDERS.filter((r) =>
    r.name.toLowerCase().includes(resourceFilter.toLowerCase()) ||
    r.title.toLowerCase().includes(resourceFilter.toLowerCase()) ||
    r.department.toLowerCase().includes(resourceFilter.toLowerCase()) ||
    r.location.toLowerCase().includes(resourceFilter.toLowerCase())
  );

  const getDocumentStatusStyles = (doc: PMIDocumentDefinition) => {
    const readiness = documentReadiness[doc.id] || 'not-ready';
    
    if (readiness === 'ready') {
      return {
        bg: 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200',
        icon: 'text-emerald-400',
        badge: 'bg-emerald-500 text-slate-950',
        label: 'Ready'
      };
    }
    if (readiness === 'partial') {
      return {
        bg: 'bg-amber-950/40 border-amber-500/40 text-amber-200',
        icon: 'text-amber-400',
        badge: 'bg-amber-500 text-slate-950',
        label: 'Partial'
      };
    }
    if (doc.isCritical) {
      return {
        bg: 'bg-rose-950/40 border-rose-500/40 text-rose-200',
        icon: 'text-rose-400',
        badge: 'bg-rose-500 text-slate-950',
        label: 'Critical'
      };
    }
    return {
      bg: 'hover:bg-blue-900/20 text-slate-300 border-transparent hover:border-blue-500/30',
      icon: 'text-blue-500/60',
      badge: null,
      label: null
    };
  };

  return (
    <aside className="no-print w-72 md:w-80 bg-[#0B1528] border-r border-slate-800 flex flex-col shrink-0 h-[calc(100vh-105px)] overflow-hidden">
      {/* Primary Sidebar Nav Tabs */}
      <div className="p-2 bg-[#0F172A] border-b border-slate-800 space-y-1.5">
        <div className="grid grid-cols-3 gap-1">
          <button
            onClick={() => {
              if (onSelectAppMode) onSelectAppMode('generate');
              setSidebarTab('documents');
            }}
            className={`flex flex-col items-center justify-center gap-1 py-1.5 px-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
              appMode === 'generate' && sidebarTab === 'documents'
                ? 'bg-cyan-950 text-cyan-200 border border-cyan-500/40 shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span>Generate</span>
          </button>

          <button
            onClick={() => {
              if (onSelectAppMode) onSelectAppMode('audit-existing');
            }}
            className={`flex flex-col items-center justify-center gap-1 py-1.5 px-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
              appMode === 'audit-existing'
                ? 'bg-cyan-950 text-cyan-200 border border-cyan-500/40 shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileSearch className="w-3.5 h-3.5 text-cyan-400" />
            <span>Audit Doc</span>
          </button>

          <button
            onClick={() => {
              if (onSelectAppMode) onSelectAppMode('multi-doc-report');
            }}
            className={`flex flex-col items-center justify-center gap-1 py-1.5 px-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
              appMode === 'multi-doc-report'
                ? 'bg-cyan-950 text-cyan-200 border border-cyan-500/40 shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
            <span>ISO Report</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-1 pt-1 border-t border-slate-800/60">
          <button
            onClick={() => {
              setSidebarTab('resources');
            }}
            className={`flex items-center justify-center gap-1.5 py-1 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              sidebarTab === 'resources'
                ? 'bg-cyan-950 text-cyan-200 border border-cyan-500/40 shadow-xs font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span>Resources</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                selectedResources.length > 0
                  ? 'bg-cyan-500 text-slate-950'
                  : 'text-slate-400 font-mono'
              }`}
            >
              {selectedResources.length}
            </span>
          </button>

          {onOpenAgendas && (
            <button
              onClick={onOpenAgendas}
              className="flex items-center justify-center gap-1.5 py-1 px-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
            >
              <CalendarCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Agendas</span>
            </button>
          )}
        </div>
      </div>

      {sidebarTab === 'documents' ? (
        // VIEW A: PMI DOCUMENT CATALOGUE
        <>
          {/* Meeting Minute Generator (Transcript to ISO 21500 Minutes) */}
          <div className="px-2 pt-3 pb-1">
            <div className="w-full flex flex-col p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/20 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  <span className="text-[11px] font-bold uppercase tracking-tight text-emerald-200 font-sans">Meeting Minute Generator</span>
                </div>
                <span className="text-[8px] px-1.5 py-0.5 rounded bg-emerald-900/40 text-emerald-400 border border-emerald-500/20 font-mono">ISO 21500</span>
              </div>

              {/* Distribution Toggle */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest pl-1">Distribution Type</label>
                <div className="flex items-center gap-1 p-1 bg-slate-900/60 rounded-lg border border-slate-800">
                  <button 
                    onClick={() => onSetMeetingDistribution?.('internal')}
                    className={`flex-1 py-1 text-[10px] font-bold rounded transition-all cursor-pointer ${
                      meetingDistribution === 'internal' 
                        ? 'bg-emerald-500 text-slate-950 shadow-sm' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Internal
                  </button>
                  <button 
                    onClick={() => onSetMeetingDistribution?.('external')}
                    className={`flex-1 py-1 text-[10px] font-bold rounded transition-all cursor-pointer ${
                      meetingDistribution === 'external' 
                        ? 'bg-emerald-500 text-slate-950 shadow-sm' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    External
                  </button>
                </div>
              </div>
              
              <label className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-md bg-emerald-900/20 border border-dashed border-emerald-500/30 hover:border-emerald-400 hover:bg-emerald-900/40 transition-all cursor-pointer group">
                <Upload className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold text-emerald-300">Intake Meeting Transcript</span>
                <input 
                  type="file" 
                  className="hidden" 
                  accept=".txt,.md,.docx,.pdf,.vtt,.srt"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file && onUploadTranscript) onUploadTranscript(file);
                  }}
                />
              </label>
              <p className="text-[9px] text-slate-500 text-center px-1">Upload a transcript to instantly generate formal minutes.</p>
            </div>
          </div>

          {/* Search Header */}
          <div className="p-3 border-b border-slate-800 bg-[#0F172A]/70 space-y-3">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FolderOpen className="w-3.5 h-3.5 text-cyan-400" />
                Document Catalogue
              </span>
              <span className="text-[10px] text-cyan-400 font-mono">5 Phases</span>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search document or phase..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700/70 rounded-md text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Catalogue List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {searchQuery ? (
              // Search results view
              <div className="space-y-1">
                <div className="px-2 py-1 text-[11px] text-slate-500 font-bold uppercase tracking-widest">
                  Found {filteredDocs.length} Results
                </div>
                {filteredDocs.map((doc) => {
                  const isSelected = selectedDoc?.id === doc.id;
                  const cleanTitle = doc.title.replace(/^\d+(\.\d+)*[\._\s-]*/, '').replace(/[-_]/g, ' ');
                  const statusStyles = getDocumentStatusStyles(doc);
                  
                  return (
                    <div key={doc.id} className="relative group">
                      <button
                        onClick={() => onSelectDoc(doc)}
                        className={`w-full text-left p-2 rounded-md transition-all flex items-start gap-2.5 cursor-pointer pr-10 border border-transparent ${
                          isSelected
                            ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-200'
                            : statusStyles.bg
                        }`}
                      >
                        <FileText className={`w-4 h-4 mt-0.5 shrink-0 ${isSelected ? 'text-cyan-400' : statusStyles.icon}`} />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold leading-tight truncate">{cleanTitle}</div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="text-[10px] text-slate-500 uppercase tracking-tighter">{doc.phase.replace(/[-_]/g, ' ')}</div>
                            {statusStyles.label && !isSelected && (
                              <span className={`text-[8px] font-black px-1 rounded uppercase ${statusStyles.badge}`}>
                                {statusStyles.label}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                      {onQuickGenerate && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onQuickGenerate(doc);
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-slate-500 hover:text-cyan-400 hover:bg-cyan-950/50 transition-all opacity-20 group-hover:opacity-100 cursor-pointer flex items-center gap-1"
                          title="Instant Forensic Synthesis"
                        >
                          <span className="text-[8px] font-bold uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">Quick</span>
                          <Zap className="w-3.5 h-3.5 fill-current" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              // Grouped by Phase
              <>
                {/* Special Section: ISO Folder Structure */}
                <div className="px-1.5 py-1">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={onOpenIsoFolders}
                      className="flex-1 flex items-center justify-between px-2.5 py-3 rounded-lg bg-slate-900/40 border border-slate-800 hover:border-cyan-500/30 hover:bg-slate-800/40 text-slate-300 hover:text-cyan-300 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <FolderTree className="w-4 h-4 text-cyan-500 group-hover:scale-110 transition-transform" />
                        <div className="text-left">
                          <div className="text-xs font-bold uppercase tracking-tight">Project Governance and Framework</div>
                          <p className="text-[10px] text-slate-500 group-hover:text-cyan-400/70 transition-colors">ISO 21500 Standard Directory & Manifests</p>
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                    </button>
                    {onDownloadIsoZip && (
                      <button
                        onClick={onDownloadIsoZip}
                        className="p-3 rounded-lg bg-slate-900/40 border border-slate-800 hover:border-cyan-500/30 hover:bg-cyan-950/30 text-slate-400 hover:text-cyan-400 transition-all cursor-pointer shrink-0"
                        title="Download ISO Folder Structure (.zip)"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* New Section: Job Cards & Work Requests */}
                <div className="px-1.5 py-1">
                  <div className="w-full flex flex-col p-2.5 rounded-lg bg-indigo-950/20 border border-indigo-500/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckSquare className="w-4 h-4 text-indigo-400" />
                        <span className="text-[11px] font-bold uppercase tracking-tight text-indigo-200">Job Cards & Work Requests</span>
                      </div>
                      <span className="text-[9px] text-indigo-400/60 font-mono italic">Upload Zone</span>
                    </div>
                    
                    <label className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-md bg-indigo-900/20 border border-dashed border-indigo-500/30 hover:border-indigo-400 hover:bg-indigo-900/40 transition-all cursor-pointer group">
                      <Upload className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-bold text-indigo-300">Upload Job Card</span>
                      <input 
                        type="file" 
                        className="hidden" 
                        multiple
                        onChange={(e) => {
                          const files = e.target.files;
                          if (files && onUploadJobCard) onUploadJobCard(Array.from(files));
                        }}
                      />
                    </label>
                  </div>
                </div>

                {/* Divider between Governance and Initiation */}
                <div className="h-px bg-slate-800/80 mx-2 mb-3 mt-1 shadow-sm" />

                {PMI_PHASES.map((phase) => {
                  const phaseDocs = DOCUMENT_CATALOGUE.filter((d) => d.phase === phase);
                  const isExpanded = !!expandedPhases[phase];
                  const hasSelectedDocInPhase = phaseDocs.some((d) => d.id === selectedDoc?.id);
                  const PhaseIcon = PHASE_ICONS[phase];
                  const cleanPhaseName = phase.replace(/[-_]/g, ' ');

                  return (
                    <div key={phase} className="rounded-lg overflow-hidden border border-slate-800/40 mb-1">
                      {/* Phase Header Accordion */}
                      <button
                        onClick={() => togglePhase(phase)}
                        className={`w-full flex items-center justify-between px-2.5 py-2 text-left transition-all cursor-pointer ${
                          hasSelectedDocInPhase
                            ? 'bg-slate-800/90 text-cyan-300 font-semibold'
                            : 'bg-[#0F172A] hover:bg-slate-800/30 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-2 text-xs">
                          <PhaseIcon className={`w-3.5 h-3.5 ${hasSelectedDocInPhase ? 'text-cyan-400' : 'text-slate-500'}`} />
                          <span className="font-bold tracking-tight">{cleanPhaseName}</span>
                        </div>
                        {isExpanded ? (
                          <ChevronDown className="w-3.5 h-3.5 text-slate-600" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                        )}
                      </button>

                      {/* Document Items */}
                      {isExpanded && (
                        <div className="bg-[#0B1528] py-1 px-1.5 space-y-0.5 border-t border-slate-800/30">
                          {phaseDocs.map((doc) => {
                            const isSelected = selectedDoc?.id === doc.id;
                            const cleanTitle = doc.title.replace(/^\d+(\.\d+)*[\._\s-]*/, '').replace(/[-_]/g, ' ');
                            const statusStyles = getDocumentStatusStyles(doc);
                            
                            return (
                              <div key={doc.id} className="relative group/item">
                                <button
                                  key={doc.id}
                                  onClick={() => onSelectDoc(doc)}
                                  className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-all flex items-center justify-between cursor-pointer pr-8 border border-transparent ${
                                    isSelected
                                      ? 'bg-gradient-to-r from-cyan-950/60 to-sky-950/40 text-cyan-200 border border-cyan-500/30 font-semibold shadow-xs'
                                      : statusStyles.bg
                                  }`}
                                >
                                  <div className="flex items-center gap-2 truncate">
                                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                      isSelected ? 'bg-cyan-400 animate-pulse' : 
                                      statusStyles.label === 'Ready' ? 'bg-emerald-400' :
                                      statusStyles.label === 'Partial' ? 'bg-amber-400' :
                                      statusStyles.label === 'Critical' ? 'bg-rose-400' :
                                      'bg-slate-700'
                                    }`} />
                                    <span className="truncate">{cleanTitle}</span>
                                  </div>
                                  {isSelected ? (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 ml-1" />
                                  ) : (
                                    statusStyles.label && (
                                      <span className={`text-[8px] font-black px-1 rounded uppercase ${statusStyles.badge}`}>
                                        {statusStyles.label === 'Critical' ? '!!!' : statusStyles.label}
                                      </span>
                                    )
                                  )}
                                </button>
                                {onQuickGenerate && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onQuickGenerate(doc);
                                    }}
                                    className="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-600 hover:text-cyan-400 hover:bg-cyan-950/50 transition-all opacity-20 group-hover/item:opacity-100 cursor-pointer flex items-center gap-1"
                                    title="Quick Generate"
                                  >
                                    <span className="text-[8px] font-bold uppercase tracking-tighter opacity-0 group-hover/item:opacity-100 transition-opacity">Quick</span>
                                    <Zap className="w-3 h-3 fill-current" />
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            )}
          </div>

          {/* Custom Document Button - Moved under the stages */}
          <div className="p-2 border-t border-slate-800 bg-[#0F172A]/40">
            <button
              onClick={() => onSelectDoc(CUSTOM_DOCUMENT_DEFINITION)}
              className={`w-full flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer group ${
                selectedDoc?.id === 'custom-doc'
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200 shadow-xs'
                  : 'bg-slate-950/40 border-slate-800 hover:border-emerald-500/30 text-slate-300 hover:text-emerald-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Hammer className={`w-4 h-4 shrink-0 ${selectedDoc?.id === 'custom-doc' ? 'text-emerald-400' : 'text-slate-500 group-hover:text-emerald-400'}`} />
                <span className="text-xs font-bold uppercase tracking-tight">Build Your Own Document</span>
              </div>
              <Sparkles className={`w-3.5 h-3.5 shrink-0 ${selectedDoc?.id === 'custom-doc' ? 'text-emerald-400 animate-pulse' : 'text-slate-600'}`} />
            </button>

            <button
              onClick={() => {
                const reportGen = DOCUMENT_CATALOGUE.find(d => d.id === 'report-generator');
                if (reportGen) onSelectDoc(reportGen);
              }}
              className={`mt-1.5 w-full flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer group ${
                selectedDoc?.id === 'report-generator'
                  ? 'bg-sky-950/40 border-sky-500/50 text-sky-200 shadow-xs'
                  : 'bg-slate-950/40 border-slate-800 hover:border-sky-500/30 text-slate-300 hover:text-sky-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <BarChart3 className={`w-4 h-4 shrink-0 ${selectedDoc?.id === 'report-generator' ? 'text-sky-400' : 'text-slate-500 group-hover:text-sky-400'}`} />
                <span className="text-xs font-bold uppercase tracking-tight">Report Generator</span>
              </div>
              <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${selectedDoc?.id === 'report-generator' ? 'text-sky-400' : 'text-slate-600'}`} />
            </button>
          </div>
        </>
      ) : (
        // VIEW B: ADVANNOTECH RESOURCES & STAKEHOLDERS
        <>
          <div className="p-3 border-b border-slate-800 bg-[#0F172A]/70 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                Advannotech Resources
              </span>
              <span className="text-[10px] text-cyan-400 font-mono">
                {selectedResources.length} of {ADVANNOTECH_STAKEHOLDERS.length}
              </span>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={resourceFilter}
                onChange={(e) => setResourceFilter(e.target.value)}
                placeholder="Filter by name, role or dept..."
                className="w-full pl-8 pr-3 py-1 bg-slate-900 border border-slate-700/70 rounded-md text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Quick action buttons */}
            <div className="flex items-center justify-between pt-1 text-[11px]">
              <div className="flex items-center gap-2">
                <button
                  onClick={onSelectCoreTeam}
                  className="text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer"
                  title="Select Sponsor, PM, Tech Lead, CFO"
                >
                  + Core Team
                </button>
                {onOpenStakeholderModal && (
                  <button
                    onClick={onOpenStakeholderModal}
                    className="flex items-center gap-1 text-sky-400 hover:text-sky-300 font-bold cursor-pointer"
                  >
                    <LayoutGrid className="w-3 h-3" />
                    <span>Visual Map</span>
                  </button>
                )}
              </div>
              <button
                onClick={onClearResources}
                className="text-slate-400 hover:text-rose-400 cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Resources List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {filteredResources.map((res) => {
              const isAssigned = selectedResources.some((r) => r.email === res.email);

              return (
                <div
                  key={res.email}
                  onClick={() => onToggleResource(res)}
                  className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                    isAssigned
                      ? 'bg-cyan-950/40 border-cyan-500/50 shadow-xs'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/40'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5">
                      {isAssigned ? (
                        <CheckSquare className="w-4 h-4 text-cyan-400" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-600" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-white truncate">{res.name}</span>
                        <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-800 shrink-0">
                          {res.location}
                        </span>
                      </div>

                      <div className="text-[11px] font-semibold text-cyan-300 leading-tight">
                        {res.title}
                      </div>

                      <div className="text-[10px] text-slate-400 mt-1 truncate">
                        {res.governanceRole}
                      </div>

                      <div className="mt-1.5 pt-1.5 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                        <span className="truncate">{res.email}</span>
                        {res.phone && <span className="shrink-0 ml-1">{res.phone}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <div className="p-2.5 border-t border-slate-800 bg-[#0F172A] space-y-1.5 shrink-0">
        <button
          onClick={onOpenDesignDocPrompt}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-950 via-[#0C2A4A] to-cyan-950 hover:from-cyan-900 hover:to-sky-900 text-cyan-300 border border-cyan-500/40 transition-all cursor-pointer shadow-sm group hover:scale-[1.01]"
          title="Provide formal technical design document and architectural synthesis prompt for the selected document"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-12 transition-transform" />
          <span>Prompt / Design Document</span>
        </button>

        <button
          onClick={() => setIsWikiOpen(true)}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-slate-700/80 hover:border-emerald-500/40 transition-all cursor-pointer shadow-xs group"
          title="Open the platform Wiki and User Guide"
        >
          <BookOpen className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
          <span>Platform Wiki / Guide</span>
        </button>

        <HowToUseWiki isOpen={isWikiOpen} onClose={() => setIsWikiOpen(false)} />

        <div className="flex items-center justify-between text-[10px] text-slate-500 px-1">
          <span>ISO 21500 / PMBOK 7th</span>
          <span className="text-cyan-400 font-mono font-medium">Advannotech</span>
        </div>
      </div>
    </aside>
  );
};
