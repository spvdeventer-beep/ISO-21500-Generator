import React from 'react';
import { Check, FileText, UploadCloud, HelpCircle, Cpu, Download } from 'lucide-react';

export type StepNumber = 1 | 2 | 3 | 4 | 5;

interface StepperProps {
  currentStep: StepNumber;
  onStepClick: (step: StepNumber) => void;
  maxAvailableStep: StepNumber;
}

const STEPS = [
  { step: 1, label: 'Select Document', icon: FileText, desc: 'Pick from 24 PMI artifacts' },
  { step: 2, label: 'Source Material', icon: UploadCloud, desc: 'Upload files & paste notes' },
  { step: 3, label: 'Clarify Gaps', icon: HelpCircle, desc: 'Gap analysis & TBC choices' },
  { step: 4, label: 'Generate', icon: Cpu, desc: 'PMBOK 7th synthesis' },
  { step: 5, label: 'Review & Export', icon: Download, desc: 'Audit inspector & downloads' },
] as const;

export const Stepper: React.FC<StepperProps> = ({ currentStep, onStepClick, maxAvailableStep }) => {
  return (
    <div className="app-stepper w-full bg-[#0F172A] border-b border-slate-800 py-3 px-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {STEPS.map((item, idx) => {
          const isCompleted = currentStep > item.step;
          const isActive = currentStep === item.step;
          const isAccessible = item.step <= maxAvailableStep;
          const Icon = item.icon;

          return (
            <React.Fragment key={item.step}>
              {/* Step item */}
              <button
                disabled={!isAccessible}
                onClick={() => onStepClick(item.step as StepNumber)}
                className={`flex items-center gap-3 text-left transition-all ${
                  isAccessible ? 'cursor-pointer' : 'cursor-not-allowed opacity-45'
                }`}
              >
                {/* Step Circle */}
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs transition-all border ${
                    isActive
                      ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-[0_0_12px_rgba(0,229,255,0.4)]'
                      : isCompleted
                      ? 'bg-sky-950 text-cyan-300 border-cyan-500/50'
                      : 'bg-slate-800/80 text-slate-400 border-slate-700'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4 stroke-[2.5]" /> : <Icon className="w-4 h-4" />}
                </div>

                {/* Step Text */}
                <div className="hidden sm:block">
                  <div
                    className={`text-xs font-semibold ${
                      isActive ? 'text-cyan-300' : isCompleted ? 'text-slate-200' : 'text-slate-400'
                    }`}
                  >
                    Step {item.step}: {item.label}
                  </div>
                  <div className="text-[10px] text-slate-500 line-clamp-1">{item.desc}</div>
                </div>
              </button>

              {/* Connecting line */}
              {idx < STEPS.length - 1 && (
                <div
                  className={`hidden md:block flex-1 h-[2px] mx-3 transition-colors ${
                    currentStep > item.step ? 'bg-cyan-500/60' : 'bg-slate-800'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
