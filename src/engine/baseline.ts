/**
 * WellSync Engine - Baseline Computation
 *
 * Implements 28-day rolling median baseline with:
 * 1. Cold start protection (fallback to user goal when valid days < 14)
 * 2. Lapse day contamination guard (excludes LAPSED days from baseline calculation)
 * 3. Deterministic median calculation
 */

import { DEFAULT_ENGINE_CONFIG, EngineConfig } from './config';
import { BehaviorMetric, DailyRecord } from './types';

/**
 * Computes standard mathematical median of an array of numbers.
 * Empty array returns 0.
 */
export function calculateMedian(values: number[]): number {
  if (!values || values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) {
    return sorted[mid];
  }
  return Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

/**
 * Normalizes date to YYYY-MM-DD string format to prevent time zone mismatch.
 */
export function normalizeDateString(date: string | Date): string {
  if (typeof date === 'string') {
    // If it's already YYYY-MM-DD, take the first 10 chars
    const match = date.match(/^\d{4}-\d{2}-\d{2}/);
    if (match) return match[0];
  }
  const d = new Date(date);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Computes baseline value for a target date given prior history.
 *
 * Excludes days marked as LAPSED to prevent downward baseline contamination.
 * If fewer than `config.minValidDaysForBaseline` (14) valid days are available,
 * falls back to the user's declared goal (Cold Start).
 */
export function calculateBaseline(
  history: DailyRecord[],
  currentDate: string,
  metric: BehaviorMetric,
  userGoal: number,
  config: EngineConfig = DEFAULT_ENGINE_CONFIG
): {
  baseline: number;
  isColdStart: boolean;
  validDaysCount: number;
  windowValues: number[];
} {
  const normCurrent = normalizeDateString(currentDate);

  // Filter history strictly strictly before currentDate, within the 28-day window
  // Window = [currentDate - 28 days, currentDate - 1 day]
  const currentTimestamp = new Date(normCurrent + 'T00:00:00Z').getTime();
  const msPerDay = 24 * 60 * 60 * 1000;
  const windowStartTimestamp = currentTimestamp - config.baselineWindowDays * msPerDay;

  const validValues: number[] = [];

  for (const record of history) {
    const recordNorm = normalizeDateString(record.date);
    const recordTimestamp = new Date(recordNorm + 'T00:00:00Z').getTime();

    // Check if within window: strictly before current date and within lookback
    if (recordTimestamp < currentTimestamp && recordTimestamp >= windowStartTimestamp) {
      // Safeguard against baseline contamination:
      // Exclude days that were classified as LAPSED
      if (record.assignedState === 'LAPSED') {
        continue;
      }

      // Check if missing data
      if (record.isMissing) {
        continue;
      }

      const val = metric === 'steps' ? record.steps : record.sleepMinutes;
      if (typeof val === 'number' && !isNaN(val) && val >= 0) {
        validValues.push(val);
      }
    }
  }

  // Cold start check: fewer than 14 valid days
  if (validValues.length < config.minValidDaysForBaseline) {
    return {
      baseline: userGoal,
      isColdStart: true,
      validDaysCount: validValues.length,
      windowValues: validValues,
    };
  }

  // Median of valid days in the window
  const median = calculateMedian(validValues);
  return {
    baseline: Math.max(1, median),
    isColdStart: false,
    validDaysCount: validValues.length,
    windowValues: validValues,
  };
}
