import React, { useState } from 'react';
import { Calendar, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

interface TimelineField {
  id: string;
  label: string;
  defaultValue: string;
  hint: string;
}

interface TimelineVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (verifiedData: Record<string, string>) => void;
}

const TIMELINE_FIELDS: TimelineField[] = [
  { id: 'startDate', label: 'Project Start Date', defaultValue: new Date().toISOString().split('T')[0], hint: 'Formal mobilization and contract effective date' },
  { id: 'targetFinishDate', label: 'Target Completion Date', defaultValue: '', hint: 'Baseline finish date for all final deliverables' },
  { id: 'firstMilestoneDate', label: 'First Major Milestone Date', defaultValue: '', hint: 'Date for M1 / Architecture Sign-off' }
];

export const TimelineVerificationModal: React.FC<TimelineVerificationModalProps> = ({
  isOpen,
  onClose,
  onConfirm
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [verifiedData, setVerifiedData] = useState<Record<string, string>>({});
  const [currentValue, setCurrentValue] = useState(TIMELINE_FIELDS[0].defaultValue);

  if (!isOpen) return null;

  const currentField = TIMELINE_FIELDS[currentIndex];

  const handleNext = () => {
    const newData = { ...verifiedData, [currentField.id]: currentValue || 'TBC' };
    setVerifiedData(newData);

    if (currentIndex < TIMELINE_FIELDS.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setCurrentValue(TIMELINE_FIELDS[currentIndex + 1].defaultValue || '');
    } else {
      onConfirm(newData);
      reset();
    }
  };

  const reset = () => {
    setCurrentIndex(0);
    setVerifiedData({});
    setCurrentValue(TIMELINE_FIELDS[0].defaultValue);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0F172A] border border-cyan-500/30 rounded-2xl w-full max-w-md shadow-2xl shadow-cyan-950/20 overflow-hidden">
        {/* Progress Header */}
        <div className="bg-slate-900/50 px-6 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <span className="text-[10px] font-bold text-white uppercase tracking-wider">Verify Timeline ({currentIndex + 1}/{TIMELINE_FIELDS.length})</span>
          </div>
          <div className="flex gap-1">
            {TIMELINE_FIELDS.map((_, idx) => (
              <div 
                key={idx} 
                className={`w-6 h-1 rounded-full transition-colors ${idx <= currentIndex ? 'bg-cyan-500' : 'bg-slate-700'}`} 
              />
            ))}
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white tracking-tight">
              Verify {currentField.label}
            </h3>
            <p className="text-xs text-slate-400 italic">
              {currentField.hint}
            </p>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <input 
                type="date" 
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-all font-mono"
              />
            </div>

            <div className="flex items-center gap-2 p-3 bg-cyan-950/20 border border-cyan-500/20 rounded-lg">
              <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0" />
              <p className="text-[10px] text-cyan-200/80 leading-relaxed">
                Timeline verification ensures forensic alignment between your baselines and generated commitments.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button 
              onClick={() => { onClose(); reset(); }}
              className="flex-1 py-3 text-xs font-bold text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleNext}
              className="flex-[2] py-3 bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>{currentIndex === TIMELINE_FIELDS.length - 1 ? 'Verify & Generate' : 'Next Parameter'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
