import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles, RotateCcw, AlertCircle, BookOpen,
  X, Star, Lightbulb, Trophy, CheckCircle2, ChevronRight, Compass
} from 'lucide-react';
import { UserProfile, LanguageId } from '../types';
import { LANGUAGES_LIST } from '../data/languagesData';
import { AITeacherScenario, AI_TEACHER_SCENARIOS } from '../data/aiTeacherScenarios';
import { AITeacherRobot } from './ai-teacher/AITeacherRobot';
import { TeacherHeader } from './ai-teacher/TeacherHeader';
import { UserStats } from './ai-teacher/UserStats';
import { ConversationCard } from './ai-teacher/ConversationCard';
import { VoiceControls } from './ai-teacher/VoiceControls';
import { RobotState, AITeacherTurn, UserStatsData } from './ai-teacher/types';
import {
  generateAITeacherResponse,
  generateSessionAssessmentReport,
  saveSessionLocally,
  AISessionReport,
  KeyVocabItem,
  detectInputQuality
} from '../services/aiTeacherService';
import { playGermanText, stopGermanSpeech } from '../services/germanTtsService';
import {
  germanSpeechRecognizer,
  SpeechRecognitionErrorCode
} from '../services/germanSpeechRecognitionService';
import { speakText } from '../utils/speechUtils';
import { playCoinSound, playSuccessChime } from '../utils/audioEffects';

interface AILanguageTutorProps {
  currentUser?: UserProfile | null;
  onAwardCoins?: (amount: number, reason: string) => void;
  onOpenLessonTopic?: (topicId: string) => void;
  onSaveVocabularyWord?: (word: string, article?: string, meaning?: string) => void;
}

