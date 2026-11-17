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

interface TodayScreenProps {
  profile: UserEngineProfile;
  latestResult: EngineDayResult | null;
  metric: BehaviorMetric;
  onChangeMetric: (metric: BehaviorMetric) => void;
  onSaveRecord: (record: DailyRecord) => void;
  onNavigateToRecovery: () => void;
}

export const TodayScreen: React.FC<TodayScreenProps> = ({
  profile,
  latestResult,
  metric,
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
          Learning your baseline (Day {latestResult?.activeDays ? latestResult.activeDays + 1 : 1} of 7)
        </span>
      );
    }

    switch (latestResult.state) {
      case 'ON_TRACK':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            On-Track
          </span>
        );
      case 'SLIPPING':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            Slipping (7-day mean &lt; 80%)
          </span>
        );
      case 'LAPSED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            Lapsed (3+ below-par days)
          </span>
        );
      case 'RECOVERING':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200">
            <RotateCcw className="w-3.5 h-3.5 text-cyan-600" />
            Recovering (Day {latestResult.consecutiveSuccessDays} of 3)
          </span>
        );
    }
  };

  const currentRung = latestResult?.ladderLevel ?? 'TARGET';
  const baseline = latestResult?.baseline ?? (metric === 'steps' ? profile.userGoalSteps : profile.userGoalSleepMinutes);
  const currentTargetVal = latestResult?.currentLadderTarget ?? baseline;

  return (
    <div className="space-y-6">
      {/* Metric Selector & Today's Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            {renderStateBadge()}
            <span className="text-xs font-medium text-slate-500">
              Ladder Rung: <strong className="text-slate-800">{currentRung}</strong>
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Today's Dashboard</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Target today: <strong className="text-emerald-700">{currentTargetVal.toLocaleString()} {metric === 'steps' ? 'steps' : 'minutes'}</strong>
            {currentRung === 'MINIMUM' && ' (Step-down 50% rung active to preserve routine)'}
            {currentRung === 'STRETCH' && ' (Optional +10% stretch rung)'}
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
            Daily Steps
          </button>
          <button
            onClick={() => onChangeMetric('sleep')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              metric === 'sleep' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Moon className="w-3.5 h-3.5 text-indigo-600" />
            Sleep Duration
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
                {latestResult.state === 'LAPSED' ? 'Lapse Detected — Step Down, Don\'t Quit' : 'Early Slipping Trend Detected'}
              </h2>
              <p className="text-xs text-amber-700 mt-0.5">
                {latestResult.state === 'LAPSED'
                  ? 'Your target has automatically stepped down to 50% to keep your routine manageable. Zero progress is lost.'
                  : 'Your 7-day average dipped below 80%. Review lifestyle barrier hypotheses or plan a micro-action.'}
              </p>
            </div>
          </div>
          <button
            onClick={onNavigateToRecovery}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 transition-colors shrink-0 shadow-xs"
          >
            Open Recovery Plan
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Streak-Free Progress HUD (No resets to zero!) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Active Days</span>
            <Calendar className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {latestResult?.activeDays ?? 0}
          </div>
          <span className="text-[11px] text-slate-500 block mt-0.5">Never resets to zero</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Return Count</span>
            <RotateCcw className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {latestResult?.returnCount ?? 0}
          </div>
          <span className="text-[11px] text-slate-500 block mt-0.5">Recoveries completed</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">28-Day Baseline</span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {baseline.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-500 block mt-0.5">
            {latestResult?.isColdStart ? 'User goal (cold start)' : 'Median of past 28 days'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Success Streak</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {latestResult?.consecutiveSuccessDays ?? 0}
          </div>
          <span className="text-[11px] text-slate-500 block mt-0.5">
            {currentRung === 'MINIMUM' ? 'At Minimum (3 steps up)' : 'At Target rung'}
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
              Daily Check-in
            </h2>
            <span className="text-[11px] text-slate-500 font-medium">Stored in browser</span>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                required
              />
            </div>

            {metric === 'steps' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Steps Count</span>
                  <span className="text-[11px] text-slate-500 font-normal">
                    Target today: {currentTargetVal.toLocaleString()}
                  </span>
                </label>
                <input
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
                  <span>Sleep Duration</span>
                  <span className="text-[11px] text-slate-500 font-normal">
                    Target today: {Math.floor(currentTargetVal / 60)}h {currentTargetVal % 60}m
                  </span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="24"
                      value={sleepHoursInput}
                      onChange={(e) => setSleepHoursInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      disabled={isRestDeclared}
                    />
                    <span className="text-xs text-slate-600 font-medium">hrs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="59"
                      step="5"
                      value={sleepMinsInput}
                      onChange={(e) => setSleepMinsInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      disabled={isRestDeclared}
                    />
                    <span className="text-xs text-slate-600 font-medium">mins</span>
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
                Planned Rest Day or Declared Illness (disables failure penalty)
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Context / Notes (Optional)
              </label>
              <input
                type="text"
                maxLength={100}
                placeholder="e.g., Night shift, travel, Ramadan fasting, holiday"
                value={contextNote}
                onChange={(e) => setContextNote(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs sm:text-sm text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-xs"
            >
              Save Daily Entry
            </button>

            {savedSuccessMessage && (
              <p className="text-xs text-emerald-700 font-semibold text-center animate-fade-in">
                ✓ Entry saved to local browser storage!
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

            <h3 className="text-base font-bold text-slate-900 mb-2">Behavioral Support Card</h3>
            <p className="text-xs sm:text-sm text-slate-700 font-medium mb-4 leading-relaxed">
              "{latestResult?.techniqueCard.suggestion ?? 'Maintain your steady daily target. Regular self-monitoring builds automatic habit strength.'}"
            </p>

            <div className="space-y-3 bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs">
              <div>
                <strong className="text-slate-800 block mb-0.5">Behavioral Rationale:</strong>
                <p className="text-slate-600 leading-normal">
                  {latestResult?.techniqueCard.reason ??
                    'Consistent daily self-monitoring reinforces habit identity and establishes a stable personal baseline.'}
                </p>
              </div>

              <div>
                <strong className="text-slate-800 block mb-0.5">Rule Limitations:</strong>
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
              Explore recovery techniques →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
