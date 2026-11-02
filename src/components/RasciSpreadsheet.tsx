import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Plus, 
  Trash2, 
  Download, 
  Printer, 
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  Users
} from 'lucide-react';
import { ADVANNOTECH_STAKEHOLDERS, AdvannotechResource } from '../data/stakeholders';
import { exportRasciCsv } from '../utils/exportUtils';

interface RasciRow {
  id: string;
  task: string;
  responsible: string;
  accountable: string;
  supportive: string;
  consulted: string;
  informed: string;
}

interface RasciSpreadsheetProps {
  markdown: string;
  onChangeMarkdown: (newMd: string) => void;
  docCode: string;
  docTitle: string;
  projectName: string;
  date: string;
  onExportPdf: () => void;
}

export const RasciSpreadsheet: React.FC<RasciSpreadsheetProps> = ({
  markdown,
  onChangeMarkdown,
  docCode,
  docTitle,
  projectName,
  date,
  onExportPdf
}) => {
  const [rows, setRows] = useState<RasciRow[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Parse markdown table to rows on mount
  useEffect(() => {
    const lines = markdown.split('\n');
    const tableStartIndex = lines.findIndex(l => l.includes('| Task / Deliverable |') || l.includes('| Task |'));
    
    if (tableStartIndex !== -1) {
      const dataLines = lines.slice(tableStartIndex + 2).filter(l => l.trim().startsWith('|'));
      const parsedRows = dataLines.map((line, idx) => {
        const parts = line.split('|').map(p => p.trim());
        return {
          id: `row-${idx}`,
          task: parts[1] || '',
          responsible: parts[2] || '',
          accountable: parts[3] || '',
          supportive: parts[4] || '',
          consulted: parts[5] || '',
          informed: parts[6] || ''
        };
      });
      if (parsedRows.length > 0) {
        setRows(parsedRows);
      } else {
        // Default rows if table is empty
        setRows([
          { id: '1', task: 'Project Kick-off', responsible: 'Lunga Myeza', accountable: 'Sarel van Deventer', supportive: 'Valiant Khoza', consulted: 'Xolani Zuma', informed: '[Client PM Name]' },
          { id: '2', task: 'Technical Design Specification', responsible: 'Valiant Khoza', accountable: 'Steffen Engelbrecht', supportive: 'Lucky Hlungwani', consulted: 'Andrew Kotamo', informed: 'Sarel van Deventer' },
        ]);
      }
    } else {
      // Default initial state
      setRows([
        { id: '1', task: 'Project Authorization', responsible: 'Sarel van Deventer', accountable: 'Xolani Zuma', supportive: 'Lando Zuma', consulted: '[Client Sponsor]', informed: 'Lunga Myeza' },
        { id: '2', task: 'Requirements Baselining', responsible: 'Lunga Myeza', accountable: 'Sarel van Deventer', supportive: 'Valiant Khoza', consulted: '[Client PM Name]', informed: 'Steffen Engelbrecht' },
        { id: '3', task: 'System Architecture Design', responsible: 'Valiant Khoza', accountable: 'Steffen Engelbrecht', supportive: 'Lucky Hlungwani', consulted: 'Andrew Kotamo', informed: 'Sarel van Deventer' },
      ]);
    }
  }, []);

  // Update markdown when rows change
  const syncToMarkdown = (updatedRows: RasciRow[]) => {
    setIsSyncing(true);
    let newMd = markdown;
    const lines = markdown.split('\n');
    const tableStartIndex = lines.findIndex(l => l.includes('| Task / Deliverable |') || l.includes('| Task |'));

    const tableHeader = `| Task / Deliverable | Responsible (R) | Accountable (A) | Supportive (S) | Consulted (C) | Informed (I) |\n| :--- | :--- | :--- | :--- | :--- | :--- |`;
    const tableBody = updatedRows.map(r => `| ${r.task} | ${r.responsible} | ${r.accountable} | ${r.supportive} | ${r.consulted} | ${r.informed} |`).join('\n');
    const fullTable = `${tableHeader}\n${tableBody}`;

    if (tableStartIndex !== -1) {
      // Find end of table
      let tableEndIndex = tableStartIndex + 2;
      while (tableEndIndex < lines.length && lines[tableEndIndex].trim().startsWith('|')) {
        tableEndIndex++;
      }
      
      const before = lines.slice(0, tableStartIndex).join('\n');
      const after = lines.slice(tableEndIndex).join('\n');
      newMd = `${before}\n${fullTable}\n${after}`;
    } else {
      newMd = `${markdown}\n\n### RASCI Responsibility Matrix\n\n${fullTable}\n`;
    }

    onChangeMarkdown(newMd);
    setTimeout(() => setIsSyncing(false), 500);
  };

  const handleAddRow = () => {
    const newRows = [...rows, { id: `row-${Date.now()}`, task: '', responsible: '', accountable: '', supportive: '', consulted: '', informed: '' }];
    setRows(newRows);
    syncToMarkdown(newRows);
  };

  const handleRemoveRow = (id: string) => {
    const newRows = rows.filter(r => r.id !== id);
    setRows(newRows);
    syncToMarkdown(newRows);
  };

  const handleCellChange = (id: string, field: keyof RasciRow, value: string) => {
    const newRows = rows.map(r => r.id === id ? { ...r, [field]: value } : r);
    setRows(newRows);
    syncToMarkdown(newRows);
  };

  const handleExportCsv = () => {
    exportRasciCsv(rows, docCode);
  };

  return (
    <div className="space-y-6">
      {/* Spreadsheet Header Toolbar */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-tight">Forensic RASCI Spreadsheet</h3>
            <p className="text-[10px] text-slate-500 font-mono">Live Sync: {isSyncing ? 'Writing to Canvas...' : 'Ready'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAddRow}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-bold transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onExportPdf}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 font-bold rounded-lg text-xs shadow-md transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Spreadsheet Interface */}
      <div className="bg-[#0B1528] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900 text-slate-400 font-mono uppercase text-[10px]">
                <th className="p-3 border-r border-slate-800 text-center w-10">#</th>
                <th className="p-3 border-r border-slate-800 text-left min-w-[250px]">Task / Deliverable</th>
                <th className="p-3 border-r border-slate-800 text-center">Resp (R)</th>
                <th className="p-3 border-r border-slate-800 text-center">Acc (A)</th>
                <th className="p-3 border-r border-slate-800 text-center">Supp (S)</th>
                <th className="p-3 border-r border-slate-800 text-center">Cons (C)</th>
                <th className="p-3 border-r border-slate-800 text-center">Inf (I)</th>
                <th className="p-3 text-center w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {rows.map((row, idx) => (
                <tr key={row.id} className="hover:bg-slate-900/50 transition-colors group">
                  <td className="p-3 border-r border-slate-800 text-center text-slate-600 font-mono">{idx + 1}</td>
                  <td className="p-1 border-r border-slate-800">
                    <input
                      type="text"
                      value={row.task}
                      onChange={(e) => handleCellChange(row.id, 'task', e.target.value)}
                      placeholder="Enter task name..."
                      className="w-full bg-transparent border-0 px-2 py-2 text-white focus:outline-none focus:bg-slate-800 rounded"
                    />
                  </td>
                  <td className="p-1 border-r border-slate-800">
                    <input
                      type="text"
                      value={row.responsible}
                      onChange={(e) => handleCellChange(row.id, 'responsible', e.target.value)}
                      className="w-full bg-transparent border-0 px-2 py-2 text-cyan-300 font-medium focus:outline-none focus:bg-slate-800 rounded text-center"
                    />
                  </td>
                  <td className="p-1 border-r border-slate-800">
                    <input
                      type="text"
                      value={row.accountable}
                      onChange={(e) => handleCellChange(row.id, 'accountable', e.target.value)}
                      className="w-full bg-transparent border-0 px-2 py-2 text-amber-300 font-bold focus:outline-none focus:bg-slate-800 rounded text-center"
                    />
                  </td>
                  <td className="p-1 border-r border-slate-800">
                    <input
                      type="text"
                      value={row.supportive}
                      onChange={(e) => handleCellChange(row.id, 'supportive', e.target.value)}
                      className="w-full bg-transparent border-0 px-2 py-2 text-slate-300 focus:outline-none focus:bg-slate-800 rounded text-center"
                    />
                  </td>
                  <td className="p-1 border-r border-slate-800">
                    <input
                      type="text"
                      value={row.consulted}
                      onChange={(e) => handleCellChange(row.id, 'consulted', e.target.value)}
                      className="w-full bg-transparent border-0 px-2 py-2 text-slate-400 focus:outline-none focus:bg-slate-800 rounded text-center"
                    />
                  </td>
                  <td className="p-1 border-r border-slate-800">
                    <input
                      type="text"
                      value={row.informed}
                      onChange={(e) => handleCellChange(row.id, 'informed', e.target.value)}
                      className="w-full bg-transparent border-0 px-2 py-2 text-slate-500 focus:outline-none focus:bg-slate-800 rounded text-center"
                    />
                  </td>
                  <td className="p-2 text-center">
                    <button
                      onClick={() => handleRemoveRow(row.id)}
                      className="p-1.5 text-slate-700 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {rows.length === 0 && (
          <div className="p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-600">
              <Table className="w-6 h-6" />
            </div>
            <div>
              <p className="text-slate-400 font-bold">RASCI Table is empty</p>
              <p className="text-xs text-slate-500">Add tasks manually or re-synthesize from source.</p>
            </div>
            <button
              onClick={handleAddRow}
              className="px-4 py-2 bg-cyan-600 text-white rounded-lg text-xs font-bold hover:bg-cyan-500 transition-all cursor-pointer"
            >
              Add First Task
            </button>
          </div>
        )}
      </div>

      {/* Spreadsheet Legend */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {[
          { label: 'R', full: 'Responsible', color: 'text-cyan-400', desc: 'Does the work' },
          { label: 'A', full: 'Accountable', color: 'text-amber-400', desc: 'Signs off (Must be 1 per task)' },
          { label: 'S', full: 'Supportive', color: 'text-slate-300', desc: 'Provides resources' },
          { label: 'C', full: 'Consulted', color: 'text-slate-400', desc: 'Two-way communication' },
          { label: 'I', full: 'Informed', color: 'text-slate-500', desc: 'One-way communication' },
        ].map(item => (
          <div key={item.label} className="bg-slate-900/50 border border-slate-800 p-3 rounded-xl flex items-center gap-3">
            <div className={`text-lg font-black ${item.color} w-6`}>{item.label}</div>
            <div>
              <div className="text-[10px] font-bold text-white uppercase tracking-tight">{item.full}</div>
              <div className="text-[9px] text-slate-500 leading-tight">{item.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
