/**
 * WellSync - Client-side Storage Layer
 *
 * Strict Privacy & Resilience Guarantees:
 * - 100% browser-local (localStorage). Zero external network requests.
 * - Every read and write is wrapped in try/catch to survive private browsing, quotas, and empty states.
 * - Real Data Export: generates clean, unencrypted JSON download.
 * - Real Data Wipe: "Delete All Data" removes keys and resets state immediately.
 */

import { DailyRecord, UserEngineProfile } from '../engine/types';

export interface AppStorageState {
  profile: UserEngineProfile;
  history: DailyRecord[];
  hasCompletedOnboarding: boolean;
  quietHours: { enabled: boolean; start: string; end: string };
  textSize: 'standard' | 'large' | 'xl';
  language: 'en' | 'ar';
}

export const STORAGE_KEY = 'wellsync_app_data_v1';

export const DEFAULT_APP_STATE: AppStorageState = {
  profile: {
    userGoalSteps: 8000,
    userGoalSleepMinutes: 480, // 8 hours
  },
  history: [],
  hasCompletedOnboarding: false,
  quietHours: { enabled: true, start: '22:00', end: '07:00' },
  textSize: 'standard',
  language: 'en',
};

/**
 * Safe accessor for localStorage supporting both browser (window) and test (globalThis) environments.
 */
function getStorage(): Storage | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
    if (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) {
      return (globalThis as any).localStorage;
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Reads app state from localStorage with safe fallback.
 */
export function loadAppState(): AppStorageState {
  try {
    const storage = getStorage();
    if (!storage) {
      return { ...DEFAULT_APP_STATE };
    }
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) {
      return { ...DEFAULT_APP_STATE };
    }
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_APP_STATE,
      ...parsed,
      profile: { ...DEFAULT_APP_STATE.profile, ...(parsed.profile || {}) },
      quietHours: { ...DEFAULT_APP_STATE.quietHours, ...(parsed.quietHours || {}) },
      history: Array.isArray(parsed.history) ? parsed.history : [],
    };
  } catch (error) {
    console.warn('[WellSync Storage] Failed to read from localStorage, using defaults:', error);
    return { ...DEFAULT_APP_STATE };
  }
}

/**
 * Writes app state to localStorage wrapped in try/catch.
 */
export function saveAppState(state: AppStorageState): boolean {
  try {
    const storage = getStorage();
    if (!storage) {
      return false;
    }
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (error) {
    console.error('[WellSync Storage] Failed to write to localStorage:', error);
    return false;
  }
}

/**
 * Exports all user data as a formatted JSON string for download.
 */
export function exportUserDataAsJSON(state: AppStorageState): string {
  try {
    const exportPayload = {
      exportMetadata: {
        application: 'WellSync',
        version: '0.1.0',
        exportedAt: new Date().toISOString(),
        description: 'Client-side personal behavioral wellness data. No external server storage.',
      },
      profile: state.profile,
      history: state.history,
      preferences: {
        quietHours: state.quietHours,
        textSize: state.textSize,
        language: state.language,
      },
    };
    return JSON.stringify(exportPayload, null, 2);
  } catch (error) {
    console.error('[WellSync Storage] Failed to export JSON data:', error);
    return '{}';
  }
}

/**
 * Triggers browser download of user's personal data file.
 */
export function downloadDataExport(state: AppStorageState): void {
  try {
    const jsonStr = exportUserDataAsJSON(state);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `wellsync_export_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('[WellSync Storage] Browser download failed:', error);
  }
}

/**
 * Permanently removes all WellSync data from the browser.
 */
export function clearAllUserData(): boolean {
  try {
    const storage = getStorage();
    if (storage) {
      storage.removeItem(STORAGE_KEY);
    }
    return true;
  } catch (error) {
    console.error('[WellSync Storage] Failed to clear localStorage:', error);
    return false;
  }
}
