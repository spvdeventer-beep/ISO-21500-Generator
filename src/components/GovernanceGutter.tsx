import React from 'react';
import { 
  FolderTree, 
  Sparkles, 
  Download, 
  Image as ImageIcon,
  FileText,
  FileSpreadsheet,
  X
} from 'lucide-react';
import { PMIDocumentDefinition } from '../data/documents';
import { exportExampleTemplate, exportExampleExcelTemplate } from '../utils/exportUtils';

interface GovernanceGutterProps {
  customLogo: string | null;
  onLogoChange: (logo: string | null) => void;
  uploadedTemplate: { name: string; text: string } | null;
  onTemplateChange: (template: { name: string; text: string } | null) => void;
  onOpenIsoFolders: () => void;
  selectedDoc: PMIDocumentDefinition | null;
}

export const GovernanceGutter: React.FC<GovernanceGutterProps> = ({
  customLogo,
  onLogoChange,
  uploadedTemplate,
  onTemplateChange,
  onOpenIsoFolders,
  selectedDoc
}) => {
  return (
    <div className="no-print w-20 bg-[#0F172A] border-r border-slate-800 flex flex-col items-center py-6 space-y-8 shrink-0 shadow-xl z-10">
      {/* 1. Corporate Identity */}
      <div className="flex flex-col items-center gap-2 group">
        <label className="relative w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center cursor-pointer hover:border-cyan-500/50 transition-all overflow-hidden group">
          {customLogo ? (
            <img src={customLogo} alt="Logo" className="w-full h-full object-contain p-1" />
          ) : (
            <ImageIcon className="w-5 h-5 text-slate-500 group-hover:text-cyan-400" />
          )}
          <input 
            type="file" 
            className="hidden" 
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => onLogoChange(reader.result as string);
                reader.readAsDataURL(file);
              }
            }}
          />
        </label>
        <div className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter text-center">Identity</div>
        
        {customLogo && (
          <button 
            onClick={() => onLogoChange(null)}
            className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-2.5 h-2.5" />
          </button>
        )}
      </div>

      <div className="w-8 h-px bg-slate-800" />

      {/* 2. ISO Folders */}
      <button
        onClick={onOpenIsoFolders}
        className="flex flex-col items-center gap-2 group cursor-pointer"
        title="ISO 21500 Standard Folders"
      >
        <div className="w-12 h-12 rounded-xl bg-cyan-950/30 border border-cyan-500/20 flex items-center justify-center group-hover:border-cyan-400 group-hover:bg-cyan-900/40 transition-all">
          <FolderTree className="w-6 h-6 text-cyan-400" />
        </div>
        <div className="text-[9px] font-bold text-cyan-500/80 uppercase tracking-tighter text-center">ISO Hierarchy</div>
      </button>

      <div className="w-8 h-px bg-slate-800" />

      {/* 3. Templates (Downloads) */}
      <div className="flex flex-col items-center gap-4">
        <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest vertical-text py-2">Templates</div>
        
        <button
          onClick={() => selectedDoc && exportExampleTemplate(selectedDoc, 'docx')}
          className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center hover:border-blue-400 hover:bg-blue-950/20 text-slate-400 hover:text-blue-400 transition-all cursor-pointer"
          title="Download Word Template"
          disabled={!selectedDoc}
        >
          <FileText className="w-5 h-5" />
        </button>

        <button
          onClick={() => selectedDoc && exportExampleExcelTemplate(selectedDoc)}
          className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center hover:border-emerald-400 hover:bg-emerald-950/20 text-slate-400 hover:text-emerald-400 transition-all cursor-pointer"
          title="Download CSV/Excel Field Template"
          disabled={!selectedDoc}
        >
          <FileSpreadsheet className="w-5 h-5" />
        </button>
      </div>

      <div className="w-8 h-px bg-slate-800" />

      {/* 4. Custom Upload */}
      <div className="flex flex-col items-center gap-2 group">
        <label className={`w-12 h-12 rounded-xl border flex items-center justify-center cursor-pointer transition-all ${uploadedTemplate ? 'bg-emerald-950/30 border-emerald-500/50' : 'bg-slate-900 border-slate-800 hover:border-emerald-500/40'}`}>
          <Sparkles className={`w-6 h-6 ${uploadedTemplate ? 'text-emerald-400 animate-pulse' : 'text-slate-500 group-hover:text-emerald-400'}`} />
          <input 
            type="file" 
            className="hidden" 
            accept=".md,.txt"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => onTemplateChange({ name: file.name, text: ev.target?.result as string });
                reader.readAsText(file);
              }
            }}
          />
        </label>
        <div className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter text-center">
          {uploadedTemplate ? 'Custom Active' : 'Custom Upload'}
        </div>
        
        {uploadedTemplate && (
          <button 
            onClick={() => onTemplateChange(null)}
            className="mt-1 text-[8px] font-bold text-rose-400 hover:underline cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      <div className="flex-1" />
      
      {/* Branding Foot */}
      <div className="pb-4 opacity-20 hover:opacity-50 transition-opacity">
        <div className="text-[8px] font-black text-white vertical-text tracking-[0.3em] uppercase">Advannotech</div>
      </div>
    </div>
  );
};
