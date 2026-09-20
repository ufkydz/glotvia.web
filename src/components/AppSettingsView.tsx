import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { 
  AppDisplaySettings, 
  AppThemeId, 
  FontSizeScale, 
  FontFamilyType, 
  BgEffectType, 
  APP_THEMES, 
  FONT_SIZES, 
  FONT_FAMILIES, 
  BG_EFFECTS, 
  loadDisplaySettings, 
  saveDisplaySettings, 
  DEFAULT_DISPLAY_SETTINGS 
} from '../utils/themeManager';
import { updateUserProfileData } from '../utils/authStorage';
import { restoreUserPurchases } from '../services/paymentService';
import { requestAccountDeletion, executeAccountDeletion } from '../services/accountDeletionService';
import { playSuccessChime, playCoinSound } from '../utils/audioEffects';
import { 
  Settings, Palette, User, ShieldCheck, RefreshCw, Trash2, 
  Sun, Moon, Type, Sparkles, Check, CheckCircle2, AlertCircle, 
  Edit3, Save, Crown, Mail, ShieldAlert, RotateCcw,
  Sliders, LogOut, Award, Flame, Coins, Key, ExternalLink,
  ChevronRight, ArrowRight, Star
} from 'lucide-react';
import { signOutUser } from '../services/authenticationService';
import { loadUserTokenState } from '../data/germanCurriculumData';
import { getUserTier, getTierDisplayName } from '../utils/tierPermissions';

interface AppSettingsViewProps {
  currentUser: UserProfile | null;
  onUserUpdate?: (updated: UserProfile) => void;
  onAccountDeleted?: () => void;
  onLogout?: () => void;
  onOpenPrivacyPolicy?: () => void;
  onOpenAuth?: () => void;
  onOpenPricing?: (tab?: 'plans' | 'credits') => void;
  initialTab?: 'profile' | 'vip' | 'theme' | 'security';
}

