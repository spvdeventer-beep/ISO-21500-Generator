import React from 'react';
import { X, Users, LayoutGrid, Info, Sparkles } from 'lucide-react';
import { StakeholderImpactMatrix } from './StakeholderImpactMatrix';
import { MatrixStakeholder } from '../data/projectRegisters';

interface StakeholderImpactModalProps {
  isOpen: boolean;
  onClose: () => void;
  stakeholders: MatrixStakeholder[];
  onUpdateStakeholders: (stakeholders: MatrixStakeholder[]) => void;
  projectName?: string;
}

export const StakeholderImpactModal: React.FC<StakeholderImpactModalProps> = ({
  isOpen,
  onClose,
  stakeholders,
  onUpdateStakeholders,
  projectName
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0F172A] border border-cyan-500/30 rounded-2xl shadow-2xl max-w-7xl w-full max-h-[95vh] flex flex-col overflow-hidden text-slate-200">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0B1528] border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-950/70 border border-cyan-500/30 text-cyan-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Stakeholder Impact & Influence Matrix
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-bold text-cyan-300 bg-cyan-950 border border-cyan-500/30 rounded">
                  ISO 21500 / PMBOK 7th
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Interactive Power/Interest grid for strategic stakeholder governance and engagement planning.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              <span>Drag nodes to update Power & Interest levels</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Matrix Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#091120]">
           <div className="max-w-6xl mx-auto">
             <StakeholderImpactMatrix 
               stakeholders={stakeholders}
               onUpdateStakeholders={onUpdateStakeholders}
               projectName={projectName}
             />
           </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#0B1528] border-t border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
            <Sparkles className="w-3 h-3 text-cyan-500" />
            <span>Advannotech Governance Framework · v1.4</span>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};
