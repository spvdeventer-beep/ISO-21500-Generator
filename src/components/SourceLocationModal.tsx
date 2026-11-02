import React, { useState, useRef } from 'react';
import {
  FolderOpen,
  Globe,
  FileText,
  FileSpreadsheet,
  FileCode,
  Check,
  X,
  Search,
  Filter,
  CheckSquare,
  Square,
  Loader2,
  ExternalLink,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { ExtractedFile, formatBytes, parseFileClientSide } from '../utils/fileParsers';

export interface DiscoveredArtifact {
  id: string;
  name: string;
  path?: string;
  size: number;
  type: string;
  rawFile?: File;
  text?: string;
  downloadUrl?: string;
  previewNotes?: string;
  selected: boolean;
  origin: 'directory' | 'gdrive' | 'sharepoint' | 'web';
}

interface SourceLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onIngestFiles: (files: ExtractedFile[]) => void;
}

export const SourceLocationModal: React.FC<SourceLocationModalProps> = ({
  isOpen,
  onClose,
  onIngestFiles,
}) => {
  const directoryInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'directory' | 'remote'>('directory');
  const [urlInput, setUrlInput] = useState('');
  const [isInspectingUrl, setIsInspectingUrl] = useState(false);
  const [isProcessingIngest, setIsProcessingIngest] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [discoveredFiles, setDiscoveredFiles] = useState<DiscoveredArtifact[]>([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'doc' | 'sheet' | 'text'>('all');

  if (!isOpen) return null;

  // Handle local directory selection
  const handleDirectorySelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setErrorMessage(null);

    const rawList = Array.from(e.target.files);
    const validExtensions = ['docx', 'pdf', 'xlsx', 'xls', 'csv', 'txt', 'md', 'json', 'vtt', 'srt'];

    const filtered = rawList.filter((f) => {
      // Exclude hidden files or temp files like ~$
      if (f.name.startsWith('.') || f.name.startsWith('~$')) return false;
      const ext = f.name.split('.').pop()?.toLowerCase() || '';
      return validExtensions.includes(ext);
    });

    if (filtered.length === 0) {
      setErrorMessage('No supported PMI artifacts (.docx, .pdf, .xlsx, .csv, .txt, etc.) were found in the selected folder.');
      return;
    }

    const artifacts: DiscoveredArtifact[] = filtered.map((file, idx) => ({
      id: `dir-${Date.now()}-${idx}`,
      name: file.name,
      path: (file as any).webkitRelativePath || file.name,
      size: file.size,
      type: file.type || 'application/octet-stream',
      rawFile: file,
      selected: true,
      origin: 'directory',
    }));

    setDiscoveredFiles((prev) => [...prev, ...artifacts]);
  };

  // Handle SharePoint / Drive URL inspection
  const handleInspectRemoteUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim() || isInspectingUrl) return;

    setIsInspectingUrl(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/source-location/inspect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput.trim() }),
      });

      if (!res.ok) {
        throw new Error(`Location inspection failed with status: ${res.status}`);
      }

      const data = await res.json();
      const originType: DiscoveredArtifact['origin'] =
        data.locationType === 'Google Drive'
          ? 'gdrive'
          : data.locationType === 'SharePoint'
          ? 'sharepoint'
          : 'web';

      const items: DiscoveredArtifact[] = (data.items || []).map((it: any, i: number) => ({
        id: it.id || `remote-${Date.now()}-${i}`,
        name: it.name,
        size: it.size || 0,
        type: it.type || 'text/plain',
        text: it.text,
        downloadUrl: it.downloadUrl,
        previewNotes: it.previewNotes,
        selected: true,
        origin: originType,
      }));

      setDiscoveredFiles((prev) => [...prev, ...items]);
      setUrlInput('');
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to inspect remote source location.');
    } finally {
      setIsInspectingUrl(false);
    }
  };

  // Toggle selection
  const toggleSelect = (id: string) => {
    setDiscoveredFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, selected: !f.selected } : f))
    );
  };

  const handleSelectAll = (select: boolean) => {
    setDiscoveredFiles((prev) => prev.map((f) => ({ ...f, selected: select })));
  };

  // Perform ingestion of selected files
  const handleConfirmIngest = async () => {
    const selected = discoveredFiles.filter((f) => f.selected);
    if (selected.length === 0) return;

    setIsProcessingIngest(true);
    const parsedFiles: ExtractedFile[] = [];

    for (const item of selected) {
      if (item.rawFile) {
        // Parse local file client-side
        const parsed = await parseFileClientSide(item.rawFile);
        parsedFiles.push(parsed);
      } else if (item.text) {
        // Direct text payload from remote doc/sheet export
        const cleanText = item.text.trim();
        const wordCount = cleanText ? cleanText.split(/\s+/).length : 0;
        parsedFiles.push({
          id: item.id,
          name: item.name,
          size: item.size,
          type: item.type,
          text: cleanText,
          charCount: cleanText.length,
          wordCount,
        });
      } else {
        // Pointer / Reference item
        const note = `=== Source Reference: ${item.name} (${item.origin.toUpperCase()}) ===\nLocation: ${item.downloadUrl || 'Remote Repository'}\nNotes: ${item.previewNotes || 'Linked governance artifact'}`;
        parsedFiles.push({
          id: item.id,
          name: item.name,
          size: item.size || 1024,
          type: item.type,
          text: note,
          charCount: note.length,
          wordCount: note.split(/\s+/).length,
        });
      }
    }

    onIngestFiles(parsedFiles);
    setIsProcessingIngest(false);
    onClose();
  };

  // Filter list
  const filteredList = discoveredFiles.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (item.path && item.path.toLowerCase().includes(searchFilter.toLowerCase()));

    if (!matchesSearch) return false;

    if (typeFilter === 'doc') {
      return item.name.endsWith('.docx') || item.name.endsWith('.pdf') || item.name.endsWith('.gdoc');
    }
    if (typeFilter === 'sheet') {
      return item.name.endsWith('.xlsx') || item.name.endsWith('.csv') || item.name.endsWith('.xls') || item.name.endsWith('.gsheet');
    }
    if (typeFilter === 'text') {
      return item.name.endsWith('.txt') || item.name.endsWith('.md') || item.name.endsWith('.json') || item.name.endsWith('.vtt') || item.name.endsWith('.srt');
    }

    return true;
  });

  const selectedCount = discoveredFiles.filter((f) => f.selected).length;

  const getFileIcon = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    if (ext === 'xlsx' || ext === 'csv' || ext === 'xls' || ext === 'gsheet') return FileSpreadsheet;
    if (ext === 'json' || ext === 'vtt' || ext === 'srt') return FileCode;
    return FileText;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-[#0F172A] border border-cyan-500/40 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in duration-150">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <FolderOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Source Location Ingestion Hub</span>
                <span className="text-[10px] text-cyan-300 font-mono bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-500/30">
                  Stateless In-Memory
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Point to a local directory or remote SharePoint/Google Drive location to review and ingest project files.
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

        {/* Input Controls */}
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 space-y-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('directory')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'directory'
                  ? 'bg-cyan-950 text-cyan-200 border border-cyan-500/50'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <FolderOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span>Scan Local Directory</span>
            </button>

            <button
              onClick={() => setActiveTab('remote')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'remote'
                  ? 'bg-cyan-950 text-cyan-200 border border-cyan-500/50'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-sky-400" />
              <span>SharePoint / Google Drive URL</span>
            </button>
          </div>

          {activeTab === 'directory' ? (
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-300">
                <span>Select a project folder on your machine. Recursively discovers all PMI artifacts (.docx, .pdf, .xlsx, .csv, .txt, etc.).</span>
              </div>

              {/* Hidden webkitdirectory input */}
              <input
                ref={directoryInputRef}
                type="file"
                // @ts-expect-error webkitdirectory is standard for folder picking
                webkitdirectory=""
                directory=""
                multiple
                onChange={handleDirectorySelected}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => directoryInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 font-bold text-xs rounded-lg transition-all cursor-pointer shadow-sm"
              >
                <FolderOpen className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Select Directory</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleInspectRemoteUrl} className="flex gap-2">
              <div className="relative flex-1">
                <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="Paste SharePoint document library or Google Drive folder/file URL..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <button
                type="submit"
                disabled={!urlInput.trim() || isInspectingUrl}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all shrink-0 cursor-pointer ${
                  urlInput.trim() && !isInspectingUrl
                    ? 'bg-gradient-to-r from-cyan-500 to-sky-500 text-slate-950'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                {isInspectingUrl ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                <span>{isInspectingUrl ? 'Inspecting...' : 'Inspect Location'}</span>
              </button>
            </form>
          )}

          {errorMessage && (
            <div className="p-2.5 bg-rose-950/60 border border-rose-500/40 rounded-lg text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Discovered Files Review Matrix */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">Discovered Files ({discoveredFiles.length})</span>
              <span className="text-slate-400 font-mono">
                {selectedCount} selected for ingestion
              </span>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1.5">
              <div className="relative">
                <Search className="w-3 h-3 text-slate-400 absolute left-2 top-2" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Filter by name..."
                  className="bg-slate-900 border border-slate-800 rounded px-2 py-1 pl-6 text-[11px] text-white focus:outline-none focus:border-cyan-400 w-32"
                />
              </div>

              <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded border border-slate-800 text-[10px]">
                <button
                  onClick={() => setTypeFilter('all')}
                  className={`px-2 py-0.5 rounded cursor-pointer ${typeFilter === 'all' ? 'bg-cyan-950 text-cyan-300 font-bold' : 'text-slate-400'}`}
                >
                  All
                </button>
                <button
                  onClick={() => setTypeFilter('doc')}
                  className={`px-2 py-0.5 rounded cursor-pointer ${typeFilter === 'doc' ? 'bg-cyan-950 text-cyan-300 font-bold' : 'text-slate-400'}`}
                >
                  Docs
                </button>
                <button
                  onClick={() => setTypeFilter('sheet')}
                  className={`px-2 py-0.5 rounded cursor-pointer ${typeFilter === 'sheet' ? 'bg-cyan-950 text-cyan-300 font-bold' : 'text-slate-400'}`}
                >
                  Sheets
                </button>
                <button
                  onClick={() => setTypeFilter('text')}
                  className={`px-2 py-0.5 rounded cursor-pointer ${typeFilter === 'text' ? 'bg-cyan-950 text-cyan-300 font-bold' : 'text-slate-400'}`}
                >
                  Text
                </button>
              </div>

              <button
                onClick={() => handleSelectAll(true)}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 px-2 py-1 rounded hover:bg-slate-800 cursor-pointer"
              >
                Select All
              </button>
              <button
                onClick={() => handleSelectAll(false)}
                className="text-[11px] text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-slate-800 cursor-pointer"
              >
                Deselect
              </button>
            </div>
          </div>

          {discoveredFiles.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 space-y-2">
              <FolderOpen className="w-8 h-8 text-slate-600 mx-auto stroke-[1.5]" />
              <p>No files discovered yet. Select a local directory or inspect a remote SharePoint/Google Drive link above.</p>
            </div>
          ) : filteredList.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No files match your current search or type filter.
            </div>
          ) : (
            <div className="divide-y divide-slate-800/80 border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60 max-h-[350px] overflow-y-auto">
              {filteredList.map((item) => {
                const Icon = getFileIcon(item.name);
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleSelect(item.id)}
                    className={`flex items-center justify-between p-2.5 text-xs transition-colors cursor-pointer ${
                      item.selected
                        ? 'bg-cyan-950/20 hover:bg-cyan-950/40 text-slate-100'
                        : 'hover:bg-slate-900/50 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      {item.selected ? (
                        <CheckSquare className="w-4 h-4 text-cyan-400 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-600 shrink-0" />
                      )}

                      <Icon className="w-4 h-4 text-cyan-400 shrink-0" />

                      <div className="truncate">
                        <div className="font-semibold text-slate-200 truncate">{item.name}</div>
                        {item.path && item.path !== item.name && (
                          <div className="text-[10px] text-slate-500 font-mono truncate">{item.path}</div>
                        )}
                        {item.previewNotes && (
                          <div className="text-[10px] text-cyan-400/80 line-clamp-1">{item.previewNotes}</div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 ml-2">
                      <span className="text-[10px] font-mono text-slate-400">
                        {item.size > 0 ? formatBytes(item.size) : 'Reference'}
                      </span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                        {item.origin}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Files are parsed client-side and held in ephemeral React state only.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              onClick={handleConfirmIngest}
              disabled={selectedCount === 0 || isProcessingIngest}
              className={`flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer shadow-md ${
                selectedCount > 0 && !isProcessingIngest
                  ? 'bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 shadow-cyan-500/20'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              {isProcessingIngest ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              )}
              <span>Ingest Selected ({selectedCount}) Files</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
