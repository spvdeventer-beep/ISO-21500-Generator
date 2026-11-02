import React, { useState, useEffect } from 'react';
import { FastForward, ShieldCheck } from 'lucide-react';

interface StartupAnimationProps {
  onComplete: () => void;
}

export const StartupAnimation: React.FC<StartupAnimationProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const duration = 2500; // 2.5 seconds as selected

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(pct);

      if (elapsed >= duration) {
        clearInterval(timer);
        onComplete();
      }
    }, 40);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0B1528] text-white overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Logo & Emblem Animation */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-md">
        {/* Animated Hexagonal Node Emblem */}
        <div className="relative w-28 h-28 mb-6 flex items-center justify-center">
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full drop-shadow-[0_0_25px_rgba(0,229,255,0.6)] animate-pulse"
          >
            <defs>
              <linearGradient id="introGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00E5FF" />
                <stop offset="100%" stopColor="#00A3FF" />
              </linearGradient>
            </defs>
            <polygon
              points="50,5 90,27.5 90,72.5 50,95 10,72.5 10,27.5"
              fill="#0F172A"
              stroke="url(#introGrad)"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            {/* Inner interconnected nodes */}
            <line x1="50" y1="5" x2="50" y2="50" stroke="#00E5FF" strokeWidth="2" opacity="0.9" />
            <line x1="90" y1="72.5" x2="50" y2="50" stroke="#00E5FF" strokeWidth="2" opacity="0.9" />
            <line x1="10" y1="72.5" x2="50" y2="50" stroke="#00E5FF" strokeWidth="2" opacity="0.9" />
            {/* Glowing Nodes */}
            <circle cx="50" cy="50" r="7" fill="#38BDF8" />
            <circle cx="50" cy="5" r="4" fill="#00E5FF" />
            <circle cx="90" cy="27.5" r="4" fill="#00A3FF" />
            <circle cx="90" cy="72.5" r="4" fill="#00E5FF" />
            <circle cx="50" cy="95" r="4" fill="#00A3FF" />
            <circle cx="10" cy="72.5" r="4" fill="#00E5FF" />
            <circle cx="10" cy="27.5" r="4" fill="#00A3FF" />
          </svg>
        </div>

        {/* Wordmark */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <h1 className="text-3xl font-black tracking-widest text-white">
            ADVANNOTECH
          </h1>
          <span className="px-1.5 py-0.5 text-xs font-bold text-cyan-300 bg-cyan-950/80 border border-cyan-500/40 rounded">
            .co.za
          </span>
        </div>

        <p className="text-xs uppercase tracking-widest text-cyan-400 font-semibold mb-6">
          Enterprise Project Governance
        </p>

        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-6 bg-slate-900/60 px-3 py-1 rounded-full border border-slate-800">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>Stateless In-Memory Engine · PMBOK 7th Ed</span>
        </div>

        {/* Progress Bar */}
        <div className="w-64 bg-slate-800/80 h-1.5 rounded-full overflow-hidden border border-slate-700/50 mb-4">
          <div
            className="bg-gradient-to-r from-cyan-400 to-sky-500 h-full transition-all duration-75 ease-out shadow-[0_0_8px_#00E5FF]"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Skip Button */}
        <button
          onClick={onComplete}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white px-3 py-1.5 rounded-md hover:bg-slate-800/60 transition-colors cursor-pointer"
        >
          <FastForward className="w-3.5 h-3.5" />
          <span>Skip Intro</span>
        </button>
      </div>
    </div>
  );
};
