import React, { useRef, useState } from 'react';
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Table,
  UserCheck,
  Download,
  Printer,
  ChevronDown,
  Sparkles,
  FileText,
  Clock,
  Eye,
  Edit2
} from 'lucide-react';
import { marked } from 'marked';
import { ADVANNOTECH_STAKEHOLDERS, AdvannotechResource } from '../data/stakeholders';

interface DocumentCanvasProps {
  markdown: string;
  onChangeMarkdown: (newMd: string) => void;
  docCode: string;
  docTitle: string;
  projectName: string;
  date: string;
  onExportWord: () => void;
  onExportPdf: () => void;
  isExportingWord?: boolean;
}

export const DocumentCanvas: React.FC<DocumentCanvasProps> = ({
  markdown,
  onChangeMarkdown,
  docCode,
  docTitle,
  projectName,
  date,
  onExportWord,
  onExportPdf,
  isExportingWord,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [viewMode, setViewMode] = useState<'canvas-edit' | 'canvas-preview'>('canvas-edit');
  const [showResourceDropdown, setShowResourceDropdown] = useState(false);

  // Stats
  const wordCount = markdown.trim() ? markdown.trim().split(/\s+/).length : 0;
  const charCount = markdown.length;
  const readTimeMin = Math.max(1, Math.ceil(wordCount / 200));

  // Insert markdown syntax at cursor position
  const insertSyntax = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = markdown.substring(start, end);

    const replacement = before + (selectedText || 'Text') + after;
    const newMarkdown = markdown.substring(0, start) + replacement + markdown.substring(end);
    onChangeMarkdown(newMarkdown);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + (selectedText ? selectedText.length : 4));
    }, 50);
  };

  // Insert specific Advannotech resource
  const handleInsertResource = (resource: AdvannotechResource) => {
    const block = `\n${resource.title}: ${resource.name} (${resource.governanceRole})\n*Email:* ${resource.email} | *Mobile:* ${resource.phone || 'N/A'} | *Location:* ${resource.location}\n`;
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newMarkdown = markdown.substring(0, start) + block + markdown.substring(end);
      onChangeMarkdown(newMarkdown);
    } else {
      onChangeMarkdown(markdown + block);
    }
    setShowResourceDropdown(false);
  };

  // Insert Approval Block template
  const insertApprovalBlock = () => {
    const block = `
### Formal Governance Approvals & Sign-Off

| Role | Name & Title | Signature | Date |
| :--- | :--- | :--- | :--- |
| Executive Sponsor | Xolani Zuma (CEO) | ____________________ | ${date} |
| Governance Authority | Sarel van Deventer (Head of Delivery & Projects) | ____________________ | ${date} |
| Financial Authority | Lando Zuma (CFO) | ____________________ | ${date} |
`;
    insertSyntax(block);
  };

  // Insert Table Template
  const insertTableTemplate = () => {
    const table = `
| Item Ref | Description | Accountable Owner | Target Due Date | Status |
| :--- | :--- | :--- | :--- | :--- |
| 1.01 | Specification deliverable | Sarel van Deventer | ${date} | In Progress |
| 1.02 | Quality verification review | Steffen Engelbrecht | ${date} | Pending |
`;
    insertSyntax(table);
  };

  const renderedHtml = marked.parse(markdown) as string;

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* Canvas Executive Toolbar */}
      <div className="no-print bg-[#0F172A] border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-md">
        {/* Left: View toggle & formatting controls */}
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setViewMode('canvas-edit')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'canvas-edit'
                  ? 'bg-cyan-950 text-cyan-200 border border-cyan-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Canvas Edit</span>
            </button>

            <button
              onClick={() => setViewMode('canvas-preview')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'canvas-preview'
                  ? 'bg-cyan-950 text-cyan-200 border border-cyan-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Formatted Canvas</span>
            </button>
          </div>

          <div className="h-4 w-[1px] bg-slate-800 mx-1" />

          {/* Formatting buttons */}
          <button
            onClick={() => insertSyntax('*', '*')}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
            title="Italic (*text*)"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => insertSyntax('\n## ')}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer font-bold text-xs"
            title="Heading 2"
          >
            <Heading2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => insertSyntax('\n### ')}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
            title="Heading 3"
          >
            <Heading3 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => insertSyntax('\n- ')}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
            title="Bullet list"
          >
            <List className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={insertTableTemplate}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
            title="Insert Governance Table"
          >
            <Table className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={insertApprovalBlock}
            className="flex items-center gap-1 px-2 py-1 text-xs text-sky-300 hover:bg-sky-950 rounded transition-colors border border-sky-500/30 cursor-pointer"
            title="Insert Formal Sign-Off Table"
          >
            <UserCheck className="w-3 h-3 text-sky-400" />
            <span>Sign-Off Block</span>
          </button>

          {/* Advannotech Stakeholder Resource Quick-Insert Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowResourceDropdown(!showResourceDropdown)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-cyan-300 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 rounded-lg transition-colors cursor-pointer"
            >
              <span>+ Insert Resource</span>
              <ChevronDown className="w-3 h-3 text-cyan-400" />
            </button>

            {showResourceDropdown && (
              <div className="absolute left-0 mt-2 w-72 bg-[#0F172A] border border-slate-700 rounded-xl shadow-2xl z-50 p-2 max-h-80 overflow-y-auto">
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 mb-1">
                  Advannotech Personnel Roster
                </div>
                {ADVANNOTECH_STAKEHOLDERS.map((res, i) => (
                  <button
                    key={i}
                    onClick={() => handleInsertResource(res)}
                    className="w-full text-left p-2 rounded-lg hover:bg-slate-800 text-xs transition-colors cursor-pointer space-y-0.5 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white group-hover:text-cyan-300">{res.name}</span>
                      <span className="text-[10px] text-cyan-400 font-mono">{res.location}</span>
                    </div>
                    <div className="text-[11px] text-slate-400">{res.title}</div>
                    <div className="text-[10px] text-slate-500 truncate">{res.email}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Direct Download Word / PDF buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onExportWord}
            disabled={isExportingWord}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-950 hover:bg-blue-900 text-blue-200 border border-blue-500/40 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs"
            title="Download formatted Microsoft Word document (.docx)"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>Download Word</span>
          </button>

          <button
            onClick={onExportPdf}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 font-bold rounded-lg text-xs shadow-md transition-all cursor-pointer"
            title="Download / Print multi-page A4 PDF document"
          >
            <Printer className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* Main Canvas Container (A4 Proportioned Canvas) */}
      <div className="bg-[#0B1528] rounded-2xl border border-slate-800 p-3 sm:p-6 shadow-2xl">
        <div className="max-w-4xl mx-auto bg-slate-900/90 border border-slate-700/60 rounded-xl p-6 sm:p-10 shadow-2xl relative min-h-[850px] transition-all">
          {/* Running Corporate Canvas Header */}
          <div className="border-b border-slate-800 pb-4 mb-6 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="font-extrabold text-white tracking-wider">ADVANNOTECH (PTY) LTD</span>
              <span className="text-slate-500">·</span>
              <span className="font-mono text-cyan-300 font-bold">{docCode}</span>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
              <span>{projectName || 'Enterprise Governance'}</span>
              <span>·</span>
              <span className="text-emerald-400 font-semibold">CONFIDENTIAL</span>
            </div>
          </div>

          {/* Canvas Mode Body */}
          {viewMode === 'canvas-edit' ? (
            <textarea
              ref={textareaRef}
              value={markdown}
              onChange={(e) => onChangeMarkdown(e.target.value)}
              className="w-full bg-transparent border-0 font-mono text-xs text-slate-100 leading-relaxed focus:outline-none resize-none min-h-[750px]"
              placeholder="Start drafting or editing your document here..."
            />
          ) : (
            <div
              className="prose-advannotech min-h-[750px]"
              dangerouslySetInnerHTML={{ __html: renderedHtml }}
            />
          )}

          {/* Running Corporate Canvas Footer */}
          <div className="border-t border-slate-800 pt-4 mt-8 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500 font-mono">
            <div>
              Classification: <strong className="text-slate-400">CONFIDENTIAL – PROPRIETARY</strong>
            </div>

            <div className="flex items-center gap-3">
              <span>{wordCount.toLocaleString()} words</span>
              <span>·</span>
              <span>{charCount.toLocaleString()} chars</span>
              <span>·</span>
              <span>~{readTimeMin} min read</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
