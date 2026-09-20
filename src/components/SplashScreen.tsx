import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onFinish?: () => void;
  durationMs?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  durationMs = 1200,
}) => {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [progress, setProgress] = useState(10);

  useEffect(() => {
    // Smooth progress animation over the duration
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return 95;
        return prev + 15;
      });
    }, durationMs / 8);

    // Trigger exit animation shortly before full duration
    const fadeTimer = setTimeout(() => {
      setProgress(100);
      setIsFadingOut(true);
    }, Math.max(durationMs - 250, 600));

    // Complete splash
    const finishTimer = setTimeout(() => {
      if (onFinish) onFinish();
    }, durationMs);

    return () => {
      clearInterval(interval);
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [durationMs, onFinish]);

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-950 text-slate-100 overflow-hidden select-none transition-all duration-300 ease-out ${
        isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Ambient background glow orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 sm:w-96 h-72 sm:h-96 bg-gradient-to-tr from-cyan-500/25 via-blue-600/20 to-purple-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-60 sm:w-80 h-60 sm:h-80 bg-amber-500/15 rounded-full blur-2xl" />
      </div>

      {/* Main Brand Stage (Fade-in & Scale-up Animation) */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-sm mx-auto animate-in fade-in zoom-in-95 duration-500">
        {/* Glowing Logo Icon Badge */}
        <div className="relative mb-5 group">
          <div className="absolute -inset-1.5 bg-gradient-to-r from-cyan-500 via-amber-500 to-indigo-500 rounded-3xl blur-md opacity-75 group-hover:opacity-100 transition duration-1000 animate-pulse" />
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-slate-900 border border-white/15 flex items-center justify-center shadow-2xl">
            <span className="text-3xl sm:text-4xl filter drop-shadow-md">🇩🇪</span>
          </div>
          <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-xl bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center text-slate-950 shadow-md">
            <Sparkles className="w-4 h-4 text-white animate-spin" style={{ animationDuration: '4s' }} />
          </div>
        </div>

        {/* Brand Name */}
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-1.5">
          GLOTVİA
        </h1>

        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-[11px] font-extrabold tracking-wide uppercase mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          <span>AI Dil Öğretmeni • A1</span>
        </div>

        {/* Slogan */}
        <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed max-w-xs mb-6">
          Almancayı <span className="text-cyan-300 font-bold">Akıcı &amp; Kalıcı</span> Olarak Öğrenin
        </p>

        {/* Smooth Loading Progress Bar */}
        <div className="w-44 sm:w-52 h-1.5 bg-slate-800/80 rounded-full overflow-hidden border border-white/10 p-0.5 shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 via-sky-400 to-amber-400 rounded-full transition-all duration-200 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Subtle Pulse Text */}
        <span className="text-[10px] text-slate-400 font-medium mt-2 tracking-wider animate-pulse">
          Yükleniyor…
        </span>
      </div>

      {/* Footer Branding */}
      <div className="absolute bottom-6 text-[10px] text-slate-400 font-mono tracking-widest uppercase">
        Glotvia Interactive German Platform
      </div>
    </div>
  );
};
