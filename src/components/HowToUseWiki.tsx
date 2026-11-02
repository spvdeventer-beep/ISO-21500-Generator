import React from 'react';
import { 
  X, 
  BookOpen, 
  HelpCircle, 
  MousePointer2, 
  FileText, 
  Upload, 
  ShieldCheck, 
  Sparkles,
  Download,
  AlertTriangle,
  History,
  Layout,
  ExternalLink
} from 'lucide-react';

interface HowToUseWikiProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToUseWiki: React.FC<HowToUseWikiProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-[#0B1528]/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-4xl max-h-[85vh] bg-[#0F172A] border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-[#131C31]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-tight">Platform Wiki & Guide</h2>
              <p className="text-xs text-slate-400 mt-0.5">Advannotech Project Forensic & Forensic Governance Engine v1.0</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Core Workflow Section */}
            <section className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                  <MousePointer2 className="w-4 h-4" />
                  Core 5-Step Workflow
                </h3>
                <div className="space-y-4">
                  <div className="bg-slate-900/50 border border-slate-800 p-3 rounded-xl space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-white">
                      <span className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center text-[10px]">1</span>
                      Select Document
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed pl-7">
                      Choose from the PMI/ISO catalogue. Customize the mandatory sections and information fields you want to include in your draft.
                    </p>
                  </div>
                  
                  <div className="bg-slate-900/50 border border-slate-800 p-3 rounded-xl space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-white">
                      <span className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center text-[10px]">2</span>
                      Ingest Sources
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed pl-7">
                      Upload your project artifacts (PDF, DOCX, TXT) or paste raw notes. The engine uses this evidence to ground the synthesis without hallucination.
                    </p>
                  </div>

                  <div className="bg-slate-900/50 border border-slate-800 p-3 rounded-xl space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-white">
                      <span className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center text-[10px]">3</span>
                      Gap Analysis
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed pl-7">
                      Review identified, missing, and uncertain data points. Answer clarification questions to bridge gaps before generation.
                    </p>
                  </div>

                  <div className="bg-slate-900/50 border border-slate-800 p-3 rounded-xl space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-white">
                      <span className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center text-[10px]">4</span>
                      Synthesize
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed pl-7">
                      The AI engine generates a professional, PMBOK-aligned draft. Forensic evidence is highlighted in the "Provenance" tab.
                    </p>
                  </div>

                  <div className="bg-slate-900/50 border border-slate-800 p-3 rounded-xl space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-white">
                      <span className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center text-[10px]">5</span>
                      Audit & Refine
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed pl-7">
                      Perform a RAG (Red-Amber-Green) compliance check. Use the "Improvement Engine" to automatically fix gaps and export to PDF/Word.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                  <ShieldCheck className="w-4 h-4" />
                  Forensic Integrity
                </h3>
                <p className="text-[11px] text-slate-400 leading-relaxed italic border-l-2 border-emerald-500/40 pl-4 py-1">
                  Advannotech employs a "Zero-Hallucination" policy. Every fact, figure, and date generated is cross-referenced with your uploaded source documents to ensure audit-proof governance.
                </p>
              </div>
            </section>

            {/* Specialized Features Section */}
            <section className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-sky-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4" />
                  Advanced Features
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 text-[11px] font-black text-white uppercase tracking-tighter">
                      <Layout className="w-3.5 h-3.5 text-sky-400" />
                      ISO Folder Structure
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Download a standard ISO 21500 directory taxonomy. Each folder comes pre-loaded with a <code className="text-sky-300">REQUIRED_DOCUMENTS.txt</code> manifest.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 text-[11px] font-black text-white uppercase tracking-tighter">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                      Risk & Stakeholder Heatmaps
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Visualize project exposure using 5x5 Probability/Impact matrices and Power/Interest grids derived from your documentation.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 text-[11px] font-black text-white uppercase tracking-tighter">
                      <History className="w-3.5 h-3.5 text-amber-400" />
                      Snapshot Version Control
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Create point-in-time snapshots of your document drafts. Restore previous versions if refinement goes off-track.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 text-[11px] font-black text-white uppercase tracking-tighter">
                      <Download className="w-3.5 h-3.5 text-emerald-400" />
                      Templates & Export
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Download example Word/Excel templates to populate offline, or export your final synthesized document to formal PDF with custom corporate branding.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-cyan-950/20 border border-cyan-500/20 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
                  <HelpCircle className="w-4 h-4" />
                  Quick Tips
                </div>
                <ul className="space-y-2 text-[10px] text-slate-400 list-disc pl-4">
                  <li>Use the <strong>"Refine"</strong> bar in Step 5 to ask for specific wording changes (e.g., "Make the tone more legal").</li>
                  <li>Click <strong>"Apply Fix"</strong> in the Improvement Engine to automatically resolve compliance gaps.</li>
                  <li>Toggle <strong>"Monochrome"</strong> in the export settings for high-contrast minimalist printouts.</li>
                </ul>
              </div>

              <div className="pt-2">
                <button 
                  onClick={() => window.open('https://www.iso.org/standard/74740.html', '_blank')}
                  className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 hover:text-white transition-colors cursor-pointer uppercase tracking-widest"
                >
                  Learn more about ISO 21500
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#131C31] border-t border-slate-800 flex items-center justify-between">
          <div className="text-[10px] text-slate-500 font-mono">
            ADVANNOTECH_SYSTEM_DOCS_V1.0.4
          </div>
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black rounded-lg transition-all shadow-md shadow-cyan-500/20 uppercase tracking-tighter"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
