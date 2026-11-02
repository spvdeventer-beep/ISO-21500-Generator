import React, { useState, useMemo } from 'react';
import {
  Folder,
  FolderOpen,
  FileText,
  Download,
  Copy,
  Check,
  X,
  Search,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Layers,
  ShieldCheck,
  BookOpen,
  Info,
  CheckCircle2,
  FolderTree,
  Sparkles,
  FileDown
} from 'lucide-react';
import {
  ISO_21500_FOLDER_STRUCTURE,
  IsoFolderNode,
  IsoDocumentItem,
  generateRequiredDocumentsText,
  generateMasterIsoReadme,
  getAllIsoFolderNodes,
  getTotalIsoDocumentsCount
} from '../data/iso21500Structure';
import { downloadIso21500Zip, downloadSingleFolderManifest } from '../utils/isoZipExporter';

interface IsoFolderStructureModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName?: string;
}

export const IsoFolderStructureModal: React.FC<IsoFolderStructureModalProps> = ({
  isOpen,
  onClose,
  projectName = 'Enterprise Project'
}) => {
  const [selectedFolderPath, setSelectedFolderPath] = useState<string>(
    ISO_21500_FOLDER_STRUCTURE[0].path
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [viewMode, setViewMode] = useState<'formatted' | 'raw_text'>('formatted');
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    '00_Pre_Initiation_Sales_and_Client': true,
    '01_Project_Governance_and_Framework': true,
    '02_Initiating': true,
    '03_Planning': true,
    '04_Executing': false,
    '05_Controlling_and_Monitoring': false,
    '06_Closing': false
  });

  const allNodes = useMemo(() => getAllIsoFolderNodes(), []);
  const totalDocsCount = useMemo(() => getTotalIsoDocumentsCount(), []);

  const selectedFolder = useMemo(() => {
    return allNodes.find((n) => n.path === selectedFolderPath) || allNodes[0];
  }, [allNodes, selectedFolderPath]);

  const rawManifestText = useMemo(() => {
    if (!selectedFolder) return '';
    return generateRequiredDocumentsText(selectedFolder);
  }, [selectedFolder]);

  if (!isOpen) return null;

  const toggleExpand = (path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedFolders((prev) => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  const handleDownloadZip = async () => {
    setIsDownloadingZip(true);
    try {
      await downloadIso21500Zip(projectName);
    } catch (err) {
      console.error('Error generating zip:', err);
    } finally {
      setIsDownloadingZip(false);
    }
  };

  const handleCopyAsciiTree = () => {
    const text = generateMasterIsoReadme();
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  const handleCopyManifest = () => {
    navigator.clipboard.writeText(rawManifestText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  // Filtered nodes if searching
  const matchingDocList = searchQuery.trim()
    ? allNodes.flatMap((folder) =>
        folder.documents
          .filter(
            (d) =>
              d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              d.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
              d.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
              folder.folderName.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map((doc) => ({ doc, folder }))
      )
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-hidden">
      <div className="relative w-full max-w-6xl h-[90vh] bg-[#0A1220] border border-cyan-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-200">
        
        {/* HEADER BAR */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#0C1B33] via-[#0F2342] to-[#0C1B33] border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0 shadow-inner">
              <FolderTree className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base md:text-lg font-black tracking-tight text-white uppercase font-sans">
                  ISO 21500 Standard Folder Structure
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-bold text-cyan-300 bg-cyan-950/80 border border-cyan-500/40 rounded-full font-mono">
                  ISO 21500 / 21502:2020
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-500/30 rounded-full">
                  Audit Ready
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Standardized governance hierarchy with pre-configured <span className="font-mono text-cyan-300 font-semibold">REQUIRED_DOCUMENTS.txt</span> in each directory.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Download Complete ZIP button */}
            <button
              onClick={handleDownloadZip}
              disabled={isDownloadingZip}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 active:scale-95 rounded-lg transition-all shadow-md cursor-pointer disabled:opacity-50"
              title="Download entire directory hierarchy with REQUIRED_DOCUMENTS.txt inside each folder"
            >
              <Download className={`w-4 h-4 ${isDownloadingZip ? 'animate-bounce' : ''}`} />
              <span>{isDownloadingZip ? 'Archiving...' : 'Download ISO Folders (.zip)'}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* SEARCH & QUICK ACTION BAR */}
        <div className="px-6 py-2.5 bg-[#090F1C] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs">
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search folders or required documents..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-900/90 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-slate-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* View Mode Toggle */}
            <div className="flex items-center rounded-lg bg-slate-900 border border-slate-700 p-0.5">
              <button
                onClick={() => setViewMode('formatted')}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all cursor-pointer ${
                  viewMode === 'formatted'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Interactive View
              </button>
              <button
                onClick={() => setViewMode('raw_text')}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all cursor-pointer ${
                  viewMode === 'raw_text'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                REQUIRED_DOCUMENTS.txt
              </button>
            </div>

            {/* Copy Structure / Readme button */}
            <button
              onClick={handleCopyAsciiTree}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
              title="Copy complete directory index & documentation to clipboard"
            >
              {copiedText ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300 font-semibold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy Directory Readme</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* MAIN BODY: 2 PANE EXPLORER */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          
          {/* PANE 1: DIRECTORY HIERARCHY TREE */}
          <div className="w-full md:w-80 lg:w-96 border-b md:border-b-0 md:border-r border-slate-800 bg-[#070D18] flex flex-col shrink-0 overflow-hidden">
            <div className="p-3 border-b border-slate-800/80 bg-slate-900/40 flex items-center justify-between text-xs font-semibold text-slate-400">
              <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <Folder className="w-3.5 h-3.5 text-cyan-400" />
                Folder Hierarchy
              </span>
              <span className="text-[10px] text-cyan-400 font-mono">
                {allNodes.length} Folders | {totalDocsCount} Docs
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-2.5 space-y-1">
              {matchingDocList ? (
                // Search result listing
                <div className="space-y-1.5">
                  <div className="text-[11px] text-slate-400 px-2 py-1">
                    Matching documents ({matchingDocList.length}):
                  </div>
                  {matchingDocList.map(({ doc, folder }) => (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedFolderPath(folder.path)}
                      className={`p-2 rounded-lg border text-left cursor-pointer transition-all ${
                        selectedFolderPath === folder.path
                          ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-200'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 text-[11px] font-bold text-white">
                        <span>{doc.name}</span>
                        <span className="font-mono text-[9px] text-cyan-400">{doc.id}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                        <Folder className="w-3 h-3 text-cyan-400 shrink-0" />
                        <span className="truncate">/{folder.path}</span>
                      </div>
                    </div>
                  ))}
                  {matchingDocList.length === 0 && (
                    <div className="p-6 text-center text-xs text-slate-500">
                      No matching documents found.
                    </div>
                  )}
                </div>
              ) : (
                // Standard Tree Hierarchy
                ISO_21500_FOLDER_STRUCTURE.map((rootNode) => {
                  const isSelected = selectedFolderPath === rootNode.path;
                  const isExpanded = !!expandedFolders[rootNode.path];
                  const hasSubfolders = !!(rootNode.subfolders && rootNode.subfolders.length > 0);
                  const isSubfolderActive = rootNode.subfolders?.some((sub) => sub.path === selectedFolderPath);

                  return (
                    <div key={rootNode.path} className="space-y-0.5">
                      {/* Root Phase Folder Item */}
                      <div
                        onClick={() => setSelectedFolderPath(rootNode.path)}
                        className={`group flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition-all border ${
                          isSelected
                            ? 'bg-cyan-950/70 border-cyan-500/60 text-cyan-100 shadow-xs'
                            : isSubfolderActive
                            ? 'bg-slate-900/80 border-slate-700/60 text-white'
                            : 'bg-slate-900/30 border-transparent hover:bg-slate-800/40 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {hasSubfolders ? (
                            <button
                              onClick={(e) => toggleExpand(rootNode.path, e)}
                              className="p-0.5 text-slate-400 hover:text-white rounded"
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />
                              ) : (
                                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                              )}
                            </button>
                          ) : (
                            <span className="w-4 shrink-0" />
                          )}

                          {isSelected ? (
                            <FolderOpen className="w-4 h-4 text-cyan-400 shrink-0" />
                          ) : (
                            <Folder className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 shrink-0" />
                          )}

                          <span className="font-semibold truncate">{rootNode.folderName}</span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 ml-1">
                          <span className="px-1.5 py-0.2 text-[9px] font-mono rounded bg-slate-950 text-slate-400 border border-slate-800">
                            {rootNode.documents.length} docs
                          </span>
                        </div>
                      </div>

                      {/* Subfolders for Planning or others */}
                      {hasSubfolders && isExpanded && (
                        <div className="pl-6 space-y-0.5 border-l border-slate-800/80 ml-4 py-1">
                          {rootNode.subfolders!.map((subNode) => {
                            const isSubSelected = selectedFolderPath === subNode.path;

                            return (
                              <div
                                key={subNode.path}
                                onClick={() => setSelectedFolderPath(subNode.path)}
                                className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs cursor-pointer transition-all border ${
                                  isSubSelected
                                    ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-200 shadow-xs font-semibold'
                                    : 'border-transparent hover:bg-slate-800/50 text-slate-400 hover:text-slate-200'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  {isSubSelected ? (
                                    <FolderOpen className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                                  ) : (
                                    <Folder className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                  )}
                                  <span className="truncate">{subNode.folderName}</span>
                                </div>

                                <span className="text-[9px] font-mono text-slate-400 shrink-0 ml-1">
                                  {subNode.documents.length}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Quick Helper Info */}
            <div className="p-3 bg-slate-950/70 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2">
              <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                Every directory in this hierarchy contains its own <strong className="text-slate-200">REQUIRED_DOCUMENTS.txt</strong> manifest for audit compliance.
              </span>
            </div>
          </div>

          {/* PANE 2: SELECTED FOLDER DETAILS & MANIFEST PREVIEW */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#0A1220]">
            
            {/* Folder Header Bar */}
            <div className="p-4 bg-slate-900/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider text-cyan-400 bg-cyan-950/80 border border-cyan-500/40 rounded">
                    {selectedFolder.phase} Phase
                  </span>
                  <span className="font-mono text-xs text-slate-400">/{selectedFolder.path}</span>
                </div>
                <h3 className="text-base font-bold text-white mt-1 flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-cyan-400" />
                  <span>{selectedFolder.folderName}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 max-w-2xl">
                  {selectedFolder.description}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Download this folder's REQUIRED_DOCUMENTS.txt */}
                <button
                  onClick={() => downloadSingleFolderManifest(selectedFolder)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/70 border border-cyan-500/40 text-cyan-300 text-xs font-semibold transition-all cursor-pointer"
                  title="Download REQUIRED_DOCUMENTS.txt for this specific folder"
                >
                  <FileDown className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Download Manifest (.txt)</span>
                </button>
              </div>
            </div>

            {/* FOLDER CONTENT VIEW */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              {viewMode === 'formatted' ? (
                <div className="space-y-4 max-w-4xl">
                  {/* Summary Metric Strip */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold">
                        {selectedFolder.documents.length}
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Required Documents</div>
                        <div className="text-xs font-semibold text-white">Stage Gate Deliverables</div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Audit Standard</div>
                        <div className="text-xs font-semibold text-emerald-300">ISO 21500 / 21502 Compliant</div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">File Manifest</div>
                        <div className="text-xs font-semibold text-white font-mono">REQUIRED_DOCUMENTS.txt</div>
                      </div>
                    </div>
                  </div>

                  {/* Documents List */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-cyan-400" />
                        <span>Required Document Manifest for this Folder</span>
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {selectedFolder.documents.filter(d => d.mandatory).length} Mandatory for Stage Gate
                      </span>
                    </div>

                    {selectedFolder.documents.length === 0 ? (
                      <div className="p-8 text-center rounded-xl bg-slate-900/40 border border-slate-800 text-slate-400 text-xs">
                        This folder serves as an organizing directory for subfolders. Explore the subfolders in the left tree.
                      </div>
                    ) : (
                      selectedFolder.documents.map((doc, idx) => (
                        <div
                          key={doc.id}
                          className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/90 hover:border-slate-700 transition-all space-y-2.5"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="flex items-start gap-2.5">
                              <span className="w-6 h-6 rounded-md bg-slate-800 text-cyan-400 text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                                {idx + 1}
                              </span>
                              <div>
                                <h5 className="text-sm font-bold text-white flex items-center gap-2">
                                  <span>{doc.name}</span>
                                </h5>
                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700 font-bold">
                                    {doc.id}
                                  </span>
                                  <span className="text-[10px] text-slate-400">
                                    {doc.isoClause}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {doc.mandatory ? (
                                <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded bg-rose-950/80 text-rose-300 border border-rose-500/40">
                                  Gate Audit Mandatory
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded bg-slate-800 text-slate-400 border border-slate-700">
                                  Recommended
                                </span>
                              )}
                            </div>
                          </div>

                          <p className="text-xs text-slate-300 leading-relaxed pl-8">
                            {doc.description}
                          </p>

                          {/* Metadata row */}
                          <div className="pl-8 pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] border-t border-slate-800/60 text-slate-400">
                            <div>
                              <span className="text-slate-500">Responsible Role: </span>
                              <span className="text-slate-300 font-medium">{doc.responsibleRole}</span>
                            </div>
                            <div>
                              <span className="text-slate-500">Review Frequency: </span>
                              <span className="text-slate-300 font-medium">{doc.frequency}</span>
                            </div>
                          </div>

                          {/* Key sections checklist */}
                          <div className="pl-8 pt-1">
                            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                              Required Content Sections:
                            </span>
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                              {doc.keySections.map((sec, sIdx) => (
                                <span
                                  key={sIdx}
                                  className="text-[10px] px-2 py-0.5 rounded bg-slate-950/80 border border-slate-800 text-slate-300 flex items-center gap-1"
                                >
                                  <Check className="w-2.5 h-2.5 text-cyan-400" />
                                  <span>{sec}</span>
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                // Raw Text Preview of REQUIRED_DOCUMENTS.txt
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-slate-400 flex items-center gap-1.5 font-mono">
                      <FileText className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{selectedFolder.path}/REQUIRED_DOCUMENTS.txt</span>
                    </div>

                    <button
                      onClick={handleCopyManifest}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      {copiedText ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          <span>Copy Text</span>
                        </>
                      )}
                    </button>
                  </div>

                  <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-200/90 whitespace-pre-wrap leading-relaxed overflow-x-auto selection:bg-cyan-900 selection:text-white">
                    {rawManifestText}
                  </pre>
                </div>
              )}
            </div>

            {/* Footer Summary / Quick Action */}
            <div className="p-3.5 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
              <div className="flex items-center gap-3 text-slate-400">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Advannotech Corporate Governance Standard</span>
                </span>
                <span className="hidden md:inline text-slate-600">|</span>
                <span className="hidden md:inline">A4 Standard Cover Pages & Stage Gate Verifications</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadZip}
                  disabled={isDownloadingZip}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-all cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isDownloadingZip ? 'Packaging Zip...' : 'Download Full Structure (.zip)'}</span>
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
