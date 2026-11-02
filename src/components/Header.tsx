import React from 'react';
import { ShieldAlert, Trash2, Award, BookOpen, Layers, FolderTree } from 'lucide-react';

interface HeaderProps {
  onClearSession: () => void;
  healthScore?: number;
  isAnalyzing?: boolean;
  onOpenReadiness?: () => void;
  selectedStandard?: 'PMBOK 7';
  onSelectStandard?: (standard: 'PMBOK 7') => void;
  onOpenIsoFolders?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onClearSession, 
  healthScore = 0, 
  isAnalyzing = false,
  onOpenReadiness,
  selectedStandard = 'PMBOK 7',
  onSelectStandard,
  onOpenIsoFolders
}) => {
  const getHealthColor = (score: number) => {
    if (score >= 85) return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/40';
    if (score >= 60) return 'text-amber-400 bg-amber-500/20 border-amber-500/40';
    return 'text-rose-400 bg-rose-500/20 border-rose-500/40';
  };

  const getHealthLabel = (score: number) => {
    if (score >= 85) return 'Audit Ready';
    if (score >= 60) return 'Requires Review';
    if (score === 0) return 'Empty Session';
    return 'Insufficient Data';
  };

  return (
    <header className="app-header border-b border-slate-800 bg-[#0B1528]/95 backdrop-blur-md sticky top-0 z-40 transition-all">
      {/* Top Banner: Local Storage Notice */}
      <div className="bg-amber-950/40 border-b border-amber-500/20 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs md:text-sm text-amber-300 font-medium">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
          <span>
            <strong className="font-semibold text-amber-200">Session Persistence:</strong> Current progress is cached in your browser's local storage. Use "Clear Session" to permanently wipe all data.
          </span>
        </div>

        {/* Clear Session Button */}
        <button
          onClick={onClearSession}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-rose-300 bg-rose-950/60 hover:bg-rose-900/80 border border-rose-500/30 rounded-md transition-all hover:scale-105 active:scale-95 shadow-xs shrink-0 cursor-pointer"
          title="Instantly wipes all in-memory files, extracted text, and document drafts"
        >
          <Trash2 className="w-3.5 h-3.5 text-rose-400" />
          <span>Clear Session</span>
        </button>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand Emblem & Wordmark */}
        <div className="flex items-center gap-3">
          {/* Hexagonal Tech-Node Emblem - Monochrome Minimalist */}
          <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
            <svg
              viewBox="0 0 100 100"
              className="w-10 h-10"
            >
              {/* Outer Hexagon */}
              <polygon
                points="50,5 90,27.5 90,72.5 50,95 10,72.5 10,27.5"
                fill="none"
                stroke="white"
                strokeWidth="6"
                strokeLinejoin="round"
              />
              {/* Internal Interconnected Nodes */}
              <circle cx="50" cy="50" r="8" fill="white" />
              <line x1="50" y1="5" x2="50" y2="50" stroke="white" strokeWidth="4" />
              <line x1="90" y1="72.5" x2="50" y2="50" stroke="white" strokeWidth="4" />
              <line x1="10" y1="72.5" x2="50" y2="50" stroke="white" strokeWidth="4" />
            </svg>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tighter text-white font-sans uppercase">
                ADVANNOTECH
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold text-white bg-slate-800 border border-slate-700 rounded">
                (PTY) LTD
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">
              Engineering & Governance
            </p>
          </div>
        </div>

        {/* Standard Selection & Readiness */}
        <div className="flex items-center gap-3">


          {/* Standard Selector Dropdown */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Standard:</span>
            <select 
              value={selectedStandard}
              onChange={(e) => onSelectStandard?.(e.target.value as any)}
              className="bg-transparent text-xs font-bold text-cyan-400 focus:outline-none cursor-pointer"
            >
              <option value="PMBOK 7">PMBOK 7</option>
            </select>
          </div>

          {/* SESSION HEALTH INDICATOR */}
          <div 
            onClick={onOpenReadiness}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all shadow-sm cursor-pointer hover:scale-105 active:scale-95 ${getHealthColor(healthScore)}`}
            title="Click to view detailed Audit Readiness Summary"
          >
            <div className="flex flex-col items-start leading-tight">
              <span className="text-[9px] uppercase font-bold tracking-tighter opacity-80">Session Health</span>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black font-mono">{healthScore}%</span>
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              </div>
            </div>
            <div className="h-6 w-px bg-current opacity-20 mx-0.5" />
            <span className="font-bold text-[10px] uppercase tracking-wide truncate max-w-[100px]">
              {isAnalyzing ? 'Analyzing...' : getHealthLabel(healthScore)}
            </span>
          </div>
        </div>

        {/* Read-Only Governance Summary Metadata badges */}
        <div className="hidden lg:flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-900/80 border border-slate-700/60 text-slate-300">
            <Award className="w-3.5 h-3.5 text-slate-400" />
            <span>Tone: <strong className="text-white font-semibold">Authoritative</strong></span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-900/80 border border-slate-700/60 text-slate-300">
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            <span>Profile: <strong className="text-white font-semibold">{selectedStandard}</strong></span>
          </div>
        </div>
      </div>
    </header>
  );
};
