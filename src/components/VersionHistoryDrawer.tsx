import React, { useState } from 'react';
import {
  History,
  Camera,
  Check,
  RotateCcw,
  Trash2,
  Eye,
  X,
  Clock,
  Sparkles,
  FileText
} from 'lucide-react';

export interface DocumentSnapshot {
  id: string;
  version: string;
  timestamp: string;
  markdown: string;
  notes: string;
  wordCount: number;
  charCount: number;
}

interface VersionHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  snapshots: DocumentSnapshot[];
  activeSnapshotId: string | null;
  onRestoreSnapshot: (snapshot: DocumentSnapshot) => void;
  onCreateSnapshot: (notes: string) => void;
  onDeleteSnapshot: (snapshotId: string) => void;
}

export const VersionHistoryDrawer: React.FC<VersionHistoryDrawerProps> = ({
  isOpen,
  onClose,
  snapshots,
  activeSnapshotId,
  onRestoreSnapshot,
  onCreateSnapshot,
  onDeleteSnapshot,
}) => {
  const [newSnapshotNote, setNewSnapshotNote] = useState('');
  const [previewSnapshot, setPreviewSnapshot] = useState<DocumentSnapshot | null>(null);

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateSnapshot(newSnapshotNote.trim() || `Iteration ${snapshots.length + 1}`);
    setNewSnapshotNote('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/70 backdrop-blur-xs">
      <div className="w-full max-w-md h-full bg-[#0F172A] border-l border-cyan-500/30 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Version Control & Snapshots</h3>
              <p className="text-[11px] text-slate-400">
                Track document iterations and restore previous states before final download.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Snapshot Creation Form */}
        <div className="p-4 bg-slate-950/80 border-b border-slate-800">
          <form onSubmit={handleCreate} className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-cyan-400" />
              <span>Snapshot Current State</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSnapshotNote}
                onChange={(e) => setNewSnapshotNote(e.target.value)}
                placeholder="e.g. v1.1 - Added CFO sign-off & mitigations..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
              <button
                type="submit"
                className="px-3.5 py-1.5 bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 font-bold text-xs rounded-lg transition-all cursor-pointer shadow-sm shrink-0"
              >
                Snapshot
              </button>
            </div>
          </form>
        </div>

        {/* Snapshots List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span className="font-semibold text-slate-300">
              Saved Snapshots ({snapshots.length})
            </span>
            <span className="font-mono text-[10px]">In-Memory Session</span>
          </div>

          {snapshots.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 space-y-2">
              <History className="w-8 h-8 text-slate-600 mx-auto" />
              <p>No snapshots taken yet. Create a snapshot to preserve this version.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {snapshots.map((snap) => {
                const isActive = activeSnapshotId === snap.id;
                return (
                  <div
                    key={snap.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isActive
                        ? 'bg-cyan-950/40 border-cyan-400/80 shadow-md shadow-cyan-950/20'
                        : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-cyan-300">
                            {snap.version}
                          </span>
                          {isActive && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                              Active
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-200 font-medium">{snap.notes}</div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            {snap.timestamp}
                          </span>
                          <span>·</span>
                          <span>{snap.wordCount} words</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => setPreviewSnapshot(snap)}
                          className="p-1.5 text-slate-400 hover:text-cyan-300 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Quick preview"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {!isActive && (
                          <button
                            onClick={() => onRestoreSnapshot(snap)}
                            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-cyan-300 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 rounded transition-all cursor-pointer"
                            title="Revert document canvas to this snapshot"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Restore</span>
                          </button>
                        )}

                        {snapshots.length > 1 && (
                          <button
                            onClick={() => onDeleteSnapshot(snap.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-400 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Delete this snapshot"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Toggling restores document text immediately.</span>
          <button
            onClick={onClose}
            className="text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>

      {/* Snapshot Preview Modal */}
      {previewSnapshot && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/80 p-6 backdrop-blur-xs">
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Preview Snapshot: {previewSnapshot.version}</span>
                  <span className="text-[11px] text-slate-400 font-mono">({previewSnapshot.timestamp})</span>
                </h4>
                <p className="text-xs text-slate-400">{previewSnapshot.notes}</p>
              </div>
              <button
                onClick={() => setPreviewSnapshot(null)}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-slate-950 font-mono text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
              {previewSnapshot.markdown}
            </div>

            <div className="p-3 border-t border-slate-800 bg-slate-900 flex items-center justify-between">
              <span className="text-xs text-slate-400">{previewSnapshot.wordCount} words</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPreviewSnapshot(null)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    onRestoreSnapshot(previewSnapshot);
                    setPreviewSnapshot(null);
                  }}
                  className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg"
                >
                  Restore This Version
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
