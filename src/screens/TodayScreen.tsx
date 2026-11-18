import React, { useState } from 'react';
import {
  Footprints,
  Moon,
  TrendingUp,
  RotateCcw,
  Calendar,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Info,
  Sparkles,
} from 'lucide-react';
import { BehaviorMetric, DailyRecord, EngineDayResult, UserEngineProfile } from '../engine/types';
import { Language, t } from '../i18n/translations';

interface TodayScreenProps {
  profile: UserEngineProfile;
  latestResult: EngineDayResult | null;
  metric: BehaviorMetric;
  language: Language;
  onChangeMetric: (metric: BehaviorMetric) => void;
  onSaveRecord: (record: DailyRecord) => void;
  onNavigateToRecovery: () => void;
}

export const TodayScreen: React.FC<TodayScreenProps> = ({
  profile,
  latestResult,
  metric,
  language,
  onChangeMetric,
  onSaveRecord,
  onNavigateToRecovery,
}) => {
  // Today's entry form state
  const todayStr = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState<string>(todayStr);
  const [stepsInput, setStepsInput] = useState<string>('');
  const [sleepHoursInput, setSleepHoursInput] = useState<string>('7');
  const [sleepMinsInput, setSleepMinsInput] = useState<string>('30');
  const [isRestDeclared, setIsRestDeclared] = useState<boolean>(false);
  const [contextNote, setContextNote] = useState<string>('');
  const [savedSuccessMessage, setSavedSuccessMessage] = useState<boolean>(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const record: DailyRecord = {
      date,
      steps: metric === 'steps' ? (stepsInput ? Number(stepsInput) : null) : undefined,
      sleepMinutes:
        metric === 'sleep'
          ? Number(sleepHoursInput || 0) * 60 + Number(sleepMinsInput || 0)
          : undefined,
      isRestDeclared,
      contextNote: contextNote.trim() || undefined,
    };

    onSaveRecord(record);
    setSavedSuccessMessage(true);
    setTimeout(() => setSavedSuccessMessage(false), 3000);
  };

  // State presentation helper
  const renderStateBadge = () => {
    if (!latestResult || latestResult.isLearningBaseline) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          {t('status.learning', language)} ({latestResult?.activeDays ? latestResult.activeDays + 1 : 1} / 7)
        </span>
      );
    }

    switch (latestResult.state) {
      case 'ON_TRACK':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            {t('status.on_track', language)}
          </span>
        );
      case 'SLIPPING':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            {t('status.slipping', language)}
          </span>
        );
      case 'LAPSED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            {t('status.lapsed', language)}
          </span>
        );
      case 'RECOVERING':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200">
            <RotateCcw className="w-3.5 h-3.5 text-cyan-600" />
            {t('status.recovering', language)} ({latestResult.consecutiveSuccessDays} / 3)
          </span>
        );
    }
  };

  const currentRung = latestResult?.ladderLevel ?? 'TARGET';
  const baseline = latestResult?.baseline ?? (metric === 'steps' ? profile.userGoalSteps : profile.userGoalSleepMinutes);
  const currentTargetVal = latestResult?.currentLadderTarget ?? baseline;

  const getRungLabel = () => {
    switch (currentRung) {
      case 'MINIMUM':
        return t('ladder.minimum', language);
      case 'STRETCH':
        return t('ladder.stretch', language);
      default:
        return t('ladder.target', language);
    }
  };

  return (
    <div className="space-y-6">
      {/* Metric Selector & Today's Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            {renderStateBadge()}
            <span className="text-xs font-medium text-slate-500">
              {getRungLabel()}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{t('nav.today', language)}</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {t('today.current_rung', language)}: <strong className="text-emerald-700">{currentTargetVal.toLocaleString()} {metric === 'steps' ? t('today.steps_unit', language) : t('today.sleep_unit', language)}</strong>
            {currentRung === 'MINIMUM' && (language === 'ar' ? ' (المستوى الأدنى 50% نشط للحفاظ على الاستمرارية)' : ' (Step-down 50% rung active to preserve routine)')}
            {currentRung === 'STRETCH' && (language === 'ar' ? ' (المستوى الموسع +10% الاختياري)' : ' (Optional +10% stretch rung)')}
          </p>
        </div>

        {/* Behavior Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
          <button
            onClick={() => onChangeMetric('steps')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              metric === 'steps' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Footprints className="w-3.5 h-3.5 text-emerald-600" />
            {t('today.steps', language)}
          </button>
          <button
            onClick={() => onChangeMetric('sleep')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              metric === 'sleep' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Moon className="w-3.5 h-3.5 text-indigo-600" />
            {t('today.sleep', language)}
          </button>
        </div>
      </div>

      {/* Recovery Prompt Banner if Lapsed or Slipping */}
      {latestResult && (latestResult.state === 'LAPSED' || latestResult.state === 'SLIPPING') && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-amber-900">
                {latestResult.state === 'LAPSED'
                  ? (language === 'ar' ? 'تم رصد تراجع مؤقت — تدرج للأسفل ولا تستسلم' : 'Lapse Detected — Step Down, Don\'t Quit')
                  : (language === 'ar' ? 'تم رصد مؤشر تراجع مبكر' : 'Early Slipping Trend Detected')}
              </h2>
              <p className="text-xs text-amber-700 mt-0.5">
                {latestResult.state === 'LAPSED'
                  ? (language === 'ar'
                      ? 'تم خفض هدفك تلقائياً إلى 50% للحفاظ على استمرارية العادة دون أي ضغوط أو تصفير للتقدم.'
                      : 'Your target has automatically stepped down to 50% to keep your routine manageable. Zero progress is lost.')
                  : (language === 'ar'
                      ? 'انخفض متوسط الـ 7 أيام دون 80%. استكشف فرضيات العوائق أو التزم بخطوة مصغرة.'
                      : 'Your 7-day average dipped below 80%. Review lifestyle barrier hypotheses or plan a micro-action.')}
              </p>
            </div>
          </div>
          <button
            onClick={onNavigateToRecovery}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 transition-colors shrink-0 shadow-xs"
          >
            {t('today.recovery_cta', language)}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Streak-Free Progress HUD (No resets to zero!) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">{t('today.active_days', language)}</span>
            <Calendar className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {latestResult?.activeDays ?? 0}
          </div>
          <span className="text-[11px] text-slate-500 block mt-0.5">{language === 'ar' ? 'لا يعاد للصفر مطلقاً' : 'Never resets to zero'}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">{t('today.return_count', language)}</span>
            <RotateCcw className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {latestResult?.returnCount ?? 0}
          </div>
          <span className="text-[11px] text-slate-500 block mt-0.5">{language === 'ar' ? 'تعافيات مكتملة بنجاح' : 'Recoveries completed'}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">{t('today.current_baseline', language)}</span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {baseline.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-500 block mt-0.5">
            {latestResult?.isColdStart
              ? (language === 'ar' ? 'هدف المستخدم (بداية جديدة)' : 'User goal (cold start)')
              : (language === 'ar' ? 'وسيط آخر 28 يوماً' : 'Median of past 28 days')}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">{language === 'ar' ? 'أيام الإنجاز المتتالية' : 'Success Streak'}</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {latestResult?.consecutiveSuccessDays ?? 0}
          </div>
          <span className="text-[11px] text-slate-500 block mt-0.5">
            {currentRung === 'MINIMUM'
              ? (language === 'ar' ? 'في المستوى الأدنى (3 للترقية)' : 'At Minimum (3 steps up)')
              : (language === 'ar' ? 'في المستوى المستهدف' : 'At Target rung')}
          </span>
        </div>
      </div>

      {/* Main Grid: Check-in Form & Michie BCTTv1 Technique Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Check-in Form */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-500" />
              {t('today.checkin_title', language)}
            </h2>
            <span className="text-[11px] text-slate-500 font-medium">{t('nav.guest_sub', language)}</span>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label htmlFor="todayDateInput" className="block text-xs font-semibold text-slate-700 mb-1">{t('today.date_label', language)}</label>
              <input
                id="todayDateInput"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                required
              />
            </div>

            {metric === 'steps' ? (
              <div>
                <label htmlFor="todayStepsInput" className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>{t('today.step_count_label', language)}</span>
                  <span className="text-[11px] text-slate-500 font-normal">
                    {t('today.current_rung', language)}: {currentTargetVal.toLocaleString()}
                  </span>
                </label>
                <input
                  id="todayStepsInput"
                  type="number"
                  min="0"
                  max="100000"
                  placeholder="e.g. 7500"
                  value={stepsInput}
                  onChange={(e) => setStepsInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  disabled={isRestDeclared}
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>{t('today.sleep', language)}</span>
                  <span className="text-[11px] text-slate-500 font-normal">
                    {t('today.current_rung', language)}: {Math.floor(currentTargetVal / 60)}h {currentTargetVal % 60}m
                  </span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <input
                      id="todaySleepHoursInput"
                      type="number"
                      aria-label={t('today.sleep_hours_label', language)}
                      min="0"
                      max="24"
                      value={sleepHoursInput}
                      onChange={(e) => setSleepHoursInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      disabled={isRestDeclared}
                    />
                    <label htmlFor="todaySleepHoursInput" className="text-xs text-slate-600 font-medium">{t('today.sleep_hours_label', language)}</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      id="todaySleepMinsInput"
                      type="number"
                      aria-label={t('today.sleep_mins_label', language)}
                      min="0"
                      max="59"
                      step="5"
                      value={sleepMinsInput}
                      onChange={(e) => setSleepMinsInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      disabled={isRestDeclared}
                    />
                    <label htmlFor="todaySleepMinsInput" className="text-xs text-slate-600 font-medium">{t('today.sleep_mins_label', language)}</label>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="restDeclared"
                checked={isRestDeclared}
                onChange={(e) => setIsRestDeclared(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
              />
              <label htmlFor="restDeclared" className="text-xs font-medium text-slate-700 select-none">
                {t('today.rest_day_label', language)}
              </label>
            </div>

            <div>
              <label htmlFor="todayContextNoteInput" className="block text-xs font-semibold text-slate-700 mb-1">
                {t('today.context_note_label', language)}
              </label>
              <input
                id="todayContextNoteInput"
                type="text"
                maxLength={100}
                placeholder={t('today.context_note_placeholder', language)}
                value={contextNote}
                onChange={(e) => setContextNote(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs sm:text-sm text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-xs"
            >
              {t('today.checkin_cta', language)}
            </button>

            {savedSuccessMessage && (
              <p className="text-xs text-emerald-700 font-semibold text-center animate-fade-in">
                ✓ {t('today.saved_success', language)}
              </p>
            )}
          </form>
        </div>

        {/* Michie BCTTv1 Transparent Technique Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                <Info className="w-3.5 h-3.5" />
                {latestResult?.techniqueCard.bctId ?? 'BCT 1.1'}: {latestResult?.techniqueCard.bctName ?? 'Goal Setting'}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Michie et al. (2013)</span>
            </div>

            <h3 className="text-base font-bold text-slate-900 mb-2">{t('today.bct_title', language)}</h3>
            <p className="text-xs sm:text-sm text-slate-700 font-medium mb-4 leading-relaxed">
              "{latestResult?.techniqueCard.suggestion ?? 'Maintain your steady daily target. Regular self-monitoring builds automatic habit strength.'}"
            </p>

            <div className="space-y-3 bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs">
              <div>
                <strong className="text-slate-800 block mb-0.5">{t('today.bct_reason', language)}:</strong>
                <p className="text-slate-600 leading-normal">
                  {latestResult?.techniqueCard.reason ??
                    'Consistent daily self-monitoring reinforces habit identity and establishes a stable personal baseline.'}
                </p>
              </div>

              <div>
                <strong className="text-slate-800 block mb-0.5">{t('today.bct_limits', language)}:</strong>
                <p className="text-slate-600 leading-normal">
                  {latestResult?.techniqueCard.limits ??
                    'The engine is rule-based and cannot assess subjective fatigue, work stress, weather, or illness.'}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Grounding: BCTTv1 Taxonomy</span>
            <button
              onClick={onNavigateToRecovery}
              className="text-emerald-700 hover:text-emerald-800 font-semibold inline-flex items-center gap-1"
            >
              {language === 'ar' ? 'استكشاف تقنيات التعافي ←' : 'Explore recovery techniques →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
