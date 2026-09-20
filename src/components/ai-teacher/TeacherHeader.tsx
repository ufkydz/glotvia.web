import React from 'react';
import { Menu, Clock, Check } from 'lucide-react';
import { UserProfile } from '../../types';

interface TeacherHeaderProps {
  currentUser?: UserProfile | null;
  scenarioTitle?: string;
  scenarioSubtitle?: string;
  scenarioTagline?: string;
  sessionSeconds: number;
  selectedLevel: string;
  onOpenMenu?: () => void;
  onLevelClick?: () => void;
}

export const TeacherHeader: React.FC<TeacherHeaderProps> = ({
  currentUser,
  scenarioTitle = 'ÖĞRENME ARKADAŞI (TANDEM PARTNER)',
  scenarioSubtitle = 'Samimi bir dil öğrenme arkadaşı (AI)',
  scenarioTagline = 'Gerçek bir konuşma deneyimi yaşa!',
  sessionSeconds,
  selectedLevel,
  onOpenMenu,
  onLevelClick,
}) => {
  const userName = currentUser?.name || currentUser?.vorname || 'Ufuk';

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  return (
    <header className="w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3 select-none">
      
      {/* 1. Menu Button & Main Center Card */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {/* Menu Hamburger */}
        {onOpenMenu && (
          <button
            type="button"
            onClick={onOpenMenu}
            className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
            title="Ders Menüsü"
          >
            <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        )}

        {/* Central Glass Card */}
        <div className="flex-1 backdrop-blur-2xl bg-[#09152b]/85 border border-cyan-500/20 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 shadow-[0_8px_25px_rgba(0,0,0,0.4)] flex items-center justify-between gap-2 min-w-0">
          <div className="space-y-0.5 min-w-0">
            {/* Gold Title */}
            <h1 className="text-xs sm:text-sm font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 uppercase truncate">
              {scenarioTitle}
            </h1>
            {/* White Subtitle */}
            <p className="text-[10px] sm:text-xs font-bold text-slate-200 truncate">
              {scenarioSubtitle}
            </p>
            {/* Cyan Tagline */}
            <p className="text-[9px] sm:text-[10px] font-semibold text-cyan-400 truncate">
              {scenarioTagline}
            </p>
          </div>

          {/* Right Header Badges: Timer & Level */}
          <div className="flex flex-col items-end gap-1 shrink-0">
            {/* Timer Glass Pill */}
            <div className="px-2 py-0.5 rounded-full bg-slate-950/80 border border-cyan-500/30 text-cyan-300 font-mono text-[10px] sm:text-xs font-black flex items-center gap-1 shadow-inner">
              <Clock className="w-3 h-3 text-cyan-400" />
              <span>{formatTimer(sessionSeconds)}</span>
            </div>

            {/* Level Pill with progress */}
            <button
              type="button"
              onClick={onLevelClick}
              className="text-[9px] sm:text-[10px] font-black text-slate-300 hover:text-amber-400 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>({selectedLevel})</span>
              <div className="w-8 sm:w-10 h-1 rounded-full bg-slate-800 overflow-hidden border border-white/10">
                <div className="w-3/4 h-full bg-gradient-to-r from-cyan-400 to-amber-400 rounded-full" />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* 2. User Profile Glass Card (Right Side) */}
      <div className="backdrop-blur-2xl bg-[#09152b]/85 border border-cyan-500/20 rounded-xl sm:rounded-2xl p-2 sm:px-3 sm:py-2.5 shadow-[0_8px_25px_rgba(0,0,0,0.4)] flex items-center justify-between sm:justify-start gap-2.5 shrink-0">
        <div className="flex items-center gap-2">
          {/* Avatar */}
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-amber-500 p-0.5 shadow-md shadow-cyan-500/20 flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-xs sm:text-sm">
              {currentUser?.avatar || '🚀'}
            </div>
          </div>

          <div className="text-left leading-tight min-w-0">
            <div className="text-[9px] font-bold text-slate-400">Sen</div>
            <div className="text-xs sm:text-sm font-black text-white truncate max-w-[90px] sm:max-w-[120px]">
              {userName}
            </div>
          </div>
        </div>

        {/* Status indicator */}
        <div className="px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-[9px] sm:text-[10px] font-black flex items-center gap-1 shadow-sm shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Hazır</span>
        </div>
      </div>

    </header>
  );
};
