import React, { useState } from 'react';
import { X, BookOpen, Volume2, Award, Sparkles, HelpCircle, Check, Copy, ExternalLink, Lightbulb, ChevronRight } from 'lucide-react';

export type StudyToolTab = 'grammar' | 'phonetics' | 'exam_tips' | 'idioms' | 'support';

interface GermanStudyToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: StudyToolTab;
}

export const GermanStudyToolsModal: React.FC<GermanStudyToolsModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'grammar'
}) => {
  const [activeTab, setActiveTab] = useState<StudyToolTab>(initialTab);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const navTabs = [
    { id: 'grammar' as StudyToolTab, label: 'Gramer Rehberi', icon: BookOpen, color: 'text-amber-400' },
    { id: 'phonetics' as StudyToolTab, label: 'Fonetik & Okuma', icon: Volume2, color: 'text-cyan-400' },
    { id: 'exam_tips' as StudyToolTab, label: 'Goethe Taktikleri', icon: Award, color: 'text-emerald-400' },
    { id: 'idioms' as StudyToolTab, label: 'Günün Deyimleri', icon: Sparkles, color: 'text-purple-400' },
    { id: 'support' as StudyToolTab, label: 'Öğrenci Destek', icon: HelpCircle, color: 'text-blue-400' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl p-5 sm:p-7 space-y-5 shadow-2xl my-6 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-xl shrink-0 shadow-md">
              💡
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">Almanca Yardımcı Araçlar &amp; Rehberler</h3>
              <p className="text-xs text-slate-400">A1 Pratik İpuçları, Kural Tabloları ve Sınav Taktikleri</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar pb-1 shrink-0">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md font-black'
                    : 'bg-slate-950/70 text-slate-300 border border-slate-800 hover:border-slate-700 hover:text-white'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : tab.color}`} />
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          
          {/* TAB 1: GRAMMAR GUIDE */}
          {activeTab === 'grammar' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              
              {/* Artikel Kuralları */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center space-x-2 text-amber-400 text-xs font-black">
                  <span className="text-base">📌</span>
                  <span>1. Artikel İpuçları (der / die / das)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="p-3 bg-blue-950/30 border border-blue-500/30 rounded-xl space-y-1">
                    <span className="text-blue-300 font-black">DER (Eril)</span>
                    <p className="text-[11px] text-slate-300">Günler, aylar, mevsimler, yönler.</p>
                    <div className="text-[10px] text-blue-200 font-mono">Ekler: -er, -ling, -or, -ist</div>
                    <div className="text-[10px] text-slate-400 italic">Örn: der Montag, der Lehrer</div>
                  </div>
                  <div className="p-3 bg-rose-950/30 border border-rose-500/30 rounded-xl space-y-1">
                    <span className="text-rose-300 font-black">DIE (Dişil)</span>
                    <p className="text-[11px] text-slate-300">Dişi varlıklar, çoğu -e ile bitenler.</p>
                    <div className="text-[10px] text-rose-200 font-mono">Ekler: -ung, -heit, -keit, -tion</div>
                    <div className="text-[10px] text-slate-400 italic">Örn: die Wohnung, die Musik</div>
                  </div>
                  <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl space-y-1">
                    <span className="text-emerald-300 font-black">DAS (Nötr)</span>
                    <p className="text-[11px] text-slate-300">Küçültmeler, mastar isimler.</p>
                    <div className="text-[10px] text-emerald-200 font-mono">Ekler: -chen, -lein, -um, -ment</div>
                    <div className="text-[10px] text-slate-400 italic">Örn: das Mädchen, das Auto</div>
                  </div>
                </div>
              </div>

              {/* Fiil Çekimleri Formülü */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center space-x-2 text-indigo-400 text-xs font-black">
                  <span className="text-base">⚙️</span>
                  <span>2. Düzenli Fiil Çekim Formülü (Präsens)</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg flex justify-between">
                    <span className="text-slate-400">ich (ben):</span>
                    <span className="font-bold text-amber-300">-e (komme)</span>
                  </div>
                  <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg flex justify-between">
                    <span className="text-slate-400">du (sen):</span>
                    <span className="font-bold text-amber-300">-st (kommst)</span>
                  </div>
                  <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg flex justify-between">
                    <span className="text-slate-400">er/sie/es (o):</span>
                    <span className="font-bold text-amber-300">-t (kommt)</span>
                  </div>
                  <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg flex justify-between">
                    <span className="text-slate-400">wir (biz):</span>
                    <span className="font-bold text-emerald-300">-en (kommen)</span>
                  </div>
                  <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg flex justify-between">
                    <span className="text-slate-400">ihr (sizler):</span>
                    <span className="font-bold text-emerald-300">-t (kommt)</span>
                  </div>
                  <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg flex justify-between">
                    <span className="text-slate-400">sie/Sie (onlar/Siz):</span>
                    <span className="font-bold text-emerald-300">-en (kommen)</span>
                  </div>
                </div>
              </div>

              {/* Akkusativ vs Dativ */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2 text-xs">
                <div className="flex items-center space-x-2 text-cyan-400 font-black">
                  <span className="text-base">🔄</span>
                  <span>3. Akkusativ (-i hali) ve Dativ (-e hali) Değişimi</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                    <span className="font-bold text-cyan-300">Akkusativ (Kimi? Neyi?)</span>
                    <p className="text-slate-400">Sadece <strong>der</strong> değişir: <strong className="text-white">der ➔ den</strong></p>
                    <p className="text-slate-500">die ➔ die | das ➔ das</p>
                  </div>
                  <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                    <span className="font-bold text-purple-300">Dativ (Kime? Nerede?)</span>
                    <p className="text-slate-400">der/das ➔ <strong className="text-white">dem</strong></p>
                    <p className="text-slate-400">die ➔ <strong className="text-white">der</strong> (çoğul: den + n)</p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: PHONETICS & READING RULES */}
          {activeTab === 'phonetics' && (
            <div className="space-y-3 animate-in fade-in duration-150 text-xs">
              <div className="bg-gradient-to-r from-cyan-950/40 to-slate-900 border border-cyan-500/30 p-3 rounded-2xl">
                <span className="font-black text-cyan-300">🗣️ Almanca Harf Kombinasyonları ve Okunuşları</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  { combo: 'EI', sound: '"AY"', ex: 'mein, nein, zwei', tr: 'benim, hayır, iki' },
                  { combo: 'IE', sound: '"UZUN İ"', ex: 'sie, wie, hier', tr: 'o/onlar, nasıl, burada' },
                  { combo: 'EU / ÄU', sound: '"OY"', ex: 'heute, Häuser, Euro', tr: 'bugün, evler, avro' },
                  { combo: 'SCH', sound: '"Ş"', ex: 'Schule, schön, schnell', tr: 'okul, güzel, hızlı' },
                  { combo: 'SP / ST (Kelime başı)', sound: '"ŞP / ŞT"', ex: 'Sport, sprechen, Stadt', tr: 'spor, konuşmak, şehir' },
                  { combo: 'CH (a,o,u dan sonra)', sound: '"Sert H"', ex: 'Buch, machen, doch', tr: 'kitap, yapmak, elbette' },
                  { combo: 'CH (i,e,ä,ö,ü den sonra)', sound: '"Yumuşak H (ş gibi)"', ex: 'ich, nicht, möchten', tr: 'ben, değil, istemek' },
                  { combo: 'V', sound: '"F"', ex: 'Vater, viel, von', tr: 'baba, çok, -den' },
                  { combo: 'W', sound: '"V"', ex: 'wo, wie, wer', tr: 'nerede, nasıl, kim' },
                  { combo: 'Z', sound: '"TS"', ex: 'zehn, Zeit, Zimmer', tr: 'on, zaman, oda' },
                  { combo: 'SS / ß', sound: '"S"', ex: 'heißen, Straße, weiß', tr: 'adı olmak, cadde, beyaz' },
                  { combo: 'J', sound: '"Y"', ex: 'ja, Jahr, jetzt', tr: 'evet, yıl, şimdi' }
                ].map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-amber-300 font-mono text-sm">{item.combo}</span>
                      <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold text-[10px]">{item.sound}</span>
                    </div>
                    <div className="text-white font-medium text-[11px]">{item.ex}</div>
                    <div className="text-slate-400 text-[10px] italic">{item.tr}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: GOETHE EXAM TIPS */}
          {activeTab === 'exam_tips' && (
            <div className="space-y-3 animate-in fade-in duration-150 text-xs">
              <div className="bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/30 p-3 rounded-2xl">
                <span className="font-black text-emerald-300">🏆 Goethe A1 Sınavı Bölüm Taktikleri</span>
              </div>

              <div className="space-y-2.5">
                <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-1.5">
                  <div className="flex items-center space-x-2 text-amber-300 font-black">
                    <span>1. Hören (Dinleme) — 20 Dk</span>
                  </div>
                  <p className="text-slate-300 text-[11px]">Ses kaydı başlamadan önce <strong>soruları ve şıkları hızlıca okuyun</strong>. Sayılara, saatlere, tren peronlarına ve fiyatlara pür dikkat odaklanın. İkinci dinlemede emin olun.</p>
                </div>

                <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-1.5">
                  <div className="flex items-center space-x-2 text-cyan-300 font-black">
                    <span>2. Lesen (Okuma) — 25 Dk</span>
                  </div>
                  <p className="text-slate-300 text-[11px]">Kelimesi kelimesine çeviri yapmayın. Metindeki <strong>eşanlamlı kelimeleri (Synonyme)</strong> yakalayın. E-posta, ilan ve duyuru metinlerini tarama (skimming) tekniğiyle okuyun.</p>
                </div>

                <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-1.5">
                  <div className="flex items-center space-x-2 text-rose-300 font-black">
                    <span>3. Schreiben (Yazma) — 20 Dk</span>
                  </div>
                  <p className="text-slate-300 text-[11px]">Verilen 3 maddeyi (Leitpunkte) <strong>asla atlamayın</strong>. Her madde için 1-2 basit, net ve doğru cümle kurun. Hitap (&quot;Liebe/Lieber...&quot;) ve kapanışı (&quot;Viele Grüße&quot;) unutmayın.</p>
                </div>

                <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-1.5">
                  <div className="flex items-center space-x-2 text-emerald-300 font-black">
                    <span>4. Sprechen (Konuşma) — 15 Dk</span>
                  </div>
                  <p className="text-slate-300 text-[11px]">Kendini tanıtma kısmında isminizi harf harf kodlamaya (buchstabieren) ve telefon/posta numaranızı söylemeye hazır olun. Resimli kartlarda <strong>&ldquo;Können Sie bitte...?&rdquo;</strong> kalıbını güvenle kullanın.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: IDIOMS & DAILY TIPS */}
          {activeTab === 'idioms' && (
            <div className="space-y-3 animate-in fade-in duration-150 text-xs">
              <div className="bg-gradient-to-r from-purple-950/40 to-slate-900 border border-purple-500/30 p-3 rounded-2xl">
                <span className="font-black text-purple-300">✨ Günlük Hayatta En Sık Kullanılan Almanca Deyimler</span>
              </div>

              <div className="space-y-2.5">
                {[
                  { de: 'Ich drücke dir die Daumen!', tr: 'Sana şans diliyorum! (Başparmaklarımı sıkıyorum)', usage: 'Sınava veya mülakata giren birine söylenir.' },
                  { de: 'Ich verstehe nur Bahnhof.', tr: 'Hiçbir şey anlamıyorum. (Sadece tren garı anlıyorum)', usage: 'Karmaşık bir şeyi anlamadığınızda esprili ifade.' },
                  { de: 'Das ist nicht mein Bier!', tr: 'Bu beni ilgilendirmez! (Bu benim biram değil)', usage: 'Konunun sizin sorumluluğunuzda olmadığını belirtirken.' },
                  { de: 'Übung macht den Meister.', tr: 'Pratik ustalaştırır.', usage: 'Dil öğreniminde motivasyon için kullanılır.' },
                  { de: 'Alles in Butter!', tr: 'Her şey yolunda / Mükemmel!', usage: 'Durumun kontrol altında ve sorunsuz olduğunu ifade eder.' }
                ].map((idiom, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black text-amber-300">{idiom.de}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(idiom.de)}
                        className="p-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                        title="Kopyala"
                      >
                        {copiedText === idiom.de ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <p className="text-xs text-white font-semibold">{idiom.tr}</p>
                    <p className="text-[10px] text-slate-400 italic">Kullanım: {idiom.usage}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: STUDENT SUPPORT */}
          {activeTab === 'support' && (
            <div className="space-y-3.5 animate-in fade-in duration-150 text-xs">
              <div className="bg-gradient-to-r from-blue-950/40 to-slate-900 border border-blue-500/30 p-3 rounded-2xl">
                <span className="font-black text-blue-300">💬 Öğrenci Destek &amp; Soru-Cevap Hattı</span>
              </div>

              {feedbackSent ? (
                <div className="p-5 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl text-center space-y-2">
                  <div className="text-2xl">✅</div>
                  <h4 className="text-sm font-black text-emerald-300">Mesajınız Alındı!</h4>
                  <p className="text-xs text-slate-300">Glotvia eğitmen ekibi ve geliştiricilerimiz geri bildiriminizi inceleyip en kısa sürede dönüş yapacaktır.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setFeedbackSent(false);
                      setFeedbackMessage('');
                    }}
                    className="mt-2 px-4 py-1.5 bg-slate-900 text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-800"
                  >
                    Yeni Mesaj Yaz
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-slate-300 leading-relaxed">
                    Almanca müfredatında takıldığınız bir kural, sınav hazırlığı sorusu veya uygulama ile ilgili önerilerinizi doğrudan bize iletebilirsiniz:
                  </p>

                  <textarea
                    rows={4}
                    value={feedbackMessage}
                    onChange={(e) => setFeedbackMessage(e.target.value)}
                    placeholder="Sorunuzu, önerinizi veya geri bildiriminizi buraya yazınız..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />

                  <button
                    type="button"
                    disabled={!feedbackMessage.trim()}
                    onClick={() => {
                      if (feedbackMessage.trim()) {
                        setFeedbackSent(true);
                      }
                    }}
                    className={`w-full py-3 rounded-2xl font-black text-xs transition-all flex items-center justify-center space-x-2 ${
                      feedbackMessage.trim()
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md cursor-pointer'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <span>Mesajı Gönder</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
