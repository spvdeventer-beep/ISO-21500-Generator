import React, { useEffect, useState } from 'react';
import { Loader2, ShieldCheck, Check, Sparkles, AlertCircle } from 'lucide-react';
import { PMIDocumentDefinition } from '../data/documents';

interface Step4GenerateProps {
  selectedDoc: PMIDocumentDefinition;
  isGenerating: boolean;
  error: string | null;
  onRetry: () => void;
  onBack: () => void;
  onFastTrack?: () => void;
}

const GENERATION_STAGES = [
  'Forensic ground check: Verifying extracted source material...',
  'Mapping PMBOK 7th performance domains & ISO compliance guidelines...',
  'Applying Advannotech letterhead, document ID & revision governance...',
  'Drafting exhaustive required sections in authoritative British English...',
  'Compiling Source Provenance & Material Exclusion Audit trail...',
  'Finalizing sign-off blocks & Sources/Assumptions appendix...',
];

export const Step4Generate: React.FC<Step4GenerateProps> = ({
  selectedDoc,
  isGenerating,
  error,
  onRetry,
  onBack,
  onFastTrack,
}) => {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!isGenerating) {
      setElapsedSeconds(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStageIndex((prev) => (prev < GENERATION_STAGES.length - 1 ? prev + 1 : prev));
    }, 2500);

    const timer = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(timer);
    };
  }, [isGenerating]);

  return (
    <div className="max-w-2xl mx-auto py-10 space-y-8">
      {error ? (
        <div className="bg-rose-950/40 border border-rose-500/40 rounded-xl p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-900/60 border border-rose-500/50 flex items-center justify-center mx-auto text-rose-400">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Document Generation Error</h3>
            <p className="text-xs text-rose-300 mt-1 max-w-md mx-auto">{error}</p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={onBack}
              className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              Back to Clarifications
            </button>
            <button
              onClick={onRetry}
              className="px-5 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 rounded-lg shadow-md transition-all cursor-pointer"
            >
              Retry Generation
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-[#0F172A] border border-cyan-500/30 rounded-xl p-8 shadow-xl text-center space-y-6">
          {/* Animated Spinner Icon */}
          <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 animate-ping pointer-events-none" />
            <div className="w-16 h-16 rounded-full bg-slate-900 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(0,229,255,0.3)]">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2.5 py-0.5 rounded-full">
              Synthesis in Progress
            </span>
            <h3 className="text-lg font-extrabold text-white mt-2">
              Synthesizing {selectedDoc.title}
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Drafting audit-ready ISO artifact using strictly uploaded source material and confirmed clarifications.
            </p>
          </div>

          {/* Stepped progress indicators */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-4 text-left space-y-2.5">
            {GENERATION_STAGES.map((stage, idx) => {
              const isPast = idx < currentStageIndex;
              const isCurrent = idx === currentStageIndex;

              return (
                <div key={idx} className="flex items-center gap-3 text-xs">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${
                      isPast
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                        : isCurrent
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-500 animate-pulse'
                        : 'bg-slate-900 text-slate-600 border border-slate-800'
                    }`}
                  >
                    {isPast ? <Check className="w-3 h-3 stroke-[3]" /> : idx + 1}
                  </div>
                  <span
                    className={`${
                      isPast
                        ? 'text-slate-300 line-through opacity-75'
                        : isCurrent
                        ? 'text-cyan-300 font-semibold'
                        : 'text-slate-500'
                    }`}
                  >
                    {stage}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Fast-track option if AI inference is taking more than a few seconds */}
          {elapsedSeconds >= 4 && onFastTrack && (
            <div className="p-3 bg-cyan-950/40 border border-cyan-500/30 rounded-xl space-y-2 animate-in fade-in">
              <div className="text-[11px] text-cyan-200">
                Synthesis running against strict ISO 21500 standards ({elapsedSeconds}s). Need immediate results?
              </div>
              <button
                onClick={onFastTrack}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 rounded-lg shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Instant Direct Synthesis (Bypass Server Wait)</span>
              </button>
            </div>
          )}

          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Strict Truth Guarantee: Zero fabricated facts or phantom metrics</span>
          </div>
        </div>
      )}
    </div>
  );
};
