import React, { useState } from 'react';
import { Shield, Activity, Moon, Footprints, CheckCircle2 } from 'lucide-react';
import { UserEngineProfile } from '../engine/types';

interface OnboardingModalProps {
  initialProfile: UserEngineProfile;
  onComplete: (profile: UserEngineProfile) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ initialProfile, onComplete }) => {
  const [stepGoal, setStepGoal] = useState<number>(initialProfile.userGoalSteps || 8000);
  const [sleepHours, setSleepHours] = useState<number>(Math.floor((initialProfile.userGoalSleepMinutes || 480) / 60));
  const [sleepMinutesRemainder, setSleepMinutesRemainder] = useState<number>(
    (initialProfile.userGoalSleepMinutes || 480) % 60
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const totalSleepMinutes = sleepHours * 60 + sleepMinutesRemainder;
    onComplete({
      userGoalSteps: Math.max(1000, stepGoal),
      userGoalSleepMinutes: Math.max(120, totalSleepMinutes),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full p-6 sm:p-8 border border-slate-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Welcome to WellSync</h2>
            <p className="text-xs sm:text-sm text-slate-600">Sustaining movement and sleep habits without punitive streaks.</p>
          </div>
        </div>

        {/* How It Works Explainer */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 space-y-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">How WellSync Works</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Personal Baseline:</strong> Calibrates to your rolling 28-day median. Starts from your goal while learning.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Step-Down Ladder:</strong> Missing days steps your target down to 50% instead of resetting streaks to zero.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Return Count:</strong> We count every successful return. You never lose your accumulated active days.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Total Privacy:</strong> Runs 100% in your browser. No account, no login, zero network calls.</span>
            </div>
          </div>
        </div>

        {/* Goal Setting Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-900 mb-1 flex items-center gap-1.5">
              <Footprints className="w-4 h-4 text-emerald-600" />
              Daily Step Goal (steps/day)
            </label>
            <input
              type="number"
              min="1000"
              max="50000"
              step="500"
              value={stepGoal}
              onChange={(e) => setStepGoal(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              required
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Common goals: 6,000 for beginner maintenance, 8,000 for regular activity, 10,000 for high movement.
            </p>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-900 mb-1 flex items-center gap-1.5">
              <Moon className="w-4 h-4 text-indigo-600" />
              Daily Sleep Goal
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="3"
                    max="14"
                    value={sleepHours}
                    onChange={(e) => setSleepHours(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    required
                  />
                  <span className="text-xs text-slate-600 font-medium">hours</span>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="59"
                    step="15"
                    value={sleepMinutesRemainder}
                    onChange={(e) => setSleepMinutesRemainder(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    required
                  />
                  <span className="text-xs text-slate-600 font-medium">mins</span>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Recommended adult target: 7 to 9 hours (420 - 540 minutes).</p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl font-semibold text-sm text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            >
              Continue as Guest (All Features Unlocked)
            </button>
          </div>

          <p className="text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-slate-400" />
            Your data is never transmitted. You can export or delete it at any time.
          </p>
        </form>
      </div>
    </div>
  );
};
