import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  Copy,
  PlusCircle,
  X,
  FileText,
  Layers,
  ChevronRight,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import {
  SUGGESTED_MEETING_AGENDAS,
  MeetingAgendaTemplate,
  formatAgendaAsMarkdown
} from '../data/meetingAgendas';

interface MeetingAgendaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertAgenda?: (markdown: string) => void;
  projectName?: string;
  currentDocId?: string;
}

export const MeetingAgendaModal: React.FC<MeetingAgendaModalProps> = ({
  isOpen,
  onClose,
  onInsertAgenda,
  projectName,
  currentDocId
}) => {
  // Select initial template based on currentDocId if available
  const initialTemplate = SUGGESTED_MEETING_AGENDAS.find((a) =>
    currentDocId ? a.documentRelevance.includes(currentDocId) : false
  ) || SUGGESTED_MEETING_AGENDAS[0];

  const [selectedAgenda, setSelectedAgenda] = useState<MeetingAgendaTemplate>(initialTemplate);
  const [copied, setCopied] = useState(false);
  const [inserted, setInserted] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    const md = formatAgendaAsMarkdown(selectedAgenda, projectName);
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleInsert = () => {
    if (onInsertAgenda) {
      const md = formatAgendaAsMarkdown(selectedAgenda, projectName);
      onInsertAgenda(md);
      setInserted(true);
      setTimeout(() => {
        setInserted(false);
        onClose();
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0F172A] border border-cyan-500/30 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden text-slate-200">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0B1528] border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-950/70 border border-cyan-500/30 text-cyan-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Suggested Meeting Agendas & Governance Protocols
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-bold text-cyan-300 bg-cyan-950 border border-cyan-500/30 rounded">
                  PMBOK 7th Ed
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Authoritative, time-boxed meeting structures for stakeholder alignment, update calls, general technical sessions, and kick-off / close-out milestones.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Meeting Type Selection Tabs */}
        <div className="p-3 bg-[#091120] border-b border-slate-800/80 overflow-x-auto flex gap-2 shrink-0">
          {SUGGESTED_MEETING_AGENDAS.map((agenda) => {
            const isSelected = agenda.id === selectedAgenda.id;
            return (
              <button
                key={agenda.id}
                onClick={() => setSelectedAgenda(agenda)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-bold scale-[1.02]'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 border border-slate-700/50'
                }`}
              >
                <span>{agenda.categoryName}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-cyan-950/30 text-slate-950' : 'bg-slate-900 text-slate-400'}`}>
                  {agenda.items.length} items
                </span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* Agenda Overview Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 via-cyan-950/30 to-slate-900 border border-cyan-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="text-base font-bold text-white mb-1 flex items-center gap-2">
                <span>{selectedAgenda.title}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                {selectedAgenda.purpose}
              </p>
            </div>
            <div className="flex md:flex-col gap-2 shrink-0 text-xs">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700 text-cyan-300 font-mono">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>{selectedAgenda.recommendedDuration}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700 text-emerald-300">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span>{selectedAgenda.recommendedAttendees.length} Key Roles</span>
              </div>
            </div>
          </div>

          {/* Required Attendees & Prerequisites Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                Recommended Attendees & Quorum
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {selectedAgenda.recommendedAttendees.map((att, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                    <span>{att}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Pre-Meeting Governance Requirements
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {selectedAgenda.governancePrerequisites.map((req, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Time-Boxed Agenda Structure Table */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                Time-Boxed Discussion Breakdown
              </span>
              <span className="text-[11px] text-cyan-400 font-normal">
                {selectedAgenda.items.reduce((acc, it) => acc + it.durationMinutes, 0)} Total Minutes Scheduled
              </span>
            </div>

            <div className="space-y-3">
              {selectedAgenda.items.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-bold text-xs flex items-center justify-center shrink-0">
                        {item.order}
                      </span>
                      <h4 className="font-semibold text-white text-sm">
                        {item.title}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-800 text-cyan-300 border border-slate-700">
                        {item.durationMinutes} min
                      </span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                        {item.presenterRole}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 mb-2 italic">
                    Objective: {item.objective}
                  </p>

                  <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 text-xs space-y-1">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Key Discussion Points:
                    </div>
                    <ul className="list-disc list-inside text-slate-300 space-y-0.5 pl-1">
                      {item.discussionPoints.map((dp, idx) => (
                        <li key={idx}>{dp}</li>
                      ))}
                    </ul>
                    <div className="pt-1.5 mt-1.5 border-t border-slate-800 text-[11px] text-cyan-400 font-medium">
                      🎯 Deliverable Output: <span className="text-slate-200">{item.expectedOutput}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mandatory Closing Deliverables */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              Closing Deliverables (24-Hour Governance Distribution Rule)
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-300">
              {selectedAgenda.closingDeliverables.map((deliv, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/40 border border-slate-800/60">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{deliv}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-[#0B1528] border-t border-slate-800 flex items-center justify-between shrink-0 gap-3">
          <div className="text-xs text-slate-400">
            Select this agenda structure for project governance sessions.
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5 text-cyan-400" />
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Agenda (Markdown)'}</span>
            </button>

            {onInsertAgenda && (
              <button
                onClick={handleInsert}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all shadow-md shadow-cyan-500/20 hover:scale-105 active:scale-95 cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>{inserted ? 'Inserted!' : 'Insert Agenda into Document'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
