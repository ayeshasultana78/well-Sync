/**
 * WellSync Engine - Barrier Hypotheses
 *
 * Strictly rule-based pattern checks.
 * ZERO medical claims, ZERO inferences of health conditions, ZERO diagnosis.
 *
 * Allowed hypotheses:
 * 1. Weekday vs Weekend patterns
 * 2. Short dip (1-2 day temporary drop)
 * 3. Activity shift
 * 4. User-declared context (rest declared, travel, shift work notes)
 *
 * All hypotheses can be reviewed and rejected by the user with zero penalty.
 */

import { BarrierHypothesis, DailyRecord } from './types';

/**
 * Analyzes recent history to identify potential lifestyle and schedule barrier hypotheses.
 * strictly non-medical and rule-based.
 */
export function detectBarrierHypotheses(
  recentHistory: DailyRecord[],
  currentRecord: DailyRecord,
  metric: 'steps' | 'sleep'
): BarrierHypothesis[] {
  const hypotheses: BarrierHypothesis[] = [];

  // Check 1: User-declared context
  const hasUserContext = Boolean(currentRecord.isRestDeclared || currentRecord.contextNote);
  hypotheses.push({
    id: 'user_context',
    title: 'Declared Personal Context',
    description: currentRecord.contextNote
      ? `You noted: "${currentRecord.contextNote}"`
      : currentRecord.isRestDeclared
      ? 'You previously flagged a scheduled rest day.'
      : 'No declared disruption entered.',
    detected: hasUserContext,
  });

  // Check 2: Weekend vs Weekday Pattern
  // In Abu Dhabi / UAE, the standard weekend is Saturday & Sunday (since 2022).
  const weekendDays = [0, 6]; // Sunday=0, Saturday=6 in JS getUTCDay()
  const weekdayDays = [1, 2, 3, 4, 5]; // Mon-Fri

  const weekendValues: number[] = [];
  const weekdayValues: number[] = [];

  for (const r of recentHistory.slice(-14)) {
    const val = metric === 'steps' ? r.steps : r.sleepMinutes;
    if (typeof val === 'number' && val > 0 && !r.isMissing) {
      const dayOfWeek = new Date(r.date + 'T00:00:00Z').getUTCDay();
      if (weekendDays.includes(dayOfWeek)) {
        weekendValues.push(val);
      } else if (weekdayDays.includes(dayOfWeek)) {
        weekdayValues.push(val);
      }
    }
  }

  const avgWeekend = weekendValues.length > 0 ? weekendValues.reduce((a, b) => a + b, 0) / weekendValues.length : 0;
  const avgWeekday = weekdayValues.length > 0 ? weekdayValues.reduce((a, b) => a + b, 0) / weekdayValues.length : 0;

  const isWeekendDip = avgWeekend > 0 && avgWeekday > 0 && avgWeekend < 0.70 * avgWeekday;
  const isWeekdayDip = avgWeekend > 0 && avgWeekday > 0 && avgWeekday < 0.70 * avgWeekend;

  hypotheses.push({
    id: 'weekend_dip',
    title: 'Weekend Schedule Pattern',
    description: 'Activity appears lower on weekends compared to your weekdays.',
    detected: isWeekendDip,
  });

  hypotheses.push({
    id: 'weekday_dip',
    title: 'Weekday Routine Pattern',
    description: 'Activity appears lower on weekdays compared to your weekends.',
    detected: isWeekdayDip,
  });

  // Check 3: Short Transient Dip
  // 1-2 low days immediately preceded by at least 4 consistent days
  const last6 = recentHistory.slice(-6);
  let isShortDip = false;
  if (last6.length >= 4) {
    const last2 = last6.slice(-2);
    const prior4 = last6.slice(0, last6.length - 2);
    const priorAvg =
      prior4.reduce((sum, r) => sum + (metric === 'steps' ? r.steps ?? 0 : r.sleepMinutes ?? 0), 0) / prior4.length;
    const last2Avg =
      last2.reduce((sum, r) => sum + (metric === 'steps' ? r.steps ?? 0 : r.sleepMinutes ?? 0), 0) / last2.length;
    if (priorAvg > 0 && last2Avg < 0.65 * priorAvg) {
      isShortDip = true;
    }
  }

  hypotheses.push({
    id: 'short_dip',
    title: 'Short Temporary Dip',
    description: 'This looks like an isolated 1-2 day dip following consistent adherence.',
    detected: isShortDip,
  });

  // Check 4: Activity timing shift
  hypotheses.push({
    id: 'activity_shift',
    title: 'Routine Shift',
    description: 'Your usual activity timing or daily pattern may have shifted recently.',
    detected: !isWeekendDip && !isWeekdayDip && !isShortDip && !hasUserContext,
  });

  return hypotheses;
}