export const AILanguageTutor: React.FC<AILanguageTutorProps> = ({
  currentUser,
  onAwardCoins,
  onOpenLessonTopic,
  onSaveVocabularyWord
}) => {
  const targetLang = LANGUAGES_LIST.find(l => l.id === currentUser?.targetLanguage) || LANGUAGES_LIST[0];
  const userName = currentUser?.name || currentUser?.vorname || 'Ufuk';
  const initialLevel = 'A1' as 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

  const [selectedLevel, setSelectedLevel] = useState<'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'>(initialLevel);
  const [selectedScenario, setSelectedScenario] = useState<AITeacherScenario>(AI_TEACHER_SCENARIOS[0]);
  const [isScenarioPickerOpen, setIsScenarioPickerOpen] = useState(false);
  
  // Session & Dialogue state
  const [messages, setMessages] = useState<AITeacherTurn[]>([]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isPlayingTurnId, setIsPlayingTurnId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastFeedbackState, setLastFeedbackState] = useState<'correct' | 'wrong' | 'confused' | null>(null);
  const [activeHint, setActiveHint] = useState<string | null>(null);
  const [savedWordsSet, setSavedWordsSet] = useState<Set<string>>(new Set());

  // Session Stopwatch
  const [sessionSeconds, setSessionSeconds] = useState(18);
  const [hasAwarded10Min, setHasAwarded10Min] = useState(false);
  const [activeReport, setActiveReport] = useState<AISessionReport | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Compute 3D Robot State
  const robotState: RobotState = isListening
    ? 'listening'
    : isAiThinking
    ? 'thinking'
    : isAiSpeaking
    ? 'speaking'
    : lastFeedbackState === 'correct'
    ? 'success'
    : lastFeedbackState === 'confused'
    ? 'confused'
    : lastFeedbackState === 'wrong'
    ? 'correcting'
    : 'idle';

  // Initialize scenario dialogue
  useEffect(() => {
    const promptInfo = selectedScenario.initialPrompts[currentUser?.targetLanguage || 'de'] || 
      selectedScenario.initialPrompts['de'] || 
      { text: 'Hallo! Schön dich kennenzulernen. Wie heißt du und woher kommst du?', translationTr: 'Merhaba! Tanıştığımıza memnun oldum. Adın ne ve nereden geliyorsun?', phonetic: '[hal-lo! şön dih ken-nen-tsu-ler-nen. vi hayst du und vo-her komst du?]' };

    const initialAiMessage: AITeacherTurn = {
      id: `init_${Date.now()}`,
      sender: 'ai',
      text: promptInfo.text,
      translationTr: promptInfo.translationTr,
      phonetic: promptInfo.phonetic,
      grammarTip: `${selectedScenario.title} senaryosunda pratik yaparken seviyenize (${selectedLevel}) uygun cümleler kurmaya özen gösterin.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'VALID_GERMAN'
    };

    setMessages([initialAiMessage]);
    stopGermanSpeech();
    germanSpeechRecognizer.stop();
    setIsListening(false);
    setActiveHint(null);
    setLastFeedbackState(null);
  }, [selectedScenario, selectedLevel]);

  // Stopwatch
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSessionSeconds(prev => {
        const next = prev + 1;
        if (next >= 600 && !hasAwarded10Min) {
          setHasAwarded10Min(true);
          playSuccessChime();
          if (onAwardCoins) {
            onAwardCoins(50, '🎉 Günlük 10 Dakika AI Konuşma Tamamlandı!');
          }
        }
        return next;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [hasAwarded10Min, onAwardCoins]);

  // Clean up audio & mic on unmount
  useEffect(() => {
    return () => {
      stopGermanSpeech();
      germanSpeechRecognizer.stop();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Handle Play Audio
  const handlePlayAudio = async (text: string) => {
    try {
      setIsPlayingTurnId(text);
      setIsAiSpeaking(true);
      if ((currentUser?.targetLanguage || 'de') === 'de') {
        await playGermanText(text, { speedMode: 'normal' });
      } else {
        speakText(text, currentUser?.targetLanguage || 'en');
      }
    } finally {
      setIsPlayingTurnId(null);
      setIsAiSpeaking(false);
    }
  };

  // Start Speech Recognition
  const handleStartMicInput = async () => {
    setErrorMessage(null);
    setInterimText('');
    stopGermanSpeech();

    const started = await germanSpeechRecognizer.start({
      onStart: () => {
        setIsListening(true);
      },
      onInterimResult: (transcript) => {
        setInterimText(transcript);
      },
      onFinalResult: (res) => {
        setIsListening(false);
        setInterimText('');
        if (res.transcript && res.transcript.trim()) {
          const raw = res.transcript.trim();
          // Check if speech recognition result is too short or garbled
          if (raw.length <= 1) {
            setErrorMessage('Sesinizi tam anlayamadım. Lütfen mikrofona biraz daha yakın olarak tekrar söyler misiniz?');
            setLastFeedbackState('confused');
            setTimeout(() => setLastFeedbackState(null), 3000);
            return;
          }
          handleSendUserMessage(raw);
        } else {
          setErrorMessage('Herhangi bir ses algılanamadı. Lütfen tekrar deneyin.');
        }
      },
      onError: (code: SpeechRecognitionErrorCode, msg: string) => {
        setIsListening(false);
        setErrorMessage(msg);
      },
      onEnd: () => {
        setIsListening(false);
      }
    });

    if (!started) {
      setIsListening(false);
    }
  };

  const handleStopMicInput = () => {
    germanSpeechRecognizer.stop();
    setIsListening(false);
  };

  // Send User Message & Trigger AI Response with Full Validation Pipeline
  const handleSendUserMessage = async (textToSend: string) => {
    const cleanText = textToSend.trim();
    if (!cleanText || isAiThinking) return;

    // Check empty or single punctuation
    if (/^[.,!?;:]+$/.test(cleanText)) {
      setErrorMessage('Lütfen geçerli bir kelime veya cümle girin.');
      return;
    }

    const userTurn: AITeacherTurn = {
      id: `turn_user_${Date.now()}`,
      sender: 'user',
      text: cleanText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userTurn]);
    setInputText('');
    setIsAiThinking(true);
    setActiveHint(null);
    setErrorMessage(null);

    try {
      const aiResponse = await generateAITeacherResponse({
        userMessage: cleanText,
        conversationHistory: messages.map(m => ({ sender: m.sender, text: m.text })),
        scenario: selectedScenario,
        targetLangId: currentUser?.targetLanguage || 'de',
        nativeLangId: currentUser?.nativeLanguage || 'tr',
        userLevel: selectedLevel,
        userName
      });

      // Update feedback state and rewards based on rigorous status
      if (aiResponse.status === 'GIBBERISH' || aiResponse.status === 'UNINTELLIGIBLE') {
        setLastFeedbackState('confused');
      } else if (aiResponse.status === 'TURKISH_INPUT') {
        setLastFeedbackState('confused');
      } else if (aiResponse.correction && aiResponse.correction.hasError) {
        setLastFeedbackState('wrong');
      } else {
        setLastFeedbackState('correct');
        // Award coins only for valid German practice
        if (onAwardCoins) {
          onAwardCoins(5, 'Doğru Almanca Konuşma Pratiği');
        }
      }

      // Update user turn with correction if any
      if (aiResponse.correction && aiResponse.correction.hasError) {
        setMessages(prev => prev.map(m => m.id === userTurn.id ? { ...m, correction: aiResponse.correction } : m));
      }

      const aiTurn: AITeacherTurn = {
        id: `turn_ai_${Date.now()}`,
        sender: 'ai',
        text: aiResponse.reply,
        translationTr: aiResponse.translationTr,
        phonetic: aiResponse.phonetic,
        grammarTip: aiResponse.grammarTip,
        hintForUser: aiResponse.hintForUser,
        correction: aiResponse.correction,
        status: aiResponse.status,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiTurn]);

      // Automatically speak AI reply
      handlePlayAudio(aiResponse.reply);

      // Auto-clear feedback state after 4 seconds
      setTimeout(() => {
        setLastFeedbackState(null);
      }, 4000);

    } catch (e) {
      console.warn('AI turn error', e);
      setErrorMessage('AI öğretmenle bağlantıda küçük bir gecikme oldu, lütfen tekrar deneyin.');
    } finally {
      setIsAiThinking(false);
    }
  };

  // Replay the latest AI response
  const handleReplayLatestAI = () => {
    const lastAiMsg = [...messages].reverse().find(m => m.sender === 'ai');
    if (lastAiMsg) {
      handlePlayAudio(lastAiMsg.text);
    }
  };

  // Provide Pedagogical Hint
  const handleGiveHint = () => {
    const lastAiMsg = [...messages].reverse().find(m => m.sender === 'ai');
    const hint = lastAiMsg?.hintForUser || 'Ich heiße... und ich lerne gerne Deutsch!';
    setActiveHint(hint);
  };

  // Finish Session & Generate Assessment Report
  const handleFinishAndAnalyze = async () => {
    stopGermanSpeech();
    germanSpeechRecognizer.stop();
    setIsListening(false);
    setIsGeneratingReport(true);

    try {
      const report = await generateSessionAssessmentReport({
        sessionId: `session_${Date.now()}`,
        scenario: selectedScenario,
        turns: messages,
        durationSeconds: sessionSeconds,
        userLevel: selectedLevel,
        userName
      });

      saveSessionLocally(report);
      setActiveReport(report);
      playSuccessChime();

      if (onAwardCoins) {
        onAwardCoins(report.coinsEarned, `🎯 ${selectedScenario.title} AI Konuşma Oturumu Raporu`);
      }
    } catch (err) {
      console.error('Failed to generate session report', err);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Save Word to Vocabulary
  const handleSaveWord = (word: string, meaning?: string) => {
    setSavedWordsSet(prev => new Set(prev).add(word));
    playCoinSound();
    if (onSaveVocabularyWord) {
      onSaveVocabularyWord(word, undefined, meaning);
    }
    if (onAwardCoins) {
      onAwardCoins(2, `⭐ "${word}" Kelimesi Kaydedildi`);
    }
  };

  // Get current active AI turn for display in main card
  const latestAiTurn = [...messages].reverse().find(m => m.sender === 'ai') || messages[0];

  const userStatsData: UserStatsData = {
    streakDays: currentUser?.stats?.streak || 7,
    streakWeekDays: [
      { day: 'P', done: true },
      { day: 'S', done: true },
      { day: 'Ç', done: true },
      { day: 'P', done: true },
      { day: 'C', done: true },
      { day: 'C', done: true },
      { day: 'P', done: false },
    ],
    todayProgressPercent: Math.min(100, Math.round((sessionSeconds / 1800) * 100)) || 75,
    todayGoalMins: 30,
    levelCode: selectedLevel,
    levelName: selectedLevel === 'A1' || selectedLevel === 'A2' ? 'Başlangıç Seviyesi' : selectedLevel === 'B1' || selectedLevel === 'B2' ? 'Orta Seviye' : 'İleri Seviye',
    levelPercent: 62,
    learnedWordsCount: currentUser?.stats?.learnedCardIds?.length ? currentUser.stats.learnedCardIds.length * 12 : 456,
  };

  return (
    <div className="w-full min-h-screen bg-[#050b17] text-white p-2.5 sm:p-4 md:p-6 space-y-3 sm:space-y-5 select-none overflow-x-hidden font-sans pb-28">
      
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 left-1/4 w-72 sm:w-[500px] h-72 sm:h-[500px] bg-cyan-500/10 rounded-full blur-[100px]" />
        <div className="absolute top-1/3 right-5 w-60 sm:w-[450px] h-60 sm:h-[450px] bg-amber-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-10 left-5 w-60 sm:w-[400px] h-60 sm:h-[400px] bg-blue-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-3 sm:space-y-5">

        {/* ========================================================
            1. TOP HEADER (TANDEM PARTNER + TIMER + USER PROFILE)
        ======================================================== */}
        <TeacherHeader
          currentUser={currentUser}
          scenarioTitle={selectedScenario.title.toUpperCase()}
          scenarioSubtitle="Samimi bir dil öğrenme arkadaşı (AI)"
          scenarioTagline="Gerçek bir konuşma deneyimi yaşa!"
          sessionSeconds={sessionSeconds}
          selectedLevel={selectedLevel}
          onOpenMenu={() => setIsScenarioPickerOpen(true)}
          onLevelClick={() => {
            const levels: ('A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2')[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
            const nextIdx = (levels.indexOf(selectedLevel) + 1) % levels.length;
            setSelectedLevel(levels[nextIdx]);
          }}
        />

        {/* ========================================================
            2. MAIN 2-COLUMN GRID (STATS ON LEFT, 3D ROBOT & CONTROLS ON RIGHT)
        ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-5 items-start">
          
          {/* LEFT SIDEBAR: 4 GLASS CARDS */}
          <aside className="lg:col-span-4 xl:col-span-3 space-y-2.5 sm:space-y-3 order-2 lg:order-1">
            <UserStats
              stats={userStatsData}
              onLevelClick={() => {
                const levels: ('A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2')[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
                const nextIdx = (levels.indexOf(selectedLevel) + 1) % levels.length;
                setSelectedLevel(levels[nextIdx]);
              }}
            />

            {/* Scenario Picker Button in Left Sidebar */}
            <button
              type="button"
              onClick={() => setIsScenarioPickerOpen(true)}
              className="w-full backdrop-blur-2xl bg-[#09152b]/80 hover:bg-[#0e2142] border border-cyan-500/20 hover:border-cyan-500/50 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 flex items-center justify-between text-left transition-all duration-200 cursor-pointer group shadow-md"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-xl sm:text-2xl shrink-0 group-hover:scale-110 transition-transform">
                  {selectedScenario.icon || '💬'}
                </span>
                <div className="min-w-0">
                  <div className="text-[9px] uppercase font-bold text-amber-400">Senaryo Değiştir</div>
                  <div className="text-xs sm:text-sm font-black text-white truncate">
                    {selectedScenario.title}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-300 transition-colors shrink-0" />
            </button>

            {/* Finish & Get Report CTA */}
            <button
              type="button"
              onClick={handleFinishAndAnalyze}
              disabled={isGeneratingReport || messages.length <= 1}
              className="w-full py-2.5 sm:py-3 px-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 border border-emerald-500/40 text-emerald-300 hover:text-white font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-40"
            >
              <Trophy className="w-4 h-4 text-emerald-400" />
              <span>{isGeneratingReport ? 'Analiz Ediliyor...' : 'Konuşmayı Bitir & Rapor Al'}</span>
            </button>
          </aside>

          {/* MAIN STAGE (3D ROBOT + DIALOGUE + HERO MIC) */}
          <main className="lg:col-span-8 xl:col-span-9 space-y-3 sm:space-y-4 order-1 lg:order-2 flex flex-col items-center">
            
            {/* 3D AVATAR HERO CONTAINER */}
            <div className="w-full flex flex-col items-center justify-center relative">
              <AITeacherRobot
                state={robotState}
                speakingIntensity={isAiSpeaking ? 1 : 0}
              />
            </div>

            {/* ERROR ALERT TOAST IF ANY */}
            {errorMessage && (
              <div className="w-full max-w-2xl p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-rose-950/70 border border-rose-500/40 text-xs text-rose-300 flex items-center justify-between gap-2 shadow-md animate-in fade-in">
                <div className="flex items-center gap-2 min-w-0">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span className="break-words">{errorMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setErrorMessage(null)}
                  className="p-1 text-rose-400 hover:text-white shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* CONVERSATION CARD (CURRENT PROMPT / STATEMENT) */}
            <div className="w-full max-w-2xl">
              <ConversationCard
                currentTurn={latestAiTurn}
                isPlayingAudio={isAiSpeaking}
                onPlayAudio={handlePlayAudio}
                onSaveWord={handleSaveWord}
                activeHint={activeHint}
              />
            </div>

            {/* ACTION BUTTONS BAR (HERO MIC + TEKRAR DİNLE + İPUCU VER) */}
            <div className="w-full max-w-2xl">
              <VoiceControls
                isListening={isListening}
                isAiThinking={isAiThinking}
                isAiSpeaking={isAiSpeaking}
                interimText={interimText}
                onStartListening={handleStartMicInput}
                onStopListening={handleStopMicInput}
                onReplayAudio={handleReplayLatestAI}
                onGiveHint={handleGiveHint}
              />
            </div>

            {/* QUICK TEXT INPUT BAR */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendUserMessage(inputText);
              }}
              className="w-full max-w-2xl flex items-center gap-2 pt-0.5"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Yazarak da cevap verebilirsin (örn: Hallo, ich bin...)"
                disabled={isAiThinking}
                className="flex-1 bg-[#09152b]/90 border border-cyan-500/20 hover:border-cyan-500/40 focus:border-amber-400 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none transition-all shadow-inner min-w-0"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isAiThinking}
                className="px-3.5 sm:px-5 py-2.5 sm:py-3 bg-slate-900 hover:bg-slate-800 border border-white/10 text-amber-400 hover:text-amber-300 font-bold rounded-xl sm:rounded-2xl text-xs transition-all active:scale-95 disabled:opacity-40 cursor-pointer shrink-0"
              >
                Gönder
              </button>
            </form>

            {/* RECENT DIALOGUE FEED STREAM */}
            {messages.length > 1 && (
              <div className="w-full max-w-2xl backdrop-blur-2xl bg-[#09152b]/70 border border-cyan-500/15 rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 space-y-2.5 shadow-md">
                <div className="text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-wider flex items-center justify-between border-b border-white/5 pb-2">
                  <span>Konuşma Geçmişi ({messages.length} mesaj)</span>
                  <button
                    type="button"
                    onClick={() => {
                      setMessages(messages.slice(0, 1));
                      setSessionSeconds(0);
                    }}
                    className="text-slate-500 hover:text-slate-300 flex items-center gap-1 text-[10px] cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Sıfırla</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
                  {messages.map((turn, idx) => {
                    const isAi = turn.sender === 'ai';
                    const hasErr = turn.correction && turn.correction.hasError;
                    return (
                      <div
                        key={turn.id || idx}
                        className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border text-xs space-y-1 ${
                          isAi
                            ? 'bg-slate-950/80 border-cyan-500/20 text-slate-200'
                            : hasErr
                            ? 'bg-rose-950/30 border-rose-500/40 text-rose-100 ml-3 sm:ml-6'
                            : 'bg-amber-500/15 border-amber-500/30 text-amber-100 ml-3 sm:ml-6'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-bold ${isAi ? 'text-cyan-400' : hasErr ? 'text-rose-400' : 'text-amber-400'}`}>
                            {isAi ? 'AI Öğretmen:' : 'Sen:'}
                          </span>
                          <span className="text-[9px] text-slate-500">{turn.timestamp}</span>
                        </div>
                        <p className="font-semibold text-white break-words">{turn.text}</p>
                        {isAi && turn.translationTr && (
                          <p className="text-[10px] text-slate-400 break-words">TR: {turn.translationTr}</p>
                        )}
                        {turn.correction && turn.correction.hasError && (
                          <div className="text-[10px] text-rose-300 bg-rose-950/60 p-2 rounded-lg border border-rose-500/30 space-y-0.5">
                            {turn.correction.correctedPart && (
                              <div className="break-words">✅ Doğrusu: <strong>{turn.correction.correctedPart}</strong></div>
                            )}
                            {turn.correction.explanationTr && (
                              <div className="text-slate-300 break-words">💡 {turn.correction.explanationTr}</div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </div>
            )}

          </main>

        </div>

      </div>

      {/* ========================================================
          3. SCENARIO PICKER MODAL
      ======================================================== */}
      {isScenarioPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-xl bg-slate-900 border border-cyan-500/30 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-white font-black text-base">
                <Compass className="w-5 h-5 text-amber-400" />
                <span>Konuşma Senaryosu Seç</span>
              </div>
              <button
                type="button"
                onClick={() => setIsScenarioPickerOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {AI_TEACHER_SCENARIOS.map((sc) => {
                const isSelected = selectedScenario.id === sc.id;
                return (
                  <button
                    key={sc.id}
                    type="button"
                    onClick={() => {
                      setSelectedScenario(sc);
                      setIsScenarioPickerOpen(false);
                    }}
                    className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500/60 text-white ring-2 ring-amber-400/30'
                        : 'bg-slate-950/80 hover:bg-slate-800 border-white/10 text-slate-300'
                    }`}
                  >
                    <span className="text-2xl shrink-0">{sc.icon}</span>
                    <div className="min-w-0">
                      <div className="text-xs font-black text-white">{sc.title}</div>
                      <div className="text-[10px] text-amber-400 font-bold mt-0.5">{sc.recommendedLevel} • {sc.roleAi}</div>
                      <div className="text-[10px] text-slate-400 line-clamp-2 mt-1">{sc.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          4. AI POST-SESSION ASSESSMENT REPORT MODAL
      ======================================================== */}
      {activeReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
                  <Trophy className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">AI Konuşma Analizi Raporu</h3>
                  <p className="text-xs text-slate-400">Senaryo: {activeReport.scenarioTitle}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveReport(null)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Score Gauges */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 text-center col-span-2 sm:col-span-1">
                <div className="text-[10px] uppercase font-bold text-amber-400">Genel Skor</div>
                <div className="text-2xl font-black text-white mt-1">{activeReport.overallScore}/100</div>
                <div className="text-[10px] text-slate-500">🎯 Toplam</div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/70 border border-white/10 text-center">
                <div className="text-[10px] uppercase font-bold text-slate-400">Dilbilgisi</div>
                <div className="text-lg font-black text-amber-300 mt-1">{activeReport.grammarScore}</div>
                <div className="text-[10px] text-slate-500">✍️ Grammar</div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/70 border border-white/10 text-center">
                <div className="text-[10px] uppercase font-bold text-slate-400">Kelime</div>
                <div className="text-lg font-black text-amber-300 mt-1">{activeReport.vocabularyScore}</div>
                <div className="text-[10px] text-slate-500">📚 Vocab</div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/70 border border-white/10 text-center">
                <div className="text-[10px] uppercase font-bold text-slate-400">Telaffuz</div>
                <div className="text-lg font-black text-amber-300 mt-1">{activeReport.pronunciationScore}</div>
                <div className="text-[10px] text-slate-500">🔊 Phonetics</div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/70 border border-white/10 text-center">
                <div className="text-[10px] uppercase font-bold text-slate-400">Akıcılık</div>
                <div className="text-lg font-black text-amber-300 mt-1">{activeReport.fluencyScore}</div>
                <div className="text-[10px] text-slate-500">🗣️ Fluency</div>
              </div>
            </div>

            {/* Motivation Message */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20 text-xs text-amber-200">
              <p className="font-semibold leading-relaxed">{activeReport.motivationMessage}</p>
            </div>

            {/* Recommended Topic */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">🎯 Sana Özel Gelişim Önerisi</div>
                <div className="text-sm font-bold text-white mt-0.5">{activeReport.recommendedLessonTitle}</div>
              </div>
              {onOpenLessonTopic && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenLessonTopic(activeReport.recommendedLessonTopicId);
                    setActiveReport(null);
                  }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shrink-0 transition-all cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Derse Git</span>
                </button>
              )}
            </div>

            {/* Earned Rewards */}
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Oturum Başarıyla Tamamlandı</span>
              </div>
              <div className="text-sm font-black text-amber-400">
                +{activeReport.coinsEarned} 🪙 • +{activeReport.xpEarned} XP
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveReport(null)}
              className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-2xl text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              Raporu Kapat & Pratiğe Devam Et
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
