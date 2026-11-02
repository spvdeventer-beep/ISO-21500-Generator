import { ShieldAlert, AlertTriangle, ArrowRight, X } from 'lucide-react';
import { PMStandard } from '../data/documents';

interface AuditWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedStandard: PMStandard;
}

export const AuditWarningModal: React.FC<AuditWarningModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  selectedStandard
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0F172A] border border-rose-500/40 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl shadow-rose-950/40 transition-all scale-in-95">
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white tracking-tight">Insufficient Source Material</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              You haven't uploaded any documents or provided enough context for a high-integrity forensic synthesis.
            </p>
          </div>

          <div className="bg-rose-950/30 border border-rose-500/20 rounded-xl p-4 flex gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-200 leading-relaxed">
              <strong className="block text-rose-300 font-bold mb-1 uppercase tracking-wider">Audit Warning:</strong>
              If you proceed, the generated document will rely heavily on general Advannotech standards and will likely <strong>fail a formal {selectedStandard} audit review</strong> due to lack of project-specific evidence.
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-all cursor-pointer"
            >
              Go Back & Upload
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2.5 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition-all shadow-lg shadow-rose-600/20 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Proceed Anyway</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
