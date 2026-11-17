import React, { useState } from 'react';
import {
  Calendar,
  Footprints,
  Moon,
  Filter,
} from 'lucide-react';
import { BehaviorMetric, EngineDayResult, UserEngineProfile } from '../engine/types';

interface HistoryScreenProps {
  profile: UserEngineProfile;
  historyResults: EngineDayResult[];
  metric: BehaviorMetric;
  onChangeMetric: (metric: BehaviorMetric) => void;
  onNavigateToToday: () => void;
  onNavigateToSettings: () => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({
  profile,
  historyResults,
  metric,
  onChangeMetric,
  onNavigateToToday,
  onNavigateToSettings,
}) => {
  const [filterState, setFilterState] = useState<string>('all');

  const filtered = historyResults.filter((item) => {
    if (filterState === 'all') return true;
    return item.state === filterState;
  });

  const totalDays = historyResults.length;
  const activeDays = historyResults.length > 0 ? historyResults[historyResults.length - 1].activeDays : 0;
  const returnCount = historyResults.length > 0 ? historyResults[historyResults.length - 1].returnCount : 0;
  const latestBaseline = historyResults.length > 0 ? historyResults[historyResults.length - 1].baseline : (metric === 'steps' ? profile.userGoalSteps : profile.userGoalSleepMinutes);

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Longitudinal History</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            A continuous record of your daily habit trajectory, ladder adaptations, and recoveries.
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
            Steps
          </button>
          <button
            onClick={() => onChangeMetric('sleep')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              metric === 'sleep' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Moon className="w-3.5 h-3.5 text-indigo-600" />
            Sleep
          </button>
        </div>
      </div>

      {/* Aggregate Overview Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500 mb-1">Total Logged Days</div>
          <div className="text-2xl font-bold text-slate-900">{totalDays}</div>
          <span className="text-[11px] text-slate-400">Total days recorded</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500 mb-1">Active Days</div>
          <div className="text-2xl font-bold text-emerald-700">{activeDays}</div>
          <span className="text-[11px] text-slate-400">Never resets to zero</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500 mb-1">Return Count</div>
          <div className="text-2xl font-bold text-cyan-700">{returnCount}</div>
          <span className="text-[11px] text-slate-400">Recoveries completed</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500 mb-1">Current Baseline</div>
          <div className="text-2xl font-bold text-indigo-700">{latestBaseline.toLocaleString()}</div>
          <span className="text-[11px] text-slate-400">28-day rolling median</span>
        </div>
      </div>

      {/* Filter and History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Filter State:</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {['all', 'ON_TRACK', 'SLIPPING', 'LAPSED', 'RECOVERING'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterState(st)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  filterState === st
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {st === 'all' ? 'All Days' : st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {totalDays === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No History Recorded Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You haven't logged any daily entries yet. Check in on the Today screen or load a synthetic demo journey to see the engine in action.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={onNavigateToToday}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
              >
                Log Today's Entry
              </button>
              <button
                onClick={onNavigateToSettings}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Load Synthetic Demo Journey
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Actual Value</th>
                  <th className="py-3 px-4">Active Rung</th>
                  <th className="py-3 px-4">Target</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Baseline</th>
                  <th className="py-3 px-4">Active Days</th>
                  <th className="py-3 px-4">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filtered.map((item, idx) => {
                  return (
                    <tr key={idx} className="hover:bg-slate-50/75 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-900">{item.date}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {item.evaluation.isMissing ? (
                          <span className="text-slate-400 italic font-normal">Missing</span>
                        ) : (
                          item.evaluation.actualValue.toLocaleString()
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-semibold">{item.ladderLevel}</td>
                      <td className="py-3 px-4 text-slate-600">{item.currentLadderTarget.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        {item.isLearningBaseline ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            Learning
                          </span>
                        ) : item.state === 'ON_TRACK' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            On-Track
                          </span>
                        ) : item.state === 'SLIPPING' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            Slipping
                          </span>
                        ) : item.state === 'LAPSED' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            Lapsed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200">
                            Recovering
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono">{item.baseline.toLocaleString()}</td>
                      <td className="py-3 px-4 font-bold text-slate-800">{item.activeDays}</td>
                      <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                        {item.techniqueCard.suggestion}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
