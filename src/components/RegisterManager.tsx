import React, { useRef } from 'react';
import { 
  Download, 
  Upload, 
  FileSpreadsheet, 
  AlertCircle, 
  CheckCircle2, 
  Database,
  RefreshCw
} from 'lucide-react';
import { 
  MatrixStakeholder, 
  ProjectRisk, 
  ProjectAssumption,
  deduplicateRegister,
  computeQuadrant
} from '../data/projectRegisters';
import { downloadBlob } from '../utils/exportUtils';
import { computeRiskScore } from '../utils/riskData';

interface RegisterManagerProps {
  stakeholders: MatrixStakeholder[];
  onUpdateStakeholders: (data: MatrixStakeholder[]) => void;
  risks: ProjectRisk[];
  onUpdateRisks: (data: ProjectRisk[]) => void;
  assumptions: ProjectAssumption[];
  onUpdateAssumptions: (data: ProjectAssumption[]) => void;
}

export const RegisterManager: React.FC<RegisterManagerProps> = ({
  stakeholders,
  onUpdateStakeholders,
  risks,
  onUpdateRisks,
  assumptions,
  onUpdateAssumptions
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentUploadType, setCurrentUploadType] = React.useState<'stakeholders' | 'risks' | 'assumptions' | null>(null);

  // --- DOWNLOAD HANDLERS ---
  const downloadStakeholders = () => {
    const headers = ['ID', 'Name', 'Title', 'Department', 'Email', 'Phone', 'Location', 'Power', 'Interest', 'RACI', 'Quadrant', 'Key Expectation', 'Engagement Channel'];
    const rows = stakeholders.map(s => [
      s.id, s.name, s.title, s.department, s.email, s.phone, s.location, s.power, s.interest, s.raci, s.quadrant, s.keyExpectation, s.engagementChannel
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n');
    downloadBlob(csv, `Project_Stakeholder_Register_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
  };

  const downloadRisks = () => {
    const headers = ['ID', 'Title', 'Category', 'Probability', 'Impact', 'Score', 'Level', 'RAG', 'Owner', 'Source', 'Mitigation', 'Contingency', 'Status'];
    const rows = risks.map(r => [
      r.id, r.title, r.category, r.probability, r.impact, r.score, r.level, r.ragStatus, r.owner, r.sourceOrigin, r.mitigationStrategy, r.contingencyPlan, r.status
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n');
    downloadBlob(csv, `Project_Risk_Register_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
  };

  const downloadAssumptions = () => {
    const headers = ['ID', 'Description', 'Category', 'Impact If Invalid', 'Validation Owner', 'Status', 'Source'];
    const rows = assumptions.map(a => [
      a.id, a.description, a.category, a.impactIfInvalid, a.validationOwner, a.status, a.sourceOrigin
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n');
    downloadBlob(csv, `Project_Assumptions_Log_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
  };

  // --- UPLOAD HANDLER ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUploadType) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter(l => l.trim());
      const data = lines.slice(1).map(line => {
        // Simple CSV parser for quoted values
        const cells = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
        return cells.map(c => c.replace(/^"|"$/g, '').replace(/""/g, '"'));
      });

      if (currentUploadType === 'stakeholders') {
        const incoming: MatrixStakeholder[] = data.map(c => ({
          id: c[0] || `UP-STK-${Date.now()}`,
          name: c[1] || 'Unknown',
          title: c[2] || '',
          department: c[3] || '',
          email: c[4] || '',
          phone: c[5] || '',
          location: c[6] || '',
          power: Number(c[7]) || 50,
          interest: Number(c[8]) || 50,
          raci: (c[9] as any) || 'Informed',
          quadrant: computeQuadrant(Number(c[7]) || 50, Number(c[8]) || 50),
          keyExpectation: c[11] || '',
          engagementChannel: c[12] || ''
        }));
        onUpdateStakeholders(deduplicateRegister(stakeholders, incoming, 'name'));
      } else if (currentUploadType === 'risks') {
        const incoming: ProjectRisk[] = data.map(c => {
          const prob = Number(c[3]) || 3;
          const imp = Number(c[4]) || 3;
          const { score, level, ragStatus } = computeRiskScore(prob, imp);
          return {
            id: c[0] || `UP-RSK-${Date.now()}`,
            title: c[1] || 'Unknown Risk',
            category: (c[2] as any) || 'Technical',
            probability: prob,
            impact: imp,
            score,
            level,
            ragStatus,
            owner: c[8] || '',
            sourceOrigin: c[9] || 'Uploaded',
            mitigationStrategy: c[10] || '',
            contingencyPlan: c[11] || '',
            status: (c[12] as any) || 'Identified'
          };
        });
        onUpdateRisks(deduplicateRegister(risks, incoming, 'title'));
      } else if (currentUploadType === 'assumptions') {
        const incoming: ProjectAssumption[] = data.map(c => ({
          id: c[0] || `UP-ASM-${Date.now()}`,
          description: c[1] || 'Unknown Assumption',
          category: (c[2] as any) || 'Operational',
          impactIfInvalid: (c[3] as any) || 'Medium',
          validationOwner: c[4] || '',
          status: (c[5] as any) || 'Draft',
          sourceOrigin: c[6] || 'Uploaded'
        }));
        onUpdateAssumptions(deduplicateRegister(assumptions, incoming, 'description'));
      }

      // Reset
      if (fileInputRef.current) fileInputRef.current.value = '';
      setCurrentUploadType(null);
    };
    reader.readAsText(file);
  };

  return (
    <div className="bg-[#0B1528] border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white uppercase tracking-tight">Project Registry Management</h3>
            <p className="text-[11px] text-slate-400 mt-0.5 font-medium italic">Forensic data sync for PMBOK 7th edition governance logs</p>
          </div>
        </div>
        <div className="text-[10px] text-slate-500 font-mono bg-slate-900 px-2 py-1 rounded border border-slate-800">
          ISO 21500 Compliant
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Stakeholders card */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4 hover:border-cyan-500/40 transition-all group">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              Stakeholders
            </h4>
            <span className="text-[10px] font-mono font-bold text-cyan-300 bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-800/40">
              {stakeholders.length} items
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Manage your project's power/interest matrix and RACI assignments.
          </p>
          <div className="flex items-center gap-2">
            <button 
              onClick={downloadStakeholders}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
            >
              <Download className="w-3 h-3" />
              <span>Download CSV</span>
            </button>
            <button 
              onClick={() => { setCurrentUploadType('stakeholders'); fileInputRef.current?.click(); }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
            >
              <Upload className="w-3 h-3" />
              <span>Upload CSV</span>
            </button>
          </div>
        </div>

        {/* Risk Register card */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4 hover:border-rose-500/40 transition-all group">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-rose-400" />
              Risk Register
            </h4>
            <span className="text-[10px] font-mono font-bold text-rose-300 bg-rose-950 px-1.5 py-0.5 rounded border border-rose-800/40">
              {risks.length} items
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Monitor threats and opportunities across technical and operational domains.
          </p>
          <div className="flex items-center gap-2">
            <button 
              onClick={downloadRisks}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
            >
              <Download className="w-3 h-3" />
              <span>Download CSV</span>
            </button>
            <button 
              onClick={() => { setCurrentUploadType('risks'); fileInputRef.current?.click(); }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-500/30 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
            >
              <Upload className="w-3 h-3" />
              <span>Upload CSV</span>
            </button>
          </div>
        </div>

        {/* Assumptions Log card */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4 hover:border-amber-500/40 transition-all group">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-amber-400" />
              Assumptions Log
            </h4>
            <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-950 px-1.5 py-0.5 rounded border border-amber-800/40">
              {assumptions.length} items
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Track and validate project invariants and resource assumptions.
          </p>
          <div className="flex items-center gap-2">
            <button 
              onClick={downloadAssumptions}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
            >
              <Download className="w-3 h-3" />
              <span>Download CSV</span>
            </button>
            <button 
              onClick={() => { setCurrentUploadType('assumptions'); fileInputRef.current?.click(); }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-500/30 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
            >
              <Upload className="w-3 h-3" />
              <span>Upload CSV</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl flex items-start gap-4">
        <div className="p-2 rounded-full bg-cyan-500/10">
          <AlertCircle className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="space-y-1">
          <h5 className="text-[11px] font-bold text-white uppercase tracking-tight">Sync & Deduplication Protocol</h5>
          <p className="text-[11px] text-slate-400 leading-relaxed font-medium italic">
            When uploading registers, our engine automatically detects and ignores redundant entries based on Name (Stakeholders), Title (Risks), or Description (Assumptions). 
            Merged data is immediately available for document synthesis and audit reporting.
          </p>
        </div>
      </div>

      <input 
        ref={fileInputRef}
        type="file" 
        accept=".csv" 
        className="hidden" 
        onChange={handleFileUpload}
      />
    </div>
  );
};