export const AppSettingsView: React.FC<AppSettingsViewProps> = ({
  currentUser,
  onUserUpdate,
  onAccountDeleted,
  onLogout,
  onOpenPrivacyPolicy,
  onOpenAuth,
  onOpenPricing,
  initialTab = 'profile'
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'vip' | 'theme' | 'security'>(initialTab);
  
  // Theme & Display Settings
  const [displaySettings, setDisplaySettings] = useState<AppDisplaySettings>(() => loadDisplaySettings());
  const [themeNotice, setThemeNotice] = useState(false);

  // Token State (Coins & Streaks)
  const [tokenState, setTokenState] = useState(() => loadUserTokenState());

  // Logout state
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Profile Edit
  const [name, setName] = useState(currentUser?.name || '');
  const [avatar, setAvatar] = useState(currentUser?.avatar || '🚀');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Restore Purchases
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreMessage, setRestoreMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Delete Account Flow
  const [deleteEmailInput, setDeleteEmailInput] = useState('');
  const [isRequestingDeletion, setIsRequestingDeletion] = useState(false);
  const [deletionRequested, setDeletionRequested] = useState(false);
  const [receivedToken, setReceivedToken] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isExecutingDelete, setIsExecutingDelete] = useState(false);

  const AVATARS = ['🌟', '🚀', '🎓', '👑', '🦁', '🦊', '🦉', '🌍', '⚡', '💡', '💎', '🔥'];

  useEffect(() => {
    setDisplaySettings(loadDisplaySettings());
    setTokenState(loadUserTokenState());
  }, []);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setAvatar(currentUser.avatar || '🚀');
    }
  }, [currentUser]);

  // Handle Theme Update
  const handleUpdateTheme = (updated: Partial<AppDisplaySettings>) => {
    const fresh = { ...displaySettings, ...updated };
    setDisplaySettings(fresh);
    saveDisplaySettings(fresh);
    playSuccessChime();
    setThemeNotice(true);
    setTimeout(() => setThemeNotice(false), 2500);
  };

  // Quick 1-click Light/Dark Toggle
  const currentTheme = APP_THEMES.find(t => t.id === displaySettings.themeId) || APP_THEMES[0];
  const handleToggleLightDark = () => {
    const nextThemeId: AppThemeId = currentTheme.isLight ? 'dark-obsidian' : 'light-daylight';
    handleUpdateTheme({ themeId: nextThemeId });
  };

  // Save Profile Changes
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      if (onOpenAuth) onOpenAuth();
      return;
    }
    const updated = updateUserProfileData(name, avatar);
    if (onUserUpdate) onUserUpdate(updated);
    setSaveSuccess(true);
    playSuccessChime();
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Restore Purchases
  const handleRestorePurchases = async () => {
    if (!currentUser) {
      if (onOpenAuth) onOpenAuth();
      return;
    }
    setIsRestoring(true);
    setRestoreMessage(null);
    const res = await restoreUserPurchases(currentUser);
    setIsRestoring(false);
    
    if (res.success) {
      setRestoreMessage({ text: res.message, isError: false });
      playSuccessChime();
      const stored = localStorage.getItem('polyglot_active_user_v1');
      if (stored && onUserUpdate) {
        try {
          onUserUpdate(JSON.parse(stored));
        } catch {}
      }
    } else {
      setRestoreMessage({ text: res.message, isError: true });
    }
  };

  // Request Account Deletion
  const handleRequestDeletion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setDeleteError(null);

    const cleanInput = deleteEmailInput.trim().toLowerCase();
    const cleanCurrent = currentUser.email.trim().toLowerCase();

    if (!cleanInput) {
      setDeleteError('Lütfen hesabınızda kayıtlı e-posta adresinizi giriniz.');
      return;
    }

    if (cleanInput !== cleanCurrent) {
      setDeleteError('Girdiğiniz e-posta adresi, mevcut hesabınızın e-posta adresiyle eşleşmiyor.');
      return;
    }

    setIsRequestingDeletion(true);
    const res = await requestAccountDeletion(currentUser, cleanInput);
    setIsRequestingDeletion(false);

    if (res.success) {
      setDeletionRequested(true);
      if (res.rawToken) {
        setReceivedToken(res.rawToken);
      }
    } else {
      setDeleteError(res.message);
    }
  };

  const handleExecuteDeletionWithToken = async () => {
    if (!receivedToken.trim()) {
      setDeleteError('Lütfen silme doğrulama tokenını giriniz.');
      return;
    }

    setIsExecutingDelete(true);
    setDeleteError(null);

    const res = await executeAccountDeletion(receivedToken.trim());
    setIsExecutingDelete(false);

    if (res.success) {
      alert('Hesabınız başarıyla silindi.');
      if (onAccountDeleted) onAccountDeleted();
    } else {
      setDeleteError(res.message);
    }
  };

  const handleLogoutClick = async () => {
    setIsLoggingOut(true);
    try {
      await signOutUser();
      if (onLogout) {
        onLogout();
      }
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      setIsLoggingOut(false);
      setIsLogoutConfirmOpen(false);
    }
  };

  const currentTier = getUserTier(currentUser);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-20 max-w-5xl mx-auto">
      
      {/* ========================================================
          1. HEADER PROFILE HERO CARD (CONSOLIDATED)
      ======================================================== */}
      <div className="bg-gradient-to-br from-indigo-950/80 via-slate-900 to-cyan-950/70 border border-slate-700/60 rounded-2xl p-3.5 sm:p-5 shadow-xl relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3.5">
          {/* User Info & Identity */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-amber-400 via-yellow-500 to-amber-600 p-[1.5px] shadow-md shadow-amber-500/20 shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-2xl sm:text-3xl">
                {currentUser?.avatar || avatar || '🎓'}
              </div>
            </div>
            
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <h1 className="text-base sm:text-lg font-bold text-white truncate">
                  {currentUser?.name || name || 'Almanca Öğrencisi'}
                </h1>
                
                {/* Tier Badge */}
                <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm ${
                  currentTier === 'plus'
                    ? 'bg-gradient-to-r from-purple-500 to-amber-400 text-white'
                    : currentTier === 'premium'
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950'
                    : 'bg-slate-800 text-slate-300 border border-slate-700'
                }`}>
                  <Crown className="w-2.5 h-2.5" />
                  {currentTier === 'plus' ? 'PLUS VIP' : currentTier === 'premium' ? 'PREMIUM VIP' : 'Ücretsiz'}
                </span>
              </div>

              <p className="text-[11px] text-slate-400 font-mono truncate">
                {currentUser?.email || 'ogrenci@glotvia.de'}
              </p>

              {/* Status Stats Pills */}
              <div className="flex items-center space-x-1.5 pt-0.5">
                <div className="px-2 py-0.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold flex items-center space-x-1">
                  <span>🪙</span>
                  <span>{tokenState.coins} Kredi</span>
                </div>
                <div className="px-2 py-0.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[10px] font-bold flex items-center space-x-1">
                  <span>🔥</span>
                  <span>{tokenState.streakDays} Gün Seri</span>
                </div>
                <div className="px-2 py-0.5 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold flex items-center space-x-1">
                  <span>🇩🇪</span>
                  <span>A1 Seviye</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Header Actions: Light/Dark Toggle & Fast Logout */}
          <div className="flex items-center gap-2 shrink-0 self-start md:self-auto">
            <button
              type="button"
              onClick={handleToggleLightDark}
              className={`px-2.5 py-1.5 rounded-xl font-bold text-[11px] transition-all flex items-center space-x-1.5 cursor-pointer shadow-sm active:scale-95 ${
                currentTheme.isLight
                  ? 'bg-amber-400 text-slate-950 shadow-amber-400/30 ring-1 ring-amber-300'
                  : 'bg-slate-800/90 text-cyan-300 border border-cyan-500/40 hover:bg-slate-700'
              }`}
              title="Açık ve Koyu Mod Arasında Geçiş Yap"
            >
              {currentTheme.isLight ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
              <span>{currentTheme.isLight ? '☀️ Açık Mod' : '🌙 Koyu Mod'}</span>
            </button>

            {currentUser && (
              <button
                type="button"
                onClick={() => setIsLogoutConfirmOpen(true)}
                className="px-2.5 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/40 text-rose-300 hover:text-white rounded-xl text-[11px] font-bold transition-all flex items-center space-x-1 cursor-pointer shadow-sm active:scale-95"
                title="Hesaptan Çıkış Yap"
              >
                <LogOut className="w-3 h-3 text-rose-400" />
                <span>Çıkış</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Notification Indicator */}
        {themeNotice && (
          <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center space-x-2 text-emerald-400 font-bold text-xs animate-in fade-in">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Ayarlar anında uygulandı ve hafızaya kaydedildi!</span>
          </div>
        )}
      </div>

      {/* ========================================================
          2. MAIN TAB NAVIGATION BAR (4 POLISHED SECTIONS)
      ======================================================== */}
      <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar border-b border-slate-800 pb-1.5">
        
        {/* TAB 1: PROFILE */}
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'profile'
              ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-md shadow-indigo-500/25'
              : 'bg-slate-900/90 text-slate-300 hover:text-white border border-slate-800'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>👤 Profil Bilgileri</span>
        </button>

        {/* TAB 2: VIP & CREDITS */}
        <button
          type="button"
          onClick={() => setActiveTab('vip')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'vip'
              ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-md shadow-amber-500/25'
              : 'bg-slate-900/90 text-slate-300 hover:text-white border border-slate-800'
          }`}
        >
          <Crown className="w-3.5 h-3.5 text-amber-400" />
          <span>👑 VIP &amp; Krediler</span>
        </button>

        {/* TAB 3: THEME & DISPLAY */}
        <button
          type="button"
          onClick={() => setActiveTab('theme')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'theme'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 shadow-md shadow-cyan-500/25'
              : 'bg-slate-900/90 text-slate-300 hover:text-white border border-slate-800'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>🎨 Tema &amp; Görünüm</span>
        </button>

        {/* TAB 4: SECURITY & DELETE */}
        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'security'
              ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25'
              : 'bg-slate-900/90 text-slate-300 hover:text-white border border-slate-800'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>🛡️ Güvenlik &amp; Çıkış</span>
        </button>
      </div>

      {/* ========================================================
          TAB 1: PROFİL BİLGİLERİ VE HESAP
      ======================================================== */}
      {activeTab === 'profile' && (
        <div className="space-y-4">
          {currentUser ? (
            <form onSubmit={handleSaveProfile} className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4 shadow-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                  Kişisel Profil Bilgilerini Düzenle
                </h3>
              </div>

              {/* Name Input */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Adınız &amp; Soyadınız
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Adınızı giriniz..."
                  className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700/80 rounded-xl text-white text-xs sm:text-sm focus:border-indigo-400 focus:outline-none transition-colors"
                />
              </div>

              {/* Avatar Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1.5">
                  Profil Avatarınız (Emoji Simgesi)
                </label>
                <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
                  {AVATARS.map((av) => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => setAvatar(av)}
                      className={`h-9 w-full rounded-xl text-base flex items-center justify-center transition-all cursor-pointer ${
                        avatar === av
                          ? 'bg-indigo-600/40 border-2 border-indigo-400 scale-105 shadow-md'
                          : 'bg-slate-950/60 border border-slate-800 hover:border-slate-600 hover:bg-slate-900'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              {/* Account Meta Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Email and verification */}
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-0.5">
                  <span className="text-[10px] text-slate-400 font-bold block">Kayıtlı E-posta:</span>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-white text-[11px] font-bold truncate">{currentUser.email}</span>
                    {currentUser.isEmailVerified ? (
                      <span className="px-1.5 py-0.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-md text-[9px] font-bold shrink-0">
                        ✓ Onaylı
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={onOpenAuth}
                        className="px-1.5 py-0.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 rounded-md text-[9px] font-bold shrink-0 cursor-pointer"
                      >
                        Onayla →
                      </button>
                    )}
                  </div>
                </div>

                {/* Membership tier */}
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-0.5">
                  <span className="text-[10px] text-slate-400 font-bold block">Üyelik Düzeyi:</span>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-[11px] flex items-center gap-1">
                      <Crown className="w-3 h-3 text-amber-400" />
                      {getTierDisplayName(currentTier)}
                    </span>
                    {onOpenPricing && (
                      <button
                        type="button"
                        onClick={() => onOpenPricing('plans')}
                        className="text-amber-400 hover:text-amber-300 text-[10px] font-bold underline cursor-pointer"
                      >
                        Paketleri Gör →
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {saveSuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Profil bilgileriniz başarıyla kaydedildi!</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
                <button
                  type="submit"
                  className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-500 hover:brightness-110 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-98"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Değişiklikleri Kaydet</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsLogoutConfirmOpen(true)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-98"
                  title="Hesaptan Çıkış Yap"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400" />
                  <span>Hesaptan Çıkış Yap</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-3 shadow-lg">
              <User className="w-10 h-10 text-slate-500 mx-auto" />
              <h3 className="text-sm font-bold text-white">Giriş Yapmadınız</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Profil bilgilerinizi kaydetmek ve tüm derslerinize her cihazdan erişmek için ücretsiz giriş yapın.
              </p>
              <button
                type="button"
                onClick={onOpenAuth}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold text-xs shadow-md cursor-pointer"
              >
                Giriş Yap / Üye Ol
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          TAB 2: VIP, ABONELİK VE KREDİ MERKEZİ
      ======================================================== */}
      {activeTab === 'vip' && (
        <div className="space-y-4">
          
          {/* Current VIP Status Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-950/60 via-slate-900 to-yellow-950/40 border border-amber-500/40 space-y-3.5 shadow-xl">
            <div className="flex items-center justify-between flex-wrap gap-2.5">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                  <Crown className="w-3 h-3" />
                  Abonelik &amp; VIP Ayrıcalıkları
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Mevcut Planınız: <span className="text-amber-300">{getTierDisplayName(currentTier)}</span>
                </h3>
              </div>

              {onOpenPricing && (
                <button
                  type="button"
                  onClick={() => onOpenPricing('plans')}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                >
                  <Crown className="w-3.5 h-3.5" />
                  <span>VIP Paketleri İncele</span>
                </button>
              )}
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              VIP üyelerimiz tüm A1 derslerine sınırsız erişir, canlı Goethe sınav simülatörü ve AI sesli telaffuz koçluğunu sınırsız kullanır.
            </p>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-white/10 space-y-0.5">
                <div className="text-amber-400 text-xs font-bold">🎙️ Canlı Telaffuz &amp; AI</div>
                <div className="text-[10px] text-slate-400">Mikrofonla konuşma analizi</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-white/10 space-y-0.5">
                <div className="text-amber-400 text-xs font-bold">🏆 Goethe Sınavları</div>
                <div className="text-[10px] text-slate-400">A1 Resmi sınav simülasyonu</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-white/10 space-y-0.5">
                <div className="text-amber-400 text-xs font-bold">⚡ Sınırsız Pratik</div>
                <div className="text-[10px] text-slate-400">Tüm dersler ve kelime kartları</div>
              </div>
            </div>
          </div>

          {/* Credits & Coin Wallet Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 shadow-lg">
            <div className="flex items-center justify-between flex-wrap gap-2.5">
              <div className="space-y-0.5">
                <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                  <span>🪙</span>
                  <span>Kredi &amp; Jeton Cüzdanı</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Kredileriniz ile kilitli ileri seviye dersleri açabilir veya ekstra alıştırmalar yapabilirsiniz.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <div className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono font-bold text-sm flex items-center space-x-1">
                  <span>🪙</span>
                  <span>{tokenState.coins}</span>
                </div>

                {onOpenPricing && (
                  <button
                    type="button"
                    onClick={() => onOpenPricing('credits')}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow cursor-pointer transition-all active:scale-95"
                  >
                    + Kredi Yükle
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Restore Purchases Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 shadow-lg">
            <div className="space-y-0.5">
              <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                Satın Alımları Geri Yükle
              </h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Cihaz değiştirdiğinizde veya uygulamayı yeniden yüklediğinizde, satın aldığınız PRO / VIP paketlerinizi geri yükleyebilirsiniz.
              </p>
            </div>

            {restoreMessage && (
              <div className={`p-3 rounded-xl text-xs flex items-start gap-2 border ${
                restoreMessage.isError
                  ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                  : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              }`}>
                {restoreMessage.isError ? (
                  <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                )}
                <span>{restoreMessage.text}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleRestorePurchases}
              disabled={isRestoring}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-amber-300 hover:text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-all disabled:opacity-50 active:scale-98"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRestoring ? 'animate-spin' : ''}`} />
              <span>{isRestoring ? 'Kontrol Ediliyor...' : 'Satın Alımları Şimdi Geri Yükle'}</span>
            </button>
          </div>

        </div>
      )}

      {/* ========================================================
          TAB 3: TEMA VE GÖRÜNÜM AYARLARI
      ======================================================== */}
      {activeTab === 'theme' && (
        <div className="space-y-4">
          
          {/* Quick Info Box */}
          <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between flex-wrap gap-3 shadow-lg">
            <div className="space-y-0.5">
              <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-cyan-400" />
                Aktif Tema: <span className="text-cyan-300">{currentTheme.emoji} {currentTheme.name}</span>
              </h3>
              <p className="text-[11px] text-slate-300">
                Aşağıdan dilediğiniz renk paletine tıklayarak uygulamayı anında özelleştirebilirsiniz.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setDisplaySettings(DEFAULT_DISPLAY_SETTINGS);
                saveDisplaySettings(DEFAULT_DISPLAY_SETTINGS);
                playCoinSound();
                setThemeNotice(true);
                setTimeout(() => setThemeNotice(false), 2000);
              }}
              className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white rounded-xl text-[11px] font-bold transition-all flex items-center space-x-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Varsayılana Sıfırla</span>
            </button>
          </div>

          {/* 8 Theme Cards Grid */}
          <div>
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Mevcut Renk Temaları ({APP_THEMES.length} Seçenek)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {APP_THEMES.map((theme) => {
                const isSelected = displaySettings.themeId === theme.id;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => handleUpdateTheme({ themeId: theme.id })}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between space-y-2 ${
                      isSelected
                        ? 'border-cyan-400 bg-gradient-to-b from-cyan-950/70 to-slate-900 shadow-md shadow-cyan-500/20 ring-1 ring-cyan-400/80 scale-[1.01]'
                        : 'border-slate-800 bg-slate-900/80 hover:bg-slate-850 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">{theme.emoji}</span>
                        <div>
                          <h4 className="text-xs font-bold text-white">{theme.name}</h4>
                          <span className="text-[9px] text-slate-400">
                            {theme.isLight ? '☀️ Ferah Açık' : '🌙 Koyu / Canlı'}
                          </span>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center font-bold text-[10px] shadow">
                          ✓
                        </div>
                      )}
                    </div>

                    <p className="text-[10px] text-slate-400 line-clamp-2">
                      {theme.description}
                    </p>

                    {/* Palette Swatches */}
                    <div className="pt-1.5 border-t border-white/10 flex items-center justify-between w-full">
                      <span className="text-[9px] uppercase font-mono text-slate-500">Renkler</span>
                      <div className="flex items-center space-x-1">
                        <span 
                          className="w-2.5 h-2.5 rounded-full border border-white/20" 
                          style={{ backgroundColor: theme.primaryColor }}
                        />
                        <span 
                          className="w-2.5 h-2.5 rounded-full border border-white/20" 
                          style={{ backgroundColor: theme.secondaryColor }}
                        />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Typography / Font Size Section */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div className="space-y-0.5">
              <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-cyan-400" />
                Yazı Boyutu (Font Büyüklüğü)
              </h3>
              <p className="text-[11px] text-slate-400">
                Almanca örnek cümleleri ve gramer açıklamalarını daha rahat okumak için boyutu seçin.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {FONT_SIZES.map((fs) => {
                const isSelected = displaySettings.fontSize === fs.id;
                return (
                  <button
                    key={fs.id}
                    type="button"
                    onClick={() => handleUpdateTheme({ fontSize: fs.id })}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer space-y-0.5 ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-950/70 text-white shadow-md ring-1 ring-cyan-400/50'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-[10px] font-bold text-slate-400">{fs.label}</div>
                    <div className="text-sm font-bold text-cyan-300">{fs.scale}</div>
                    <p className="text-[9px] text-slate-500">{fs.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Font Family Section */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div className="space-y-0.5">
              <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                Yazı Tipi (Font Ailesi)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {FONT_FAMILIES.map((ff) => {
                const isSelected = displaySettings.fontFamily === ff.id;
                return (
                  <button
                    key={ff.id}
                    type="button"
                    onClick={() => handleUpdateTheme({ fontFamily: ff.id })}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer space-y-0.5 ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-950/70 text-white shadow-md ring-1 ring-cyan-400/50'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white">{ff.name}</h4>
                      {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                    </div>
                    <p className="text-[9px] text-slate-500">{ff.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Background Atmosphere */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div className="space-y-0.5">
              <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Arka Plan Dokusu &amp; Işık Efekti
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {BG_EFFECTS.map((bg) => {
                const isSelected = displaySettings.bgEffect === bg.id;
                return (
                  <button
                    key={bg.id}
                    type="button"
                    onClick={() => handleUpdateTheme({ bgEffect: bg.id })}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer space-y-0.5 ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-950/70 text-white shadow-md ring-1 ring-cyan-400/50'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-base">{bg.icon}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                    </div>
                    <h4 className="text-xs font-bold text-white">{bg.label}</h4>
                    <p className="text-[9px] text-slate-500">{bg.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================
          TAB 4: GÜVENLİK, GİZLİLİK VE ÇIKIŞ
      ======================================================== */}
      {activeTab === 'security' && (
        <div className="space-y-4">
          
          {/* Privacy Policy Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 shadow-lg">
            <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Gizlilik Politikası ve Güvenlik Standartları
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Verileriniz Firebase Firestore bulut altyapısında güvenle saklanmaktadır. Veri güvenliği politikamızı ve kullanıcı haklarınızı dilediğiniz an inceleyebilirsiniz.
            </p>
            {onOpenPrivacyPolicy && (
              <button
                type="button"
                onClick={onOpenPrivacyPolicy}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-cyan-300 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1 cursor-pointer"
              >
                <span>Gizlilik Politikası Metnini Oku</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Session & Logout Box */}
          {currentUser && (
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                  <LogOut className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-white">
                    Oturum Güvenliği &amp; Hesaptan Çıkış
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Cihazınızdaki aktif Firebase oturumunu güvenle sonlandırıp giriş ekranına dönün.
                  </p>
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setIsLogoutConfirmOpen(true)}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-98"
                >
                  <LogOut className="w-3.5 h-3.5 text-amber-400" />
                  <span>Oturumu Kapat (Hesaptan Çıkış Yap)</span>
                </button>
              </div>
            </div>
          )}

          {/* Delete Account Box */}
          {currentUser && (
            <div className="p-4 sm:p-5 rounded-2xl bg-rose-950/30 border border-rose-500/30 space-y-3 shadow-lg">
              <h3 className="text-xs sm:text-sm font-bold text-rose-300 flex items-center gap-1.5">
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                Hesabı Kalıcı Olarak Sil
              </h3>
              
              {!deletionRequested ? (
                <form onSubmit={handleRequestDeletion} className="space-y-3">
                  <p className="text-xs text-rose-200/80 leading-relaxed">
                    Hesabınızı sildiğinizde ders ilerlemeleriniz, kelime kayıtlarınız ve jetonlarınız kalıcı olarak kaldırılır.
                  </p>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Onaylamak için kayıtlı e-posta adresinizi giriniz:
                    </label>
                    <input
                      type="email"
                      placeholder={currentUser.email}
                      value={deleteEmailInput}
                      onChange={(e) => setDeleteEmailInput(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950/80 border border-rose-500/40 rounded-xl text-white font-mono text-xs focus:border-rose-400 focus:outline-none"
                    />
                  </div>

                  {deleteError && (
                    <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{deleteError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isRequestingDeletion || !deleteEmailInput.trim()}
                    className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-all disabled:opacity-40"
                  >
                    <Mail className={`w-3.5 h-3.5 ${isRequestingDeletion ? 'animate-spin' : ''}`} />
                    <span>{isRequestingDeletion ? 'Silme Talebi Gönderiliyor...' : 'Hesap Silme Onay E-postası Gönder'}</span>
                  </button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs">
                    Doğrulama tokenı <strong>{currentUser.email}</strong> adresine gönderildi.
                  </div>
                  <input
                    type="text"
                    value={receivedToken}
                    onChange={(e) => setReceivedToken(e.target.value)}
                    placeholder="E-postadaki silme tokenı..."
                    className="w-full px-4 py-3 bg-slate-950/80 border border-amber-400/40 rounded-xl text-white font-mono text-xs focus:border-amber-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleExecuteDeletionWithToken}
                    disabled={isExecutingDelete || !receivedToken.trim()}
                    className="w-full py-3.5 px-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{isExecutingDelete ? 'Siliniyor...' : 'EVET, HESABIMI KALICI OLARAK SİL'}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          5. LOGOUT CONFIRMATION MODAL POPUP
      ======================================================== */}
      {isLogoutConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl animate-scaleUp">
            
            <div className="text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center text-2xl shadow-lg shadow-amber-500/10">
                <LogOut className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-black text-white">
                Çıkış Yapmak İstiyor musunuz?
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
                Hesabınızdan çıkış yaptığınızda ilerlemeleriniz Firebase bulut hesabınızda güvenle korunur. Dilediğiniz an tekrar giriş yapabilirsiniz.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsLogoutConfirmOpen(false)}
                disabled={isLoggingOut}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 border border-white/10 text-slate-300 font-bold text-xs cursor-pointer transition-all active:scale-98"
              >
                Vazgeç
              </button>

              <button
                type="button"
                onClick={handleLogoutClick}
                disabled={isLoggingOut}
                className="py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-98 disabled:opacity-50"
              >
                <LogOut className={`w-3.5 h-3.5 ${isLoggingOut ? 'animate-spin' : ''}`} />
                <span>{isLoggingOut ? 'Çıkılıyor...' : 'Evet, Çıkış Yap'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
