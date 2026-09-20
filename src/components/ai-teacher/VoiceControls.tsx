import React from 'react';
import { Mic, MicOff, Volume2, Lightbulb, Sparkles, Send } from 'lucide-react';

interface VoiceControlsProps {
  isListening: boolean;
  isAiThinking: boolean;
  isAiSpeaking: boolean;
  interimText?: string;
  onStartListening: () => void;
  onStopListening: () => void;
  onReplayAudio: () => void;
  onGiveHint: () => void;
  onSendText?: (text: string) => void;
}

export const VoiceControls: React.FC<VoiceControlsProps> = ({
  isListening,
  isAiThinking,
  isAiSpeaking,
  interimText = '',
  onStartListening,
  onStopListening,
  onReplayAudio,
  onGiveHint,
  onSendText,
}) => {
  return (
    <div className="w-full flex flex-col items-center gap-2.5 sm:gap-3 select-none">
      
      {/* Live Interim Transcript Bubble while speaking */}
      {isListening && (
        <div className="w-full max-w-lg p-2.5 sm:p-3 rounded-2xl bg-amber-950/60 border border-amber-500/40 text-center animate-in fade-in slide-in-from-bottom-2">
          <div className="text-[10px] sm:text-[11px] font-bold text-amber-400 flex items-center justify-center gap-1.5 mb-0.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>Sesiniz Algılanıyor:</span>
          </div>
          <div className="text-xs sm:text-sm font-black text-white italic break-words">
            "{interimText || 'Konuşun, dinliyorum...'}"
          </div>
        </div>
      )}

      {/* Main Action Buttons Grid (Responsive on 320px - desktop) */}
      <div className="w-full grid grid-cols-2 sm:flex sm:items-center sm:justify-center gap-2 sm:gap-3 max-w-2xl">
        
        {/* 1. Tekrar Dinle Button */}
        <button
          type="button"
          onClick={onReplayAudio}
          disabled={isAiThinking}
          className="order-2 sm:order-1 px-3 sm:px-4 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl bg-[#09152b]/90 hover:bg-[#0e2142] border border-cyan-500/30 hover:border-cyan-500/60 text-slate-200 hover:text-white font-bold text-[11px] sm:text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-50"
        >
          <Volume2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="truncate">Tekrar Dinle</span>
        </button>

        {/* 2. Main Center Hero Mic Button */}
        <button
          type="button"
          onClick={isListening ? onStopListening : onStartListening}
          disabled={isAiThinking}
          className={`order-1 sm:order-2 col-span-2 sm:col-span-1 px-4 sm:px-7 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all duration-300 cursor-pointer ${
            isListening
              ? 'bg-gradient-to-r from-rose-500 via-red-600 to-amber-500 text-white shadow-rose-500/50 ring-2 ring-rose-400/40 animate-pulse'
              : isAiThinking
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white opacity-80 cursor-wait'
              : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-[0_8px_25px_rgba(245,158,11,0.35)] hover:scale-[1.01]'
          }`}
        >
          {/* Animated Equalizer Wave Bars while listening */}
          {isListening ? (
            <div className="flex items-center gap-1">
              <span className="w-1 h-4 bg-white rounded-full animate-[bounce_0.6s_infinite_100ms]" />
              <span className="w-1 h-5 bg-white rounded-full animate-[bounce_0.6s_infinite_200ms]" />
              <span className="w-1 h-3 bg-white rounded-full animate-[bounce_0.6s_infinite_300ms]" />
            </div>
          ) : (
            <div className="p-0.5 rounded-lg bg-slate-950/20">
              <Mic className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            </div>
          )}

          <span className="truncate font-black tracking-tight">
            {isListening
              ? 'Dinliyorum (Durdur)'
              : isAiThinking
              ? 'Düşünüyor...'
              : 'Mikrofonla Cevap Ver'}
          </span>
        </button>

        {/* 3. İpucu Ver Button */}
        <button
          type="button"
          onClick={onGiveHint}
          disabled={isAiThinking}
          className="order-3 px-3 sm:px-4 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl bg-[#09152b]/90 hover:bg-[#0e2142] border border-amber-500/30 hover:border-amber-500/60 text-amber-300 hover:text-amber-200 font-bold text-[11px] sm:text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-50"
        >
          <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="truncate">İpucu Ver</span>
        </button>

      </div>

    </div>
  );
};
