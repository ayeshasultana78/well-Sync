import React, { useState } from 'react';
import {
  RotateCcw,
  HelpCircle,
  ArrowRight,
  XCircle,
  HeartHandshake,
} from 'lucide-react';
import { BehaviorMetric, EngineDayResult, UserEngineProfile } from '../engine/types';

interface RecoveryScreenProps {
  profile: UserEngineProfile;
  latestResult: EngineDayResult | null;
  metric: BehaviorMetric;
  onCommitMicroAction: (commitmentText: string) => void;
  onNavigateToToday: () => void;
}

export const RecoveryScreen: React.FC<RecoveryScreenProps> = ({
  profile,
  latestResult,
  metric,
  onCommitMicroAction,
  onNavigateToToday,
}) => {
  const [selectedCommitment, setSelectedCommitment] = useState<string>('');
  const [customCommitment, setCustomCommitment] = useState<string>('');
  const [rejectedHypotheses, setRejectedHypotheses] = useState<Record<string, boolean>>({});
  const [committedSuccess, setCommittedSuccess] = useState<boolean>(false);

  const baseline = latestResult?.baseline ?? (metric === 'steps' ? profile.userGoalSteps : profile.userGoalSleepMinutes);
  const minimumTarget = latestResult?.ladderTargets.minimum ?? Math.round(baseline * 0.5);

  const defaultStepActions = [
    'Take a 10-minute walk right after my main meal',
    'Walk around the block once before starting evening relaxation',
    'Park 500 meters further away or take the stairs twice today',
    'Do a 5-minute indoor movement pacing session during phone calls',
  ];

  const defaultSleepActions = [
    'Put screens away 30 minutes before intended bedtime',
    'Establish a calm 15-minute dim-light wind-down routine',
    'Dim overhead room lights and set phone to Do Not Disturb at 10 PM',
    'Keep bedroom cool and dark for sleep consistency',
  ];

  const commitmentChoices = metric === 'steps' ? defaultStepActions : defaultSleepActions;

  const handleRejectHypothesis = (id: string) => {
    setRejectedHypotheses((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleCommit = (e: React.FormEvent) => {
    e.preventDefault();
    const action = customCommitment.trim() || selectedCommitment;
    if (action) {
      onCommitMicroAction(action);
      setCommittedSuccess(true);
      setTimeout(() => {
        setCommittedSuccess(false);
        onNavigateToToday();
      }, 1500);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Card: Empathetic, Non-Punitive */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-200 text-cyan-700 flex items-center justify-center shrink-0">
            <RotateCcw className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-50 text-cyan-800 border border-cyan-200">
                Gentle Recovery Protocol
              </span>
              <span className="text-xs text-slate-500 font-medium">BCT 8.7 Graded Tasks &amp; BCT 1.4 Action Planning</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Life Happens. Step Down, Don't Quit.
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
              Disruptions, sickness, shift changes, and travel are normal parts of life. WellSync never resets your progress
              to zero. Instead, your target steps down to a low-friction <strong>Minimum Rung</strong> (50% of your baseline)
              so you maintain habit continuity without burnout.
            </p>
          </div>
        </div>

        {/* Step-Down Ladder Spotlight */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-xl border-2 border-emerald-500 bg-emerald-50/50 relative">
            <span className="absolute -top-2.5 left-3 px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-emerald-700 text-white tracking-wider">
              Active Focus
            </span>
            <div className="text-xs font-semibold text-emerald-900">Minimum Rung (50%)</div>
            <div className="text-2xl font-bold text-emerald-950 mt-1">
              {minimumTarget.toLocaleString()} <span className="text-xs font-normal text-emerald-700">{metric === 'steps' ? 'steps' : 'mins'}</span>
            </div>
            <p className="text-[11px] text-emerald-800 mt-1">
              Low-friction target designed to preserve your habit identity today.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 opacity-75">
            <div className="text-xs font-semibold text-slate-700">Target Rung (100%)</div>
            <div className="text-xl font-bold text-slate-900 mt-1">
              {(latestResult?.ladderTargets.target ?? baseline).toLocaleString()}{' '}
              <span className="text-xs font-normal text-slate-500">{metric === 'steps' ? 'steps' : 'mins'}</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Steps back up here automatically after 3 consecutive successful days.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 opacity-75">
            <div className="text-xs font-semibold text-slate-700">Stretch Rung (110%)</div>
            <div className="text-xl font-bold text-slate-900 mt-1">
              {(latestResult?.ladderTargets.stretch ?? Math.round(baseline * 1.1)).toLocaleString()}{' '}
              <span className="text-xs font-normal text-slate-500">{metric === 'steps' ? 'steps' : 'mins'}</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Optional challenge for days when you have extra surplus energy.
            </p>
          </div>
        </div>
      </div>

      {/* Barrier Hypotheses Section (Strictly rule-based, user can reject any) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-slate-500" />
              Lifestyle Barrier Hypotheses
            </h2>
            <span className="text-[11px] text-slate-500 font-medium">Non-medical • Fully Rejectable</span>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            The engine examines activity and calendar timing to hypothesize potential disruption patterns. You may reject any
            hypothesis with zero penalty.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {latestResult?.barrierHypotheses.map((hypothesis) => {
            const isRejected = Boolean(rejectedHypotheses[hypothesis.id]);

            return (
              <div
                key={hypothesis.id}
                className={`p-4 rounded-xl border transition-all ${
                  isRejected
                    ? 'border-slate-200 bg-slate-50 opacity-60'
                    : hypothesis.detected
                    ? 'border-indigo-200 bg-indigo-50/50'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    {hypothesis.detected && !isRejected && (
                      <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                    )}
                    <h3 className={`text-xs font-bold ${isRejected ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                      {hypothesis.title}
                    </h3>
                  </div>

                  <button
                    onClick={() => handleRejectHypothesis(hypothesis.id)}
                    className="text-[11px] font-semibold text-slate-500 hover:text-rose-600 px-1.5 py-0.5 rounded-md hover:bg-slate-100 transition-colors"
                  >
                    {isRejected ? 'Undo Rejection' : 'Reject'}
                  </button>
                </div>

                <p className={`text-xs ${isRejected ? 'text-slate-400' : 'text-slate-600'} leading-relaxed`}>
                  {hypothesis.description}
                </p>

                {isRejected && (
                  <span className="inline-flex items-center gap-1 mt-2 text-[10px] text-slate-500 font-medium">
                    <XCircle className="w-3 h-3 text-slate-400" />
                    Rejected by you — disregarded by engine
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Commitment (BCT 1.4 Action Planning) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <HeartHandshake className="w-4 h-4 text-emerald-600" />
            Pick Today's Micro-Commitment
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Select one tiny, specific action to accomplish your Minimum target today. Action planning prevents procrastination.
          </p>
        </div>

        <form onSubmit={handleCommit} className="space-y-4">
          <div className="space-y-2">
            {commitmentChoices.map((choice, idx) => (
              <label
                key={idx}
                className={`flex items-start gap-3 p-3 rounded-xl border text-xs sm:text-sm cursor-pointer transition-colors ${
                  selectedCommitment === choice && !customCommitment
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-medium'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="microAction"
                  checked={selectedCommitment === choice && !customCommitment}
                  onChange={() => {
                    setSelectedCommitment(choice);
                    setCustomCommitment('');
                  }}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 mt-0.5"
                />
                <span>{choice}</span>
              </label>
            ))}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Or write your own custom micro-action:
            </label>
            <input
              type="text"
              placeholder="e.g., Walk to the grocery store instead of driving"
              value={customCommitment}
              onChange={(e) => {
                setCustomCommitment(e.target.value);
                setSelectedCommitment('');
              }}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              type="submit"
              disabled={!selectedCommitment && !customCommitment}
              className="inline-flex items-center gap-2 py-2.5 px-5 rounded-xl font-semibold text-xs sm:text-sm text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Commit to this Action
              <ArrowRight className="w-4 h-4" />
            </button>

            {committedSuccess && (
              <span className="text-xs font-bold text-emerald-700 animate-fade-in">
                ✓ Commitment saved to today's plan!
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
