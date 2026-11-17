import React, { useState } from 'react';
import {
  Settings,
  Download,
  Trash2,
  Sparkles,
  Shield,
  Footprints,
  Bell,
  AlertTriangle,
} from 'lucide-react';
import { SYNTHETIC_PERSONAS, SyntheticPersona } from '../data/syntheticPersonas';
import { UserEngineProfile } from '../engine/types';

interface SettingsScreenProps {
  profile: UserEngineProfile;
  quietHours: { enabled: boolean; start: string; end: string };
  textSize: 'standard' | 'large' | 'xl';
  onUpdateProfile: (profile: UserEngineProfile) => void;
  onUpdateQuietHours: (quiet: { enabled: boolean; start: string; end: string }) => void;
  onChangeTextSize: (size: 'standard' | 'large' | 'xl') => void;
  onLoadSyntheticPersona: (persona: SyntheticPersona) => void;
  onExportData: () => void;
  onDeleteAllData: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  profile,
  quietHours,
  textSize,
  onUpdateProfile,
  onUpdateQuietHours,
  onChangeTextSize,
  onLoadSyntheticPersona,
  onExportData,
  onDeleteAllData,
}) => {
  const [stepGoal, setStepGoal] = useState<number>(profile.userGoalSteps);
  const [sleepHours, setSleepHours] = useState<number>(Math.floor(profile.userGoalSleepMinutes / 60));
  const [sleepMinutesRemainder, setSleepMinutesRemainder] = useState<number>(profile.userGoalSleepMinutes % 60);

  const [qhEnabled, setQhEnabled] = useState<boolean>(quietHours.enabled);
  const [qhStart, setQhStart] = useState<string>(quietHours.start);
  const [qhEnd, setQhEnd] = useState<string>(quietHours.end);

  const [selectedPersonaId, setSelectedPersonaId] = useState<string>(SYNTHETIC_PERSONAS[0].id);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<string>('');

  const handleSaveGoals = (e: React.FormEvent) => {
    e.preventDefault();
    const totalSleepMinutes = sleepHours * 60 + sleepMinutesRemainder;
    onUpdateProfile({
      userGoalSteps: Math.max(1000, stepGoal),
      userGoalSleepMinutes: Math.max(120, totalSleepMinutes),
    });
    onUpdateQuietHours({
      enabled: qhEnabled,
      start: qhStart,
      end: qhEnd,
    });
    setSaveMessage('✓ Goals and preferences updated!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleLoadPersona = () => {
    const persona = SYNTHETIC_PERSONAS.find((p) => p.id === selectedPersonaId) || SYNTHETIC_PERSONAS[0];
    onLoadSyntheticPersona(persona);
    setSaveMessage(`✓ Loaded synthetic demo journey: ${persona.name}`);
    setTimeout(() => setSaveMessage(''), 4000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Settings Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Settings &amp; Data Sovereignty</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Control your personal goals, notification limits, and browser-stored data.
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
          <Settings className="w-5 h-5" />
        </div>
      </div>

      {/* Goal & Notification Preferences */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Footprints className="w-4 h-4 text-emerald-600" />
          Personal Health Targets &amp; Quiet Hours
        </h2>

        <form onSubmit={handleSaveGoals} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Daily Step Goal
              </label>
              <input
                type="number"
                min="1000"
                max="50000"
                step="500"
                value={stepGoal}
                onChange={(e) => setStepGoal(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Daily Sleep Target
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="3"
                    max="14"
                    value={sleepHours}
                    onChange={(e) => setSleepHours(Number(e.target.value))}
                    className="w-full px-2.5 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                  <span className="text-xs text-slate-500">hrs</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    max="59"
                    step="15"
                    value={sleepMinutesRemainder}
                    onChange={(e) => setSleepMinutesRemainder(Number(e.target.value))}
                    className="w-full px-2.5 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                  <span className="text-xs text-slate-500">mins</span>
                </div>
              </div>
            </div>
          </div>

          {/* Accessibility Font Size Controls */}
          <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
            <div>
              <label className="text-xs font-bold text-slate-900 block">
                Reading Font Size
              </label>
              <span className="text-[11px] text-slate-500">
                Adjust app typography size for comfort and accessibility.
              </span>
            </div>
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => onChangeTextSize('standard')}
                className={`px-3 py-1 text-xs font-semibold rounded ${textSize === 'standard' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500'}`}
              >
                Standard
              </button>
              <button
                type="button"
                onClick={() => onChangeTextSize('large')}
                className={`px-3 py-1 text-xs font-bold rounded ${textSize === 'large' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500'}`}
              >
                Large
              </button>
              <button
                type="button"
                onClick={() => onChangeTextSize('xl')}
                className={`px-3 py-1 text-sm font-black rounded ${textSize === 'xl' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500'}`}
              >
                Extra Large
              </button>
            </div>
          </div>
          <div className="border-t border-slate-100 pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-slate-900 block flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-indigo-600" />
                  Quiet Hours (Notification Limits)
                </label>
                <span className="text-[11px] text-slate-500">
                  Mutes all proactive advice and technique suggestions during rest hours.
                </span>
              </div>
              <input
                type="checkbox"
                checked={qhEnabled}
                onChange={(e) => setQhEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
              />
            </div>

            {qhEnabled && (
              <div className="grid grid-cols-2 gap-4 max-w-sm">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Start Time</label>
                  <input
                    type="time"
                    value={qhStart}
                    onChange={(e) => setQhStart(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-0.5">End Time</label>
                  <input
                    type="time"
                    value={qhEnd}
                    onChange={(e) => setQhEnd(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              type="submit"
              className="py-2 px-4 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-xs"
            >
              Save Goals &amp; Preferences
            </button>
            {saveMessage && (
              <span className="text-xs font-bold text-emerald-700 animate-fade-in">{saveMessage}</span>
            )}
          </div>
        </form>
      </div>

      {/* Synthetic Demo Journey Loader */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Load Synthetic Demo Journey
            </h2>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
              Synthetic Team Persona
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Load an end-to-end simulated user journey created by our team to immediately test the baseline engine,
            lapse detection, and recovery transitions.
          </p>
        </div>

        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 text-xs text-amber-900">
          <strong>Non-Negotiable Integrity Declaration:</strong> These journeys are 100% synthetic scenarios generated
          by the student team for interactive testing. They contain <em>zero real participant data</em>.
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-semibold text-slate-700">Select Synthetic Persona:</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SYNTHETIC_PERSONAS.map((persona) => (
              <label
                key={persona.id}
                className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-colors block ${
                  selectedPersonaId === persona.id
                    ? 'border-emerald-500 bg-emerald-50/60 font-semibold text-emerald-950'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="syntheticPersona"
                    checked={selectedPersonaId === persona.id}
                    onChange={() => setSelectedPersonaId(persona.id)}
                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-300"
                  />
                  <span>{persona.name}</span>
                </div>
                <p className="text-[11px] text-slate-500 font-normal mt-1.5 ml-6">
                  {persona.description}
                </p>
              </label>
            ))}
          </div>

          <button
            onClick={handleLoadPersona}
            className="py-2.5 px-5 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition-colors shadow-xs"
          >
            Load Selected Synthetic Journey
          </button>
        </div>
      </div>

      {/* Data Sovereignty: Export & Delete */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-4 h-4 text-slate-600" />
            Data Sovereignty &amp; Privacy
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            All data exists exclusively in your browser's local memory. You can download an offline copy or wipe all traces
            instantly.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
          <button
            onClick={onExportData}
            className="inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-200"
          >
            <Download className="w-4 h-4" />
            Export My Data (JSON)
          </button>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors border border-rose-200"
          >
            <Trash2 className="w-4 h-4" />
            Delete All Data
          </button>
        </div>
      </div>

      {/* Confirmation Modal for Data Deletion */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-700">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Permanently Delete All Data?</h3>
                <span className="text-xs text-slate-500">This action cannot be undone.</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              This will erase all recorded daily steps, sleep entries, baselines, and custom settings from this browser's
              local storage. Zero copies remain anywhere.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="py-2 px-4 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteAllData();
                  setShowDeleteModal(false);
                }}
                className="py-2 px-4 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-xs"
              >
                Yes, Delete Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
