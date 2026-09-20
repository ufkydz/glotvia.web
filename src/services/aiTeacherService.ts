import { GoogleGenAI } from '@google/genai';
import { LanguageId } from '../types';
import { LANGUAGES_LIST } from '../data/languagesData';
import { AITeacherScenario } from '../data/aiTeacherScenarios';

export interface KeyVocabItem {
  word: string;
  article?: string;
  meaningTr: string;
  example: string;
}

export type TeacherErrorType = 'GRAMMAR' | 'VOCABULARY' | 'PRONUNCIATION' | 'ARTICLE' | 'WORD_ORDER' | 'CONJUGATION' | 'PREPOSITION';

export interface TeacherCorrection {
  hasError: boolean;
  originalWrongPart?: string;
  correctedPart?: string;
  errorType?: TeacherErrorType;
  explanationTr?: string;
}

export type InputAnalysisStatus = 
  | 'VALID_GERMAN'
  | 'GERMAN_WITH_ERROR'
  | 'TURKISH_INPUT'
  | 'GIBBERISH'
  | 'UNINTELLIGIBLE'
  | 'EMPTY_OR_SHORT';

export interface AITeacherTurnResponse {
  reply: string;
  translationTr: string;
  phonetic?: string;
  grammarTip?: string;
  correction?: TeacherCorrection;
  hintForUser?: string;
  keyVocabulary?: KeyVocabItem[];
  status?: InputAnalysisStatus;
}

export interface AISessionReport {
  sessionId: string;
  timestamp: number;
  scenarioId: string;
  scenarioTitle: string;
  durationSeconds: number;
  totalTurns: number;
  overallScore: number;
  grammarScore: number;
  vocabularyScore: number;
  pronunciationScore: number;
  fluencyScore: number;
  correctionsSummary: Array<{
    wrong: string;
    correct: string;
    explanation: string;
    type: string;
  }>;
  learnedVocabulary: KeyVocabItem[];
  growthRecommendations: string[];
  recommendedLessonTopicId: string;
  recommendedLessonTitle: string;
  motivationMessage: string;
  coinsEarned: number;
  xpEarned: number;
}

function getGeminiClient(): GoogleGenAI | null {
  try {
    const apiKey = 
      (typeof process !== 'undefined' && process?.env?.GEMINI_API_KEY) ||
      (typeof process !== 'undefined' && process?.env?.API_KEY) ||
      (import.meta as any).env?.VITE_GEMINI_API_KEY ||
      (import.meta as any).env?.GEMINI_API_KEY ||
      (typeof window !== 'undefined' && (window as any).__GEMINI_API_KEY__) ||
      (typeof localStorage !== 'undefined' && localStorage.getItem('gemini_api_key')) ||
      '';
    
    if (!apiKey || apiKey === 'YOUR_API_KEY' || apiKey.trim().length < 5) {
      return null;
    }
    return new GoogleGenAI({ apiKey });
  } catch (err) {
    return null;
  }
}

/* =======================================================================
   1. STRICT INPUT SANITIZATION & GIBBERISH / RANDOM TEXT DETECTOR
   ======================================================================= */

/**
 * Checks if the text is random keyboard smash, repeated chars, or meaningless gibberish
 */
