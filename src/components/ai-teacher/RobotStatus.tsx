import React from 'react';
import { RobotState } from './types';

interface RobotStatusProps {
  state: RobotState;
}

export const RobotStatus: React.FC<RobotStatusProps> = ({ state }) => {
  const getStatusConfig = () => {
    switch (state) {
      case 'listening':
        return {
          dotColor: 'bg-amber-400',
          dotShadow: 'shadow-[0_0_12px_rgba(251,191,36,0.9)]',
          borderColor: 'border-amber-500/40',
          bgColor: 'bg-amber-950/40',
          textColor: 'text-amber-300',
          label: 'Seni dinliyorum…',
          isPulsing: true,
        };
      case 'thinking':
        return {
          dotColor: 'bg-purple-400',
          dotShadow: 'shadow-[0_0_12px_rgba(192,132,252,0.9)]',
          borderColor: 'border-purple-500/40',
          bgColor: 'bg-purple-950/40',
          textColor: 'text-purple-300',
          label: 'Düşünüyor & Analiz Ediyor…',
          isPulsing: true,
        };
      case 'speaking':
        return {
          dotColor: 'bg-cyan-400',
          dotShadow: 'shadow-[0_0_12px_rgba(56,189,248,0.9)]',
          borderColor: 'border-cyan-500/40',
          bgColor: 'bg-cyan-950/40',
          textColor: 'text-cyan-300',
          label: 'AI Öğretmen konuşuyor…',
          isPulsing: true,
        };
      case 'correcting':
        return {
          dotColor: 'bg-amber-400',
          dotShadow: 'shadow-[0_0_12px_rgba(251,191,36,0.9)]',
          borderColor: 'border-amber-500/50',
          bgColor: 'bg-amber-950/50',
          textColor: 'text-amber-300',
          label: 'Dilbilgisi Düzeltmesi 💡',
          isPulsing: false,
        };
      case 'confused':
        return {
          dotColor: 'bg-orange-400',
          dotShadow: 'shadow-[0_0_12px_rgba(251,146,60,0.9)]',
          borderColor: 'border-orange-500/50',
          bgColor: 'bg-orange-950/50',
          textColor: 'text-orange-300',
          label: 'Anlaşılmadı • Almanca Dene ❓',
          isPulsing: false,
        };
      case 'success':
        return {
          dotColor: 'bg-emerald-400',
          dotShadow: 'shadow-[0_0_12px_rgba(52,211,153,0.9)]',
          borderColor: 'border-emerald-500/40',
          bgColor: 'bg-emerald-950/40',
          textColor: 'text-emerald-300',
          label: 'Harika Cümle! 👏',
          isPulsing: false,
        };
      case 'error':
        return {
          dotColor: 'bg-rose-400',
          dotShadow: 'shadow-[0_0_12px_rgba(251,113,133,0.9)]',
          borderColor: 'border-rose-500/40',
          bgColor: 'bg-rose-950/40',
          textColor: 'text-rose-300',
          label: 'Hata Tespit Edildi ❌',
          isPulsing: false,
        };
      case 'idle':
      default:
        return {
          dotColor: 'bg-emerald-400',
          dotShadow: 'shadow-[0_0_10px_rgba(52,211,153,0.8)]',
          borderColor: 'border-white/10',
          bgColor: 'bg-slate-950/70',
          textColor: 'text-slate-200',
          label: '3D AI Öğretmen Hazır',
          isPulsing: false,
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="flex items-center justify-center pointer-events-none">
      <div
        className={`px-4 py-1.5 rounded-full border backdrop-blur-xl shadow-lg transition-all duration-300 flex items-center space-x-2.5 ${config.bgColor} ${config.borderColor}`}
      >
        <span className="relative flex h-2.5 w-2.5">
          {config.isPulsing && (
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.dotColor}`}
            />
          )}
          <span
            className={`relative inline-flex rounded-full h-2.5 w-2.5 ${config.dotColor} ${config.dotShadow}`}
          />
        </span>
        <span className={`text-xs font-black tracking-tight ${config.textColor}`}>
          {config.label}
        </span>
      </div>
    </div>
  );
};
