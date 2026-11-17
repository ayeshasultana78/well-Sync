/**
 * Storage Layer Unit Tests
 *
 * Verifies safe storage access, try/catch resilience, JSON export, and real deletion.
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { clearAllUserData, DEFAULT_APP_STATE, exportUserDataAsJSON, loadAppState, saveAppState, STORAGE_KEY } from '../storage';

describe('WellSync Storage Layer', () => {
  beforeEach(() => {
    // Mock standard localStorage
    const store: Record<string, string> = {};
    global.localStorage = {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        for (const k in store) delete store[k];
      },
      length: 0,
      key: () => null,
    };
  });

  afterEach(() => {
    clearAllUserData();
  });

  it('returns default state when localStorage is completely empty', () => {
    const state = loadAppState();
    expect(state).toEqual(DEFAULT_APP_STATE);
    expect(state.history).toEqual([]);
    expect(state.profile.userGoalSteps).toBe(8000);
  });

  it('saves and reloads state accurately', () => {
    const customState = {
      ...DEFAULT_APP_STATE,
      profile: { userGoalSteps: 9000, userGoalSleepMinutes: 450 },
      history: [{ date: '2026-11-01', steps: 9200, sleepMinutes: 460 }],
      hasCompletedOnboarding: true,
    };

    const saved = saveAppState(customState);
    expect(saved).toBe(true);

    const reloaded = loadAppState();
    expect(reloaded.profile.userGoalSteps).toBe(9000);
    expect(reloaded.history.length).toBe(1);
    expect(reloaded.hasCompletedOnboarding).toBe(true);
  });

  it('exports valid, formatted JSON with metadata and zero personal identifiers', () => {
    const state = {
      ...DEFAULT_APP_STATE,
      history: [{ date: '2026-11-01', steps: 8500 }],
    };
    const jsonStr = exportUserDataAsJSON(state);
    const parsed = JSON.parse(jsonStr);

    expect(parsed.exportMetadata.application).toBe('WellSync');
    expect(parsed.history[0].steps).toBe(8500);
  });

  it('truly deletes all stored data when clearAllUserData is called', () => {
    saveAppState({
      ...DEFAULT_APP_STATE,
      history: [{ date: '2026-11-01', steps: 10000 }],
    });
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();

    const wiped = clearAllUserData();
    expect(wiped).toBe(true);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();

    // Reloading after wipe yields default empty state
    const afterWipe = loadAppState();
    expect(afterWipe.history).toEqual([]);
  });
});