export function detectInputQuality(rawText: string): {
  isGibberish: boolean;
  isTurkish: boolean;
  isTooShort: boolean;
  normalized: string;
  reason?: string;
} {
  const text = rawText.trim();

  if (!text || text.length === 0) {
    return { isGibberish: false, isTurkish: false, isTooShort: true, normalized: '', reason: 'empty' };
  }

  // Purely numeric or symbolic
  if (/^[\d\s.,!?;:()\-+/*=_#$%&^@~`"'{}\[\]]+$/.test(text)) {
    return { isGibberish: true, isTurkish: false, isTooShort: false, normalized: text, reason: 'numbers_symbols_only' };
  }

  const cleanChars = text.toLowerCase().replace(/[^a-zäöüß]/g, '');

  // 1. Check for single character repetition: "aaaaaa", "kkkkkk", "ööööö"
  if (/(.)\1{3,}/i.test(text)) {
    return { isGibberish: true, isTurkish: false, isTooShort: false, normalized: text, reason: 'repeated_characters' };
  }

  // 2. Keyboard mash / Smash patterns
  const smashPatterns = [
    /asdf/i, /qwer/i, /zxcv/i, /jkl;/i, /qweqwe/i, /asdasd/i, /jfjf/i,
    /hghg/i, /kdkf/i, /xxkdk/i, /abcxyz/i, /123123/i, /lkjh/i, /mnbv/i,
    /fghj/i, /werr/i, /sdfg/i, /ghjk/i, /xcvb/i, /bnm,/i
  ];
  if (smashPatterns.some(p => p.test(text))) {
    return { isGibberish: true, isTurkish: false, isTooShort: false, normalized: text, reason: 'keyboard_mash_pattern' };
  }

  // 3. Vowel-to-consonant ratio and vowel-less strings
  // German & Turkish require vowels (a, e, i, o, u, ä, ö, ü, y)
  const vowels = text.match(/[aeiouäöüy]/gi) || [];
  const lettersOnly = text.match(/[a-zäöüßğışç]/gi) || [];

  if (lettersOnly.length >= 4 && vowels.length === 0) {
    return { isGibberish: true, isTurkish: false, isTooShort: false, normalized: text, reason: 'no_vowels' };
  }

  // Consecutive consonants check (e.g. "xxkdkfjkff" -> 10 consonants)
  // German allows up to ~4 consonants in compound clusters (like "Herbst"), but 5+ without vowels is gibberish
  if (/[bcdfghjklmnpqrstvwxz]{5,}/i.test(text)) {
    return { isGibberish: true, isTurkish: false, isTooShort: false, normalized: text, reason: 'unnatural_consonant_cluster' };
  }

  // Low character diversity on longer inputs (e.g., "jfjfjfj", "babababa")
  if (cleanChars.length >= 6) {
    const uniqueChars = new Set(cleanChars).size;
    if (uniqueChars <= 2) {
      return { isGibberish: true, isTurkish: false, isTooShort: false, normalized: text, reason: 'low_entropy' };
    }
  }

  // 4. Turkish sentence detection
  const turkishMarkers = [
    /\b(merhaba|nasılsın|selam|günaydın|iyi akşamlar|benim adım|adım|ben|sen|o|biz|siz|onlar)\b/i,
    /\b(anlamadım|ne dedin|tekrar et|bilmiyorum|yardım et|nasıl|neden|nerede|kim|ne)\b/i,
    /\b(türkçe|almanca|öğrenmek|istiyorum|gidiyorum|geliyorum|yapıyorum)\b/i,
    /[ğışç]/i
  ];
  const isTurkish = turkishMarkers.some(p => p.test(text));

  return {
    isGibberish: false,
    isTurkish,
    isTooShort: false,
    normalized: text
  };
}

/* =======================================================================
   2. HIGH ACCURACY GERMAN GRAMMAR & RULE-BASED ANALYZER
   ======================================================================= */

export interface GermanRuleAnalysis {
  hasKnownError: boolean;
  isValidKnownPhrase: boolean;
  correction?: TeacherCorrection;
  suggestedReply?: {
    reply: string;
    translationTr: string;
    phonetic: string;
    grammarTip?: string;
  };
}

export function analyzeGermanRules(userText: string, userName: string = 'Ufuk'): GermanRuleAnalysis {
  const clean = userText.trim();
  const lower = clean.toLowerCase();

  // Common German learner mistakes & exact pedagogical corrections
  
  // 1. "Ich bin gehen Berlin" / "Ich bin gehen ..."
  if (/\bich\s+bin\s+gehen\b/i.test(lower)) {
    const isBerlin = lower.includes('berlin');
    return {
      hasKnownError: true,
      isValidKnownPhrase: false,
      correction: {
        hasError: true,
        originalWrongPart: clean,
        correctedPart: isBerlin ? 'Ich gehe nach Berlin.' : 'Ich gehe...',
        errorType: 'GRAMMAR',
        explanationTr: 'Almancada şimdiki zamanda "sein" (bin) yardımcı fiiliyle mastar kullanılmaz. Fiil özneye göre çekilir: "Ich gehe". Şehirler için "nach" edatı kullanılır: "nach Berlin".'
      },
      suggestedReply: {
        reply: 'Gute Reise! Berlin ist eine faszinierende Stadt. Was möchtest du in Berlin machen?',
        translationTr: 'İyi yolculuklar! Berlin büyüleyici bir şehir. Berlin\'de ne yapmak istiyorsun?',
        phonetic: '[gu-tı ray-zı! ber-lin ist ay-nı fas-tsi-ni-rın-dı ştat. vas möh-tın du in ber-lin ma-hın?]',
        grammarTip: 'Şehir ve ülkelere yönelirken "nach" kullanılır: "Ich fahre nach Berlin."'
      }
    };
  }

  // 2. "Ich nix verstehen" / "nix verstehen"
  if (/\b(ich\s+)?nix\s+verstehen\b/i.test(lower)) {
    return {
      hasKnownError: true,
      isValidKnownPhrase: false,
      correction: {
        hasError: true,
        originalWrongPart: clean,
        correctedPart: 'Ich verstehe das nicht.',
        errorType: 'GRAMMAR',
        explanationTr: 'Günlük konuşmada "nix" yerine resmi ve doğru olarak "nicht" (olumsuzluk eki) ve fiilin çekimli hali "verstehe" kullanılır.'
      },
      suggestedReply: {
        reply: 'Kein Problem, ich helfe dir gerne! Was genau möchtest du wissen?',
        translationTr: 'Hiç sorun değil, sana seve seve yardım ederim! Tam olarak neyi öğrenmek istersin?',
        phonetic: '[kayn prob-leym, ih hel-fı dir ger-nı! vas ge-naw möh-tın du vis-sın?]',
        grammarTip: '"nicht" olumsuzluk bildiren ana kelimedir: "Ich verstehe nicht."'
      }
    };
  }

  // 3. "Ich gehen Schule" / "Ich gehen ..."
  if (/\bich\s+gehen\b/i.test(lower)) {
    const isSchule = lower.includes('schule');
    return {
      hasKnownError: true,
      isValidKnownPhrase: false,
      correction: {
        hasError: true,
        originalWrongPart: clean,
        correctedPart: isSchule ? 'Ich gehe zur Schule.' : 'Ich gehe...',
        errorType: 'CONJUGATION',
        explanationTr: '"ich" (ben) zamiri için fiil "-e" takısı alır: "ich gehe". Okula gitmek için yönelme "zur Schule" (zu der Schule) şeklinde söylenir.'
      },
      suggestedReply: {
        reply: 'Sehr fleißig! Welche Fächer lernst du heute in der Schule?',
        translationTr: 'Çok çalışkansın! Bugün okulda hangi dersleri öğreniyorsun?',
        phonetic: '[zer flay-sih! vel-hı fe-hır lernst du hoy-tı in der şu-lı?]',
        grammarTip: 'Kurumlara yönelirken "zu" edatı Dativ alır: zu + der = zur Schule.'
      }
    };
  }

  // 4. "Ich komme aus Türkei" (Missing article "der")
  if (/\baus\s+türkei\b/i.test(lower) || /\baus\s+turkei\b/i.test(lower)) {
    return {
      hasKnownError: true,
      isValidKnownPhrase: false,
      correction: {
        hasError: true,
        originalWrongPart: 'aus Türkei',
        correctedPart: 'aus der Türkei',
        errorType: 'ARTICLE',
        explanationTr: 'Türkiye dişil (die) bir ülke ismi olduğu için "aus" edatıyla Dativ artikel alır: "aus der Türkei".'
      },
      suggestedReply: {
        reply: 'Schön! Die Türkei ist ein wunderschönes Land. Aus welcher Stadt kommst du genau?',
        translationTr: 'Çok güzel! Türkiye harika bir ülke. Tam olarak hangi şehirdensin?',
        phonetic: '[şön! di tür-kay ist ayn vun-dır-şö-nıs lant. aws vel-hır ştat komst du ge-naw?]',
        grammarTip: 'Artikelli ülkeler: die Türkei → aus der Türkei, die Schweiz → aus der Schweiz.'
      }
    };
  }

  // 5. "Ich gehe Berlin" (Missing preposition "nach")
  if (/^ich\s+gehe\s+berlin$/i.test(lower) || /^ich\s+fahre\s+berlin$/i.test(lower)) {
    return {
      hasKnownError: true,
      isValidKnownPhrase: false,
      correction: {
        hasError: true,
        originalWrongPart: clean,
        correctedPart: 'Ich gehe nach Berlin.',
        errorType: 'PREPOSITION',
        explanationTr: 'Şehir ve artikelsiz ülkelere giderken yönelme edatı olarak "nach" kullanılmalıdır.'
      },
      suggestedReply: {
        reply: 'Viel Spaß in Berlin! Fährst du mit dem Zug oder fliegst du?',
        translationTr: 'Berlin\'de iyi eğlenceler! Trenle mi gidiyorsun yoksa uçuyor musun?',
        phonetic: '[fil şpas in ber-lin! fehrst du mit deym tsuk o-dır fli-gst du?]',
        grammarTip: 'Yönelme: nach Berlin, nach Almanya (Deutschland).'
      }
    };
  }

  // 6. "Ich habe 25 Jahre" / "Ich habe 20 Jahre alt"
  if (/ich\s+habe\s+\d+\s+jahre/i.test(lower)) {
    return {
      hasKnownError: true,
      isValidKnownPhrase: false,
      correction: {
        hasError: true,
        originalWrongPart: clean,
        correctedPart: clean.replace(/ich\s+habe/i, 'Ich bin'),
        errorType: 'GRAMMAR',
        explanationTr: 'Almancada yaş söylerken "haben" (sahip olmak) değil, "sein" (olmak) fiili kullanılır: "Ich bin ... Jahre alt".'
      }
    };
  }

  // 7. "eine Kaffee" / "ein Kaffee" in order context
  if (/\b(eine|ein)\s+kaffee\b/i.test(lower)) {
    return {
      hasKnownError: true,
      isValidKnownPhrase: false,
      correction: {
        hasError: true,
        originalWrongPart: 'eine Kaffee',
        correctedPart: 'einen Kaffee',
        errorType: 'ARTICLE',
        explanationTr: 'Kaffee eril (der) bir isimdir. "Ich möchte / trinke..." cümlelerinde nesne Akkusativ (belirtme) durumunda olduğu için "einen Kaffee" kullanılır.'
      }
    };
  }

  // PERFECT VALID GERMAN INPUTS (No errors, natural responses)

  // 8. "Hallo" / "Guten Tag"
  if (/^(hallo|hi|guten tag|guten morgen|guten abend|servus|moin)$/i.test(lower)) {
    return {
      hasKnownError: false,
      isValidKnownPhrase: true,
      suggestedReply: {
        reply: `Hallo ${userName || 'mein Freund'}! Schön, dass du da bist. Wie kann ich dir heute beim Deutschlernen helfen?`,
        translationTr: `Merhaba ${userName || 'arkadaşım'}! Burada olman çok güzel. Bugün Almanca öğrenmende sana nasıl yardımcı olabilirim?`,
        phonetic: `[hal-lo! şön, das du da bist. vi kan ih dir hoy-tı baym doytç-ler-nın hel-fın?]`,
        grammarTip: '"Wie kann ich dir helfen?" kalıbı yardım teklifinde bulunurken en doğal yapıdır.'
      }
    };
  }

  // 9. "Wie geht es dir?" / "Wie geht's?"
  if (/^wie\s+geht('?s| es dir)(\s+heute)?\??$/i.test(lower)) {
    return {
      hasKnownError: false,
      isValidKnownPhrase: true,
      suggestedReply: {
        reply: 'Mir geht es sehr gut, danke der Nachfrage! Und wie läuft dein Tag bisher?',
        translationTr: 'Ben çok iyiyim, sorduğun için teşekkürler! Peki senin günün şu ana kadar nasıl gidiyor?',
        phonetic: '[mir geyt es zer gu:t, dan-kı der nah-fra-gı! unt vi loyft dayn tag bis-heyr?]',
        grammarTip: '"Mir geht es gut" yapısında "mir" (bana) Dativ zamiridir.'
      }
    };
  }

  // 10. "Ich heiße ..." / "Mein Name ist ..."
  if (/^ich\s+heiße\s+[a-zäöüßğışç]+/i.test(lower) || /^mein\s+name\s+ist\s+[a-zäöüßğışç]+/i.test(lower)) {
    const extractedName = clean.split(/\s+/).slice(-1)[0] || userName;
    return {
      hasKnownError: false,
      isValidKnownPhrase: true,
      suggestedReply: {
        reply: `Freut mich sehr, ${extractedName}! Woher kommst du und welche Sprachen sprichst du?`,
        translationTr: `Tanıştığımıza çok memnun oldum ${extractedName}! Nerelisin ve hangi dilleri konuşuyorsun?`,
        phonetic: `[froyt mih zer, ${extractedName}! vo-heyr komst du unt vel-hı şpra-hın şprihst du?]`,
        grammarTip: '"Freut mich!" Almancada tanışırken "Memnun oldum" anlamında en yaygın ifadedir.'
      }
    };
  }

  // 11. "Ich habe ein Auto."
  if (/^ich\s+habe\s+ein\s+auto\.?$/i.test(lower)) {
    return {
      hasKnownError: false,
      isValidKnownPhrase: true,
      suggestedReply: {
        reply: 'Toll! Ein Auto ist sehr praktisch. Fährst du gerne damit zur Arbeit oder in den Urlaub?',
        translationTr: 'Harika! Araba çok kullanışlıdır. Onunla işe veya tatile gitmeyi sever misin?',
        phonetic: '[toll! ayn ow-to ist zer prak-tiş. fehrst du ger-nı da-mit tsur ar-bayt o-dır in deyn ur-lawp?]',
        grammarTip: '"das Auto" nötr olduğu için Akkusativ halinde "ein Auto" olarak kalır.'
      }
    };
  }

  // 12. "Ich gehe zur Schule."
  if (/^ich\s+gehe\s+zur\s+schule\.?$/i.test(lower)) {
    return {
      hasKnownError: false,
      isValidKnownPhrase: true,
      suggestedReply: {
        reply: 'Sehr fleißig! Was ist dein Lieblingsfach in der Schule?',
        translationTr: 'Çok çalışkansın! Okuldaki en sevdiğin ders hangisi?',
        phonetic: '[zer flay-sih! vas ist dayn li:p-lingz-fah in der şu-lı?]',
        grammarTip: '"zur Schule gehen" kalıbı okula gitmek anlamına gelir.'
      }
    };
  }

  // 13. "Ich komme aus Samsun / İstanbul / ..."
  if (/^ich\s+komme\s+aus\s+[a-zäöüßğışç]+/i.test(lower)) {
    const city = clean.split(/\s+/).slice(-1)[0];
    return {
      hasKnownError: false,
      isValidKnownPhrase: true,
      suggestedReply: {
        reply: `Sehr interessant! ${city} ist bestimmt ein schöner Ort. Was gefällt dir dort am besten?`,
        translationTr: `Çok ilginç! ${city} kesinlikle güzel bir yer. Orada en çok neyi seversin?`,
        phonetic: `[zer in-te-re-sant! ${city} ist be-ştimt ayn şö-nır ort. vas ge-fellt dir dort am bes-tın?]`,
        grammarTip: 'Şehir isimlerinde genellikle artikel kullanılmaz: "aus Samsun", "aus Berlin".'
      }
    };
  }

  return {
    hasKnownError: false,
    isValidKnownPhrase: false
  };
}

/* =======================================================================
   3. MAIN AI TEACHER RESPONSE PIPELINE WITH VALIDATION
   ======================================================================= */

export async function generateAITeacherResponse(params: {
  userMessage: string;
  conversationHistory: Array<{ sender: 'ai' | 'user'; text: string }>;
  scenario: AITeacherScenario;
  targetLangId: LanguageId;
  nativeLangId: LanguageId;
  userLevel: string; // 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
  userName: string;
}): Promise<AITeacherTurnResponse> {
  const {
    userMessage,
    conversationHistory,
    scenario,
    targetLangId,
    nativeLangId,
    userLevel,
    userName
  } = params;

  // STEP 1: INPUT SANITIZATION & QUALITY CHECK
  const quality = detectInputQuality(userMessage);

  // Case A: GIBBERISH / RANDOM INPUT ("Xxkdkfjkff", "asdasdasd", "123123", etc.)
  if (quality.isGibberish) {
    return {
      status: 'GIBBERISH',
      reply: 'Entschuldigung, das habe ich leider nicht verstanden. Bitte sprich oder schreibe einen sinnvollen Satz auf Deutsch!',
      translationTr: 'Bu ifade Almanca açısından anlaşılır bir cümle değil. Lütfen Almanca bir cümle yaz veya söyle.',
      phonetic: '[ent-şul-di-gung, das ha-bı ih lay-dır niht fer-ştan-dın. bit-tı şprih o-dır şray-bı ay-nın zin-fol-lın zats awf doytç!]',
      grammarTip: 'Diyaloğu başlatmak için basit selamlaşma veya tanışma cümleleri kurabilirsiniz.',
      correction: {
        hasError: true,
        originalWrongPart: userMessage,
        correctedPart: 'Hallo! / Wie geht es dir? / Ich heiße...',
        errorType: 'VOCABULARY',
        explanationTr: 'Yazdığınız/söylediğiniz ifade anlamlı bir Almanca kelime veya cümle içermiyor.'
      },
      hintForUser: 'Hallo! Wie geht es dir? (Merhaba! Nasılsın?)'
    };
  }

  // Case B: TURKISH INPUT DETECTED ("merhaba", "anlamadım", etc.)
  if (quality.isTurkish) {
    return {
      status: 'TURKISH_INPUT',
      reply: 'Ich verstehe dich, aber lass uns bitte auf Deutsch üben! Wie würdest du das auf Deutsch sagen?',
      translationTr: 'Seni anlıyorum, fakat lütfen Almanca pratik yapalım! Bunu Almanca olarak nasıl söylerdin?',
      phonetic: '[ih fer-şte-hı dih, a-bır las uns bit-tı awf doytç ü:-bın! vi vür-dıst du das awf doytç za-gın?]',
      grammarTip: 'Türkçe düşündüğünüz basit kalıpları Almancaya çevirerek konuşmayı deneyin.',
      correction: {
        hasError: true,
        originalWrongPart: userMessage,
        correctedPart: 'Almanca bir ifade kullanın',
        errorType: 'VOCABULARY',
        explanationTr: 'Türkçe bir ifade girdiniz. AI Öğretmen ile diyalog kurmak için Almanca cümleler kullanmalısınız.'
      },
      hintForUser: 'Ich möchte Deutsch lernen. (Almanca öğrenmek istiyorum.)'
    };
  }

  // STEP 2: RULE-BASED PATTERN & KNOWN COMMON MISTAKES/VALIDATIONS
  const ruleAnalysis = analyzeGermanRules(userMessage, userName);

  if (ruleAnalysis.hasKnownError && ruleAnalysis.correction) {
    // If it's a known major grammar error with a pre-crafted pedagogical reply
    if (ruleAnalysis.suggestedReply) {
      return {
        status: 'GERMAN_WITH_ERROR',
        reply: ruleAnalysis.suggestedReply.reply,
        translationTr: ruleAnalysis.suggestedReply.translationTr,
        phonetic: ruleAnalysis.suggestedReply.phonetic,
        grammarTip: ruleAnalysis.suggestedReply.grammarTip,
        correction: ruleAnalysis.correction,
        hintForUser: 'Ich verstehe! Danke für die Korrektur.'
      };
    }
  }

  // If it's a known perfect phrase (like "Hallo", "Wie geht es dir?", "Ich heiße...")
  if (ruleAnalysis.isValidKnownPhrase && ruleAnalysis.suggestedReply) {
    return {
      status: 'VALID_GERMAN',
      reply: ruleAnalysis.suggestedReply.reply,
      translationTr: ruleAnalysis.suggestedReply.translationTr,
      phonetic: ruleAnalysis.suggestedReply.phonetic,
      grammarTip: ruleAnalysis.suggestedReply.grammarTip,
      correction: { hasError: false },
      hintForUser: 'Mir geht es auch gut! (Ben de iyiyim!)'
    };
  }

  // STEP 3: GEMINI AI DYNAMIC CONVERSATION ENGINE (With Strict Anti-Hallucination Prompt)
  const ai = getGeminiClient();

  if (ai) {
    const modelsToTry = ['gemini-2.0-flash', 'gemini-1.5-flash'];
    const recentHistory = conversationHistory.slice(-4).map(h => 
      `${h.sender === 'user' ? (userName || 'Student') : 'Teacher'}: ${h.text}`
    ).join('\n');

    for (const model of modelsToTry) {
      try {
        const prompt = `Sen Glotvia dil öğrenme uygulamasının resmi 3D YAPAY ZEKA ALMANCA ÖĞRETMENİSİN.
Öğrencinin Adı: ${userName || 'Ufuk'}
Öğrencinin Seviyesi: ${userLevel} (A1, A2, B1, B2, C1)
Aktif Senaryo: "${scenario.title}" (Rolün: ${scenario.roleAi}, Öğrencinin Rolü: ${scenario.roleUser})

DİYALOG GEÇMİŞİ:
${recentHistory || '(Konuşma başlangıcı)'}

ÖĞRENCİNİN YENİ GİRDİSİ:
"""${userMessage}"""

KRİTİK VE KESİN KURALLAR:
1. HALLÜSİNASYON KESİNLİKLE YASAKTIR: Öğrencinin söylemediği veya yazmadığı hiçbir şeyi söylemiş gibi varsayma.
2. ANLAMSIZ / GIBBERISH KONTROLÜ: Eğer öğrencinin girdisi rastgele harflerden ("asdf", "qweqwe", "xxkdkfjkff" vb.) oluşuyorsa veya Almanca açısından anlamsızsa KESİNLİKLE "Sehr gut!", "Das hast du verständlich ausgedrückt!" gibi tebrik veya övgü cümleleri VERME. Bunun yerine "Entschuldigung, das habe ich nicht verstanden. Bitte sprich auf Deutsch." de.
3. DİLBİLGİSİ VE DOĞRULUK ANALİZİ:
   - Öğrencinin cümlesini fiil çekimi, artikel (der/die/das), Akkusativ/Dativ, edat (nach, zu, aus), kelime sırası ve yazım açısından denetle.
   - Hata varsa "correction.hasError": true yap ve nazikçe Türkçe açıkla.
   - Cümle tamamen doğruysa "correction.hasError": false yap.
4. YANIT DİLİ VE UZUNLUĞU:
   - Yanıtın ("reply") doğal Almanca olsun. Öğrencinin seviyesine (${userLevel}) uygun olsun (A1: 1-2 sade cümle; B1+: zengin ve doğal).
   - "translationTr": Yanıtının tam Türkçe çevirisini ver.
   - "phonetic": Türk kullanıcıların doğru telaffuz edebileceği fonetik kılavuz [örn: [vi hayst du?]].

KESİNLİKLE SADECE GEÇERLİ JSON DÖNDÜR:
{
  "status": "VALID_GERMAN" | "GERMAN_WITH_ERROR" | "GIBBERISH",
  "reply": "Almanca cevap",
  "translationTr": "Türkçe çeviri",
  "phonetic": "[fonetik okunuş]",
  "grammarTip": "Pedagojik kısa ipucu veya kural",
  "correction": {
    "hasError": boolean,
    "originalWrongPart": "öğrencinin hatalı kısmı",
    "correctedPart": "doğru şekli",
    "errorType": "GRAMMAR" | "ARTICLE" | "VOCABULARY" | "WORD_ORDER" | "CONJUGATION" | "PREPOSITION",
    "explanationTr": "Türkçe kısa ve net kural açıklaması"
  },
  "hintForUser": "Öğrencinin söyleyebileceği örnek bir sonraki cümle"
}`;

        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.3 // Low temperature to prevent hallucinations
          }
        });

        const text = response.text || '';
        const parsed = JSON.parse(text);

        // STEP 4: RESPONSE VALIDATION (Sanitize against accidental hallucinations)
        if (parsed && parsed.reply) {
          // If the model produced a praise phrase on a gibberish input, intercept it
          if (parsed.status === 'GIBBERISH' || quality.isGibberish) {
            return {
              status: 'GIBBERISH',
              reply: 'Das habe ich leider nicht verstanden. Bitte sag oder schreibe einen verständlichen deutschen Satz!',
              translationTr: 'Bunu ne yazık ki anlayamadım. Lütfen anlaşılır bir Almanca cümle söyle veya yaz!',
              phonetic: '[das ha-bı ih lay-dır niht fer-ştan-dın. bit-tı zag o-dır şray-bı ay-nın fer-ştent-li-hın doyt-çın zats!]',
              grammarTip: 'Temel cümle kurarken: Özne + Fiil + Nesne yapısını takip edebilirsiniz.',
              correction: {
                hasError: true,
                originalWrongPart: userMessage,
                correctedPart: 'Almanca bir cümle',
                errorType: 'VOCABULARY',
                explanationTr: 'Girdiğiniz metin anlaşılır bir Almanca kelime veya cümle içermiyor.'
              },
              hintForUser: 'Wie heißt du? (Adın ne?)'
            };
          }

          // If rule-based analysis found an error that AI missed, augment it
          const finalCorrection: TeacherCorrection = (ruleAnalysis.hasKnownError && ruleAnalysis.correction)
            ? ruleAnalysis.correction
            : (parsed.correction?.hasError ? {
                hasError: true,
                originalWrongPart: parsed.correction.originalWrongPart || userMessage,
                correctedPart: parsed.correction.correctedPart || '',
                errorType: parsed.correction.errorType || 'GRAMMAR',
                explanationTr: parsed.correction.explanationTr || 'Cümle yapısında küçük bir düzeltme gerekiyor.'
              } : { hasError: false });

          return {
            status: finalCorrection.hasError ? 'GERMAN_WITH_ERROR' : 'VALID_GERMAN',
            reply: parsed.reply,
            translationTr: parsed.translationTr || 'Çeviri hazırlandı.',
            phonetic: parsed.phonetic || undefined,
            grammarTip: parsed.grammarTip || undefined,
            correction: finalCorrection,
            hintForUser: parsed.hintForUser || undefined,
            keyVocabulary: Array.isArray(parsed.keyVocabulary) ? parsed.keyVocabulary : []
          };
        }
      } catch (err) {
        console.warn(`AITeacherService: Model ${model} call failed, using deterministic fallback.`, err);
      }
    }
  }

  // STEP 5: RELIABLE CONTEXTUAL FALLBACK
  return generateContextualFallback(params, ruleAnalysis);
}

/**
 * Contextual Fallback for Offline / Network error without false praises
 */
function generateContextualFallback(
  params: {
    userMessage: string;
    scenario: AITeacherScenario;
    targetLangId: LanguageId;
    userLevel: string;
    userName: string;
  },
  ruleAnalysis: GermanRuleAnalysis
): AITeacherTurnResponse {
  const { userMessage, scenario, userName } = params;
  const lower = userMessage.toLowerCase().trim();

  // If rule analysis already has a correction, use it
  if (ruleAnalysis.hasKnownError && ruleAnalysis.correction) {
    return {
      status: 'GERMAN_WITH_ERROR',
      reply: 'Danke für deinen Satz! Schau dir bitte kurz die Düzeltme (Korrektur) an.',
      translationTr: 'Cümlen için teşekkürler! Lütfen yukarıdaki küçük düzeltmeye göz at.',
      phonetic: '[dan-kı für day-nın zats! şaw dir bit-tı kurts di dü-zelt-me an.]',
      correction: ruleAnalysis.correction,
      hintForUser: 'Ich habe verstanden. (Anladım.)'
    };
  }

  // Cafe scenario fallback
  if (scenario.id === 'cafe_order') {
    if (lower.includes('kaffee') || lower.includes('tee') || lower.includes('wasser') || lower.includes('bestellen')) {
      return {
        status: 'VALID_GERMAN',
        reply: 'Sehr gerne! Möchten Sie noch etwas Süßes dazu, wie ein Stück Kuchen?',
        translationTr: 'Memnuniyetle! Yanında bir dilim pasta gibi tatlı bir şey de ister misiniz?',
        phonetic: '[zer ger-nı! möh-tın zi noh et-vas zü:-sıs da-tsu, vi ayn ştük ku-hın?]',
        grammarTip: '"Möchten Sie..." kalıbı kibar teklif ve siparişlerde kullanılır.',
        correction: { hasError: false },
        hintForUser: 'Ja, gerne ein Stück Apfelkuchen bitte. (Evet, bir dilim elmalı pasta lütfen.)',
        keyVocabulary: [
          { word: 'Kuchen', article: 'der', meaningTr: 'Pasta / Kek', example: 'Ein Stück Kuchen bitte.' }
        ]
      };
    }
  }

  // General safe neutral continuation (NO FALSE "Sehr gut!" praise on unknown text)
  return {
    status: 'VALID_GERMAN',
    reply: `Verstehe, ${userName || 'mein Freund'}. Kannst du mir das genauer auf Deutsch erklären?`,
    translationTr: `Anlıyorum, ${userName || 'arkadaşım'}. Bunu bana Almanca olarak biraz daha detaylı açıklayabilir misin?`,
    phonetic: `[fer-şte-hı, ${userName || 'mayn froynt'}. kanst du mir das ge-naw-ır awf doytç er-kle-rın?]`,
    grammarTip: 'Düşüncelerinizi açıklarken "weil..." (çünkü) bağlacı ile devam edebilirsiniz.',
    correction: { hasError: false },
    hintForUser: 'Ich denke, dass... (Bence / Düşünüyorum ki...)'
  };
}

/* =======================================================================
   4. SESSION ASSESSMENT REPORT GENERATION
   ======================================================================= */

export async function generateSessionAssessmentReport(params: {
  sessionId: string;
  scenario: AITeacherScenario;
  turns: Array<{
    sender: 'ai' | 'user';
    text: string;
    correction?: TeacherCorrection;
    keyVocabulary?: KeyVocabItem[];
  }>;
  durationSeconds: number;
  userLevel: string;
  userName: string;
}): Promise<AISessionReport> {
  const { sessionId, scenario, turns, durationSeconds, userLevel, userName } = params;

  const userTurns = turns.filter(t => t.sender === 'user');
  const correctionsSummary: AISessionReport['correctionsSummary'] = [];
  const learnedVocabMap = new Map<string, KeyVocabItem>();

  turns.forEach(t => {
    if (t.correction && t.correction.hasError && t.correction.correctedPart) {
      correctionsSummary.push({
        wrong: t.correction.originalWrongPart || 'Orijinal ifade',
        correct: t.correction.correctedPart,
        explanation: t.correction.explanationTr || 'Doğru kullanım',
        type: t.correction.errorType || 'GRAMMAR'
      });
    }
    if (t.keyVocabulary) {
      t.keyVocabulary.forEach(v => {
        learnedVocabMap.set(v.word, v);
      });
    }
  });

  const baseCount = Math.max(1, userTurns.length);
  const errorRatio = correctionsSummary.length / baseCount;
  
  const grammarScore = Math.max(50, Math.min(98, Math.round(92 - errorRatio * 25)));
  const vocabularyScore = Math.max(55, Math.min(98, Math.round(88 + Math.min(10, userTurns.length * 2) - errorRatio * 15)));
  const pronunciationScore = Math.max(60, Math.min(96, Math.round(90 - errorRatio * 10)));
  const fluencyScore = Math.max(55, Math.min(98, Math.round(85 + Math.min(12, Math.floor(durationSeconds / 45)))));
  
  const overallScore = Math.round(
    grammarScore * 0.3 +
    vocabularyScore * 0.25 +
    pronunciationScore * 0.25 +
    fluencyScore * 0.2
  );

  const growthRecommendations: string[] = [];
  let recommendedLessonTopicId = 'articles';
  let recommendedLessonTitle = 'Almanca İsimler & der/die/das Artikelleri';

  if (correctionsSummary.some(c => c.type === 'ARTICLE' || c.explanation.includes('Akkusativ') || c.explanation.includes('Dativ'))) {
    growthRecommendations.push('İsimlerin artikellerine (der, die, das) ve Akkusativ (-i hali) çekimlerine dikkat etmelisin.');
    recommendedLessonTopicId = 'articles';
    recommendedLessonTitle = 'Ders 2: der / die / das Artikeller ve İsimler';
  } else if (correctionsSummary.some(c => c.type === 'CONJUGATION' || c.type === 'GRAMMAR' || c.explanation.includes('fiil'))) {
    growthRecommendations.push('Fiil çekimlerini şahıs zamirlerine (ich, du, er/sie/es) göre tam eşleştirmelisin.');
    recommendedLessonTopicId = 'verbs_conjugation';
    recommendedLessonTitle = 'Ders 3: Temel Fiil Çekimleri (Präsens)';
  } else {
    growthRecommendations.push('Cümle kurma hızın ve doğal akıcılığın harika. Daha zengin bağlaçlar (weil, dass, aber) ekleyebilirsin.');
    recommendedLessonTopicId = 'conversation_practice';
    recommendedLessonTitle = 'Ders 15: İleri Düzey Konuşma & Diyalog Simülasyonu';
  }

  const minutes = Math.max(1, Math.round(durationSeconds / 60));
  let motivationMessage = `Başarılı bir oturum, ${userName || 'Ufuk'}! Bugün ${minutes} dakika boyunca ${scenario.title} senaryosunda Almanca pratik yaptın.`;
  if (overallScore >= 90) {
    motivationMessage += ' Dilbilgisi ve kelime kullanımın son derece başarılı!';
  } else if (overallScore >= 75) {
    motivationMessage += ' Cümle kurma cesaretin ve telaffuzun çok iyi, her gün konuşmaya devam et!';
  } else {
    motivationMessage += ' Hatalar en iyi öğrenme fırsatıdır; pratik yaptıkça çok daha rahat konuştuğunu göreceksin!';
  }

  const coinsEarned = 25 + Math.min(50, minutes * 5);
  const xpEarned = 50 + Math.min(100, minutes * 10);

  return {
    sessionId,
    timestamp: Date.now(),
    scenarioId: scenario.id,
    scenarioTitle: scenario.title,
    durationSeconds,
    totalTurns: userTurns.length,
    overallScore,
    grammarScore,
    vocabularyScore,
    pronunciationScore,
    fluencyScore,
    correctionsSummary,
    learnedVocabulary: Array.from(learnedVocabMap.values()),
    growthRecommendations,
    recommendedLessonTopicId,
    recommendedLessonTitle,
    motivationMessage,
    coinsEarned,
    xpEarned
  };
}

export function saveSessionLocally(report: AISessionReport): void {
  try {
    if (typeof localStorage === 'undefined') return;
    const existingStr = localStorage.getItem('glotvia_ai_session_reports') || '[]';
    const reports: AISessionReport[] = JSON.parse(existingStr);
    reports.unshift(report);
    const trimmed = reports.slice(0, 30);
    localStorage.setItem('glotvia_ai_session_reports', JSON.stringify(trimmed));
  } catch (e) {
    console.warn('Failed to save session report to localStorage:', e);
  }
}

export function getSavedSessionReports(): AISessionReport[] {
  try {
    if (typeof localStorage === 'undefined') return [];
    const existingStr = localStorage.getItem('glotvia_ai_session_reports') || '[]';
    return JSON.parse(existingStr);
  } catch (e) {
    return [];
  }
}
