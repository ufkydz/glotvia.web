import React from 'react';
import { Volume2, Sparkles, AlertCircle, CheckCircle2, BookmarkPlus, Lightbulb, HelpCircle, AlertTriangle } from 'lucide-react';
import { AITeacherTurn } from './types';

interface ConversationCardProps {
  currentTurn?: AITeacherTurn | null;
  isPlayingAudio?: boolean;
  onPlayAudio?: (text: string) => void;
  onSaveWord?: (word: string, meaning?: string) => void;
  activeHint?: string | null;
}

export const ConversationCard: React.FC<ConversationCardProps> = ({
  currentTurn,
  isPlayingAudio = false,
  onPlayAudio,
  onSaveWord,
  activeHint,
}) => {
  if (!currentTurn) {
    return (
      <div className="w-full backdrop-blur-2xl bg-[#09152b]/90 border border-cyan-500/25 rounded-3xl p-5 sm:p-6 shadow-[0_15px_40px_rgba(0,0,0,0.6)] text-center text-slate-400">
        AI Öğretmen ile konuşmaya başlamak için aşağıdaki mikrofona dokunun.
      </div>
    );
  }

  const isAi = currentTurn.sender === 'ai';
  const isGibberish = currentTurn.status === 'GIBBERISH' || currentTurn.status === 'UNINTELLIGIBLE';
  const isTurkish = currentTurn.status === 'TURKISH_INPUT';
  const hasError = currentTurn.correction && currentTurn.correction.hasError;

  return (
    <div className={`w-full max-w-full overflow-hidden backdrop-blur-2xl bg-[#09152b]/90 border rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-[0_12px_35px_rgba(0,0,0,0.5)] space-y-3 transition-all duration-300 ${
      isGibberish
        ? 'border-orange-500/40 hover:border-orange-500/60'
        : isTurkish
        ? 'border-amber-500/40 hover:border-amber-500/60'
        : hasError
        ? 'border-rose-500/40 hover:border-rose-500/60'
        : 'border-cyan-500/30 hover:border-cyan-500/50'
    }`}>
      
      {/* 1. Header with Role label & Audio Speaker */}
      <div className="flex items-center justify-between gap-2 border-b border-cyan-500/15 pb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className={`text-xs font-black truncate ${
            isGibberish
              ? 'text-orange-400'
              : isTurkish
              ? 'text-amber-400'
              : hasError
              ? 'text-rose-400'
              : 'text-cyan-400'
          }`}>
            {isAi ? 'AI Öğretmen:' : 'Sen:'}
          </span>

          {/* Status Badge */}
          {isGibberish && (
            <span className="px-1.5 py-0.5 rounded bg-orange-950/70 border border-orange-500/40 text-orange-300 text-[9px] sm:text-[10px] font-bold shrink-0">
              Anlaşılamadı
            </span>
          )}
          {isTurkish && (
            <span className="px-1.5 py-0.5 rounded bg-amber-950/70 border border-amber-500/40 text-amber-300 text-[9px] sm:text-[10px] font-bold shrink-0">
              Türkçe Girdi
            </span>
          )}
        </div>

        {/* Listen Audio Speaker Button */}
        {onPlayAudio && (
          <button
            type="button"
            onClick={() => onPlayAudio(currentTurn.text)}
            disabled={isPlayingAudio}
            className={`px-2.5 py-1 sm:py-1.5 rounded-xl border transition-all flex items-center gap-1 cursor-pointer shrink-0 ${
              isPlayingAudio
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md animate-pulse'
                : 'bg-slate-950/80 hover:bg-slate-800 text-cyan-300 border-cyan-500/30 hover:text-white'
            }`}
            title="Sesli Dinle"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span className="text-[10px] sm:text-[11px] font-bold">
              {isPlayingAudio ? 'Okunuyor...' : 'Dinle'}
            </span>
          </button>
        )}
      </div>

      {/* 2. Target Spoken Language Text */}
      <div className="text-sm sm:text-base md:text-lg font-black text-white leading-relaxed break-words">
        {currentTurn.text}
      </div>

      {/* 3. Turkish Translation */}
      {currentTurn.translationTr && (
        <div className="text-xs sm:text-sm font-semibold text-slate-300 bg-slate-950/60 p-2.5 sm:p-3 rounded-xl border border-white/5 break-words">
          <span className="text-cyan-400 font-bold mr-1.5">TR:</span>
          {currentTurn.translationTr}
        </div>
      )}

      {/* 4. Phonetic Reading Guidance */}
      {currentTurn.phonetic && (
        <div className="text-[10px] sm:text-xs font-mono font-medium text-amber-300/90 flex flex-wrap items-center gap-1 break-all">
          <span className="text-slate-400 font-sans font-bold">Okunuş:</span>
          <span>{currentTurn.phonetic}</span>
        </div>
      )}

      {/* 5. User Error Correction (if any) */}
      {hasError && currentTurn.correction && (
        <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 space-y-1.5 animate-in fade-in">
          <div className="flex items-center gap-1.5 text-rose-300 text-xs font-black">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span>Dilbilgisi / İfade Analizi:</span>
          </div>

          {currentTurn.correction.originalWrongPart && (
            <div className="text-xs text-rose-300/90 font-mono bg-rose-950/80 p-1.5 sm:p-2 rounded-lg border border-rose-500/20 break-words">
              <span className="text-rose-400 font-bold mr-1">❌ Söylenen:</span>
              <span>"{currentTurn.correction.originalWrongPart}"</span>
            </div>
          )}

          {currentTurn.correction.correctedPart && (
            <div className="text-xs text-emerald-300 font-mono bg-emerald-950/60 p-1.5 sm:p-2 rounded-lg border border-emerald-500/30 break-words">
              <span className="text-emerald-400 font-bold mr-1">✅ Doğrusu:</span>
              <strong>{currentTurn.correction.correctedPart}</strong>
            </div>
          )}

          {currentTurn.correction.explanationTr && (
            <p className="text-[11px] text-slate-300 leading-snug pt-0.5 break-words">
              💡 <strong>Açıklama:</strong> {currentTurn.correction.explanationTr}
            </p>
          )}
        </div>
      )}

      {/* 6. Active Pedagogical Hint */}
      {activeHint && (
        <div className="p-2.5 sm:p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 flex items-start gap-2 animate-in fade-in">
          <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-200 break-words">
            <span className="font-bold text-amber-300">Öneri Başlangıç: </span>
            {activeHint}
          </div>
        </div>
      )}

    </div>
  );
};
