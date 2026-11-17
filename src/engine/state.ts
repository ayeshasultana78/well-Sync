/**
 * WellSync Engine - Deterministic State Machine
 *
 * Implements states: ON_TRACK, SLIPPING, LAPSED, RECOVERING.
 * Pure functions: processDay, evaluateHistory.
 */

import { calculateBaseline, normalizeDateString } from './baseline';
import { detectBarrierHypotheses } from './barriers';
import { DEFAULT_ENGINE_CONFIG, EngineConfig } from './config';
import { calculateLadderTargets, getTargetForLevel, stepDownOnLapse, stepUpLadder } from './ladder';
import { getTechniqueCard } from './recommendations';
import { BehaviorMetric, DailyRecord, DayEvaluation, EngineDayResult, LadderLevel, UserState } from './types';

export interface ProcessDayContext {
  previousResult: EngineDayResult | null;
  history: DailyRecord[];
  currentRecord: DailyRecord;
  metric: BehaviorMetric;
  userGoal: number;
  config?: EngineConfig;
}

/**
 * Calculates rolling 7-day mean of values ending at currentDate.
 */
export function calculate7DayMean(
  history: DailyRecord[],
  currentRecord: DailyRecord,
  metric: BehaviorMetric
): number {
  const normCurrent = normalizeDateString(currentRecord.date);
  const currentTimestamp = new Date(normCurrent + 'T00:00:00Z').getTime();
  const msPerDay = 24 * 60 * 60 * 1000;
  const windowStart = currentTimestamp - 6 * msPerDay; // 7 days inclusive: today and previous 6 days

  const allRecords = [...history, currentRecord];
  const dayValues: number[] = [];

  for (const r of allRecords) {
    const rTime = new Date(normalizeDateString(r.date) + 'T00:00:00Z').getTime();
    if (rTime >= windowStart && rTime <= currentTimestamp) {
      if (!r.isMissing) {
        const val = metric === 'steps' ? r.steps : r.sleepMinutes;
        if (typeof val === 'number' && !isNaN(val)) {
          dayValues.push(val);
        } else {
          dayValues.push(0);
        }
      } else {
        dayValues.push(0);
      }
    }
  }

  if (dayValues.length === 0) return 0;
  const sum = dayValues.reduce((a, b) => a + b, 0);
  return sum / dayValues.length;
}

/**
 * Processes a single day and produces the complete EngineDayResult.
 * Pure function: has no side-effects, relies strictly on provided context.
 */
