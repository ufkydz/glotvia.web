import React from 'react';
import { Flame, BookOpen, Check } from 'lucide-react';
import { UserStatsData } from './types';

interface UserStatsProps {
  stats?: Partial<UserStatsData>;
  onLevelClick?: () => void;
}

export const UserStats: React.FC<UserStatsProps> = ({ stats, onLevelClick }) => {
  const streakDays = stats?.streakDays ?? 7;
  const todayProgress = stats?.todayProgressPercent ?? 75;
  const todayGoalMins = stats?.todayGoalMins ?? 30;
  const levelCode = stats?.levelCode ?? 'A1';
  const levelName = stats?.levelName ?? 'Başlangıç Seviyesi';
  const levelPercent = stats?.levelPercent ?? 62;
  const learnedWords = stats?.learnedWordsCount ?? 456;

  const defaultWeekDays = [
    { day: 'P', done: true },
    { day: 'S', done: true },
    { day: 'Ç', done: true },
    { day: 'P', done: true },
    { day: 'C', done: true },
    { day: 'C', done: true },
    { day: 'P', done: false },
  ];

  const weekDays = stats?.streakWeekDays || defaultWeekDays;

  return (
    <div className="w-full grid grid-cols-2 lg:grid-cols-1 gap-2 sm:gap-2.5 select-none">
      
      {/* 1. Günlük Seri Card */}
      <div className="backdrop-blur-2xl bg-[#09152b]/80 border border-cyan-500/20 hover:border-cyan-500/40 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 shadow-md transition-all duration-300">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-300">Günlük Seri</span>
          <div className="flex items-center gap-1 text-amber-400 font-black text-[11px] sm:text-xs">
            <Flame className="w-3 h-3 fill-amber-400 text-amber-400 animate-bounce" />
            <span>{streakDays}g</span>
          </div>
        </div>

        {/* Weekday Circles */}
        <div className="flex items-center justify-between gap-0.5 pt-0.5">
          {weekDays.map((item, idx) => (
            <div key={idx} className="flex flex-col items-center gap-0.5">
              <div
                className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[9px] font-black transition-all ${
                  item.done
                    ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/40'
                    : 'bg-slate-900 border border-white/10 text-slate-500'
                }`}
              >
                {item.done ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : item.day}
              </div>
              <span className="text-[8px] text-slate-400 font-mono">{item.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Bugünkü İlerleme Card */}
      <div className="backdrop-blur-2xl bg-[#09152b]/80 border border-cyan-500/20 hover:border-cyan-500/40 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 shadow-md transition-all duration-300">
        <div className="text-[10px] sm:text-[11px] font-bold text-slate-300 mb-1.5">Bugünkü İlerleme</div>
        
        <div className="flex items-center gap-2.5">
          {/* Circular SVG Gauge */}
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              {/* Background circle */}
              <circle
                cx="18"
                cy="18"
                r="15"
                fill="none"
                className="stroke-slate-800"
                strokeWidth="3.2"
              />
              {/* Foreground progress circle */}
              <circle
                cx="18"
                cy="18"
                r="15"
                fill="none"
                className="stroke-amber-400"
                strokeWidth="3.2"
                strokeDasharray={`${(todayProgress / 100) * 94.2} 94.2`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-[9px] sm:text-[10px] font-black text-white">{todayProgress}%</span>
          </div>

          <div className="space-y-0.5 min-w-0">
            <div className="text-[11px] sm:text-xs font-black text-slate-100 truncate">Ders Hedefi</div>
            <div className="text-[9px] text-slate-400 truncate">{todayGoalMins} dk</div>
          </div>
        </div>
      </div>

      {/* 3. Seviyen Card */}
      <div 
        onClick={onLevelClick}
        className="backdrop-blur-2xl bg-[#09152b]/80 border border-cyan-500/20 hover:border-cyan-500/40 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 shadow-md transition-all duration-300 cursor-pointer group"
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-300">Seviyen</span>
          <span className="text-[9px] sm:text-[10px] font-black text-cyan-400 font-mono bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/30">
            {levelCode}
          </span>
        </div>

        <div className="text-[11px] sm:text-xs font-black text-white group-hover:text-cyan-300 transition-colors mb-1 truncate">
          {levelName}
        </div>

        {/* Level Progress Bar */}
        <div className="space-y-0.5">
          <div className="w-full h-1 rounded-full bg-slate-800 border border-white/5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${levelPercent}%` }}
            />
          </div>
          <div className="flex justify-end text-[8px] font-mono text-slate-400">
            %{levelPercent}
          </div>
        </div>
      </div>

      {/* 4. Kelimeler Card */}
      <div className="backdrop-blur-2xl bg-[#09152b]/80 border border-cyan-500/20 hover:border-cyan-500/40 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 shadow-md transition-all duration-300">
        <div className="text-[10px] sm:text-[11px] font-bold text-slate-300 mb-1">Kelimeler</div>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 shrink-0">
            <BookOpen className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs sm:text-sm font-black text-white leading-tight font-mono">{learnedWords}</div>
            <div className="text-[9px] text-slate-400 truncate">öğrenildi</div>
          </div>
        </div>
      </div>

    </div>
  );
};
