import React from 'react';
import { Activity, ShieldCheck, Settings, Info } from 'lucide-react';
import { UserState } from '../engine/types';
import { Language, t } from '../i18n/translations';

export type ScreenTab = 'today' | 'recovery' | 'history' | 'evidence' | 'settings' | 'about';

interface NavbarProps {
  currentTab: ScreenTab;
  onSelectTab: (tab: ScreenTab) => void;
  currentState: UserState;
  textSize: 'standard' | 'large' | 'xl';
  onChangeTextSize: (size: 'standard' | 'large' | 'xl') => void;
  language: Language;
  onToggleLanguage: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  currentState,
  textSize,
  onChangeTextSize,
  language,
  onToggleLanguage,
}) => {
  const isLapsedOrSlipping = currentState === 'LAPSED' || currentState === 'SLIPPING';

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* Top Banner: Arabic Translation Notice when Arabic is selected */}
      {language === 'ar' && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-1.5 text-center text-xs font-medium text-amber-800">
          {t('nav.unreviewed_banner', language)}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onSelectTab('today')}
              className="flex items-center gap-2 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg p-1 text-left"
              aria-label={t('nav.brand', language)}
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-xs">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-lg tracking-tight text-slate-900 block leading-tight">WellSync</span>
                <span className="text-[10px] text-slate-500 font-medium block leading-none">{t('nav.tagline', language)}</span>
              </div>
            </button>

            {/* Guest Mode Indicator Badge */}
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              {t('nav.guest', language)} • {t('nav.guest_sub', language)}
            </span>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 sm:gap-1.5" aria-label="Main Navigation">
            <button
              onClick={() => onSelectTab('today')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                currentTab === 'today'
                  ? 'bg-emerald-50 text-emerald-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {t('nav.today', language)}
            </button>

            <button
              onClick={() => onSelectTab('recovery')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors relative focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                currentTab === 'recovery'
                  ? 'bg-emerald-50 text-emerald-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {t('nav.recovery', language)}
              {isLapsedOrSlipping && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-white animate-pulse" />
              )}
            </button>

            <button
              onClick={() => onSelectTab('history')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                currentTab === 'history'
                  ? 'bg-emerald-50 text-emerald-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {t('nav.history', language)}
            </button>

            <button
              onClick={() => onSelectTab('evidence')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                currentTab === 'evidence'
                  ? 'bg-emerald-50 text-emerald-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {t('nav.evidence', language)}
            </button>

            <button
              onClick={() => onSelectTab('settings')}
              className={`px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                currentTab === 'settings'
                  ? 'bg-emerald-50 text-emerald-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              aria-label={t('nav.settings', language)}
            >
              <Settings className="w-4 h-4 inline-block sm:mr-1" />
              <span className="hidden sm:inline">{t('nav.settings', language)}</span>
            </button>

            <button
              onClick={() => onSelectTab('about')}
              className={`px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                currentTab === 'about'
                  ? 'bg-emerald-50 text-emerald-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              aria-label={t('nav.about', language)}
            >
              <Info className="w-4 h-4 inline-block sm:mr-1" />
              <span className="hidden sm:inline">{t('nav.about', language)}</span>
            </button>
          </nav>

          {/* Accessibility & Language Controls */}
          <div className="flex items-center gap-2">
            {/* Font Size Selector */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-md border border-slate-200" aria-label={t('nav.text_size', language)}>
              <button
                onClick={() => onChangeTextSize('standard')}
                className={`px-2 py-0.5 text-xs font-medium rounded ${textSize === 'standard' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
                title="Standard Text Size"
              >
                A
              </button>
              <button
                onClick={() => onChangeTextSize('large')}
                className={`px-2 py-0.5 text-xs font-bold rounded ${textSize === 'large' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
                title="Large Text Size"
              >
                A+
              </button>
              <button
                onClick={() => onChangeTextSize('xl')}
                className={`px-2 py-0.5 text-sm font-black rounded ${textSize === 'xl' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
                title="Extra Large Text Size"
              >
                A++
              </button>
            </div>

            {/* Language Toggle */}
            <button
              onClick={onToggleLanguage}
              className="px-2.5 py-1 rounded-md text-xs font-semibold border border-slate-300 hover:bg-slate-50 text-slate-700 transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500"
              aria-label={t('nav.switch_lang', language)}
            >
              {language === 'en' ? 'العربية' : 'English'}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