export function processDay({
  previousResult,
  history,
  currentRecord,
  metric,
  userGoal,
  config = DEFAULT_ENGINE_CONFIG,
}: ProcessDayContext): EngineDayResult {
  const dateStr = normalizeDateString(currentRecord.date);

  // 1. Calculate Baseline for current day
  const { baseline, isColdStart } = calculateBaseline(
    history,
    dateStr,
    metric,
    userGoal,
    config
  );

  // 2. Ladder Targets
  const ladderTargets = calculateLadderTargets(baseline, userGoal, config);

  // 3. Determine actual value and missing state
  const rawVal = metric === 'steps' ? currentRecord.steps : currentRecord.sleepMinutes;
  const isMissing = Boolean(
    currentRecord.isMissing || rawVal === null || rawVal === undefined || isNaN(rawVal)
  );
  const actualValue = isMissing ? 0 : (rawVal as number);

  // 4. Day Evaluation (< 60% of baseline or missing = below-par)
  const thresholdValue = Math.round(baseline * config.belowParThresholdRatio);
  const ratio = baseline > 0 ? actualValue / baseline : 0;
  const isBelowPar = isMissing || actualValue < thresholdValue;

  const evaluation: DayEvaluation = {
    date: dateStr,
    metric,
    actualValue,
    baseline,
    thresholdValue,
    ratio: Math.round(ratio * 100) / 100,
    isBelowPar,
    isMissing,
  };

  // 5. Initial state from previousResult or default
  const prevState: UserState = previousResult?.state ?? 'ON_TRACK';
  let prevLadderLevel: LadderLevel = previousResult?.ladderLevel ?? 'TARGET';
  let consecutiveBelowPar = previousResult?.consecutiveBelowPar ?? 0;
  let consecutiveAtPar = previousResult?.consecutiveAtPar ?? 0;
  let consecutiveLadderSuccesses = previousResult?.consecutiveLadderSuccesses ?? 0;
  let activeDays = previousResult?.activeDays ?? 0;
  let returnCount = previousResult?.returnCount ?? 0;

  // 6. Update Active Days (activity recorded meeting or exceeding minimum rung, never resets)
  if (!isMissing && actualValue >= ladderTargets.minimum) {
    activeDays += 1;
  }

  // 7. Update consecutive below-par / at-par counts
  if (isBelowPar) {
    consecutiveBelowPar += 1;
    consecutiveAtPar = 0;
  } else {
    consecutiveAtPar += 1;
    consecutiveBelowPar = 0;
  }

  // 8. State Transitions
  let nextState: UserState = prevState;
  let nextLadderLevel: LadderLevel = prevLadderLevel;

  if (consecutiveBelowPar >= config.lapseConsecutiveDays) {
    // 3 or more consecutive below-par days = LAPSED
    nextState = 'LAPSED';
    nextLadderLevel = stepDownOnLapse();
    consecutiveLadderSuccesses = 0;
  } else if (prevState === 'LAPSED' && !isBelowPar) {
    // First at-par day after being lapsed = RECOVERING
    nextState = 'RECOVERING';
    // Ladder stays at MINIMUM during early recovery to consolidate
  } else if (prevState === 'RECOVERING') {
    if (!isBelowPar) {
      if (consecutiveAtPar >= config.recoveryConsecutiveAtParDays) {
        // 3 consecutive at-par days achieved = recovery complete, return to ON_TRACK
        nextState = 'ON_TRACK';
        returnCount += 1; // Completed recovery event
      } else {
        nextState = 'RECOVERING';
      }
    } else {
      // Below par while recovering
      if (consecutiveBelowPar >= config.lapseConsecutiveDays) {
        nextState = 'LAPSED';
        nextLadderLevel = stepDownOnLapse();
        consecutiveLadderSuccesses = 0;
      } else {
        nextState = 'RECOVERING';
      }
    }
  } else {
    // Check for SLIPPING: 7-day rolling mean < 80% of baseline and not lapsed
    const sevenDayMean = calculate7DayMean(history, currentRecord, metric);
    const isSlippingMean = baseline > 0 && sevenDayMean < baseline * config.slippingMeanRatio;

    if (isSlippingMean) {
      nextState = 'SLIPPING';
    } else {
      nextState = 'ON_TRACK';
    }
  }

  // 9. Evaluate Ladder Target Attainment & Step-up
  const currentLadderTarget = getTargetForLevel(ladderTargets, nextLadderLevel);
  const isTargetAttained = !isMissing && actualValue >= currentLadderTarget;

  if (isTargetAttained) {
    consecutiveLadderSuccesses += 1;
    // Step up one rung after 3 consecutive successes
    if (consecutiveLadderSuccesses >= config.ladderStepUpSuccesses) {
      const stepped = stepUpLadder(nextLadderLevel);
      if (stepped !== nextLadderLevel) {
        nextLadderLevel = stepped;
        consecutiveLadderSuccesses = 0;
      }
    }
  } else {
    consecutiveLadderSuccesses = 0;
  }

  // 10. Barrier hypotheses & recommendations
  const barrierHypotheses = detectBarrierHypotheses(history, currentRecord, metric);
  const techniqueCard = getTechniqueCard(nextState, nextLadderLevel);

  return {
    date: dateStr,
    state: nextState,
    previousState: prevState,
    ladderLevel: nextLadderLevel,
    ladderTargets,
    currentLadderTarget,
    isTargetAttained,
    baseline,
    isColdStart,
    evaluation,
    consecutiveBelowPar,
    consecutiveAtPar,
    consecutiveLadderSuccesses,
    activeDays,
    returnCount,
    barrierHypotheses,
    techniqueCard,
  };
}

/**
 * Evaluates an entire array of daily records in chronological order.
 */
export function evaluateHistory(
  records: DailyRecord[],
  userGoal: number,
  metric: BehaviorMetric,
  config: EngineConfig = DEFAULT_ENGINE_CONFIG
): EngineDayResult[] {
  // Sort records chronologically
  const sorted = [...records].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const results: EngineDayResult[] = [];
  const processedHistory: DailyRecord[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const currentRecord = sorted[i];
    const previousResult = results.length > 0 ? results[results.length - 1] : null;

    const dayResult = processDay({
      previousResult,
      history: processedHistory,
      currentRecord,
      metric,
      userGoal,
      config,
    });

    results.push(dayResult);

    // Save record with assignedState for baseline contamination checks
    processedHistory.push({
      ...currentRecord,
      assignedState: dayResult.state,
    });
  }

  return results;
}
