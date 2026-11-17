/**
 * WellSync Engine Test Suite
 *
 * Comprehensive Vitest tests covering:
 * - Transitions (ON_TRACK, SLIPPING, LAPSED, RECOVERING)
 * - Ladder stepping (step-down on lapse, step-up after 3 successes)
 * - Cold start (< 14 days fallback to user goal)
 * - Missing days and null records
 * - Time zone changes & date normalization
 * - Baseline contamination protection (excluding LAPSED days)
 * - BCTTv1 technique cards and barrier hypotheses
 */

import { describe, expect, it } from 'vitest';
import { calculateBaseline, calculateMedian, normalizeDateString } from '../baseline';
import { detectBarrierHypotheses } from '../barriers';
import { DEFAULT_ENGINE_CONFIG } from '../config';
import { calculateLadderTargets, getTargetForLevel, stepDownOnLapse, stepUpLadder } from '../ladder';
import { getTechniqueCard } from '../recommendations';
import { evaluateHistory, processDay } from '../state';
import { DailyRecord } from '../types';

describe('WellSync Engine - Baseline & Median Calculations', () => {
  it('calculates median correctly for odd and even length arrays', () => {
    expect(calculateMedian([5000, 7000, 10000])).toBe(7000);
    expect(calculateMedian([5000, 7000, 9000, 11000])).toBe(8000);
    expect(calculateMedian([10000])).toBe(10000);
    expect(calculateMedian([])).toBe(0);
    // Unsorted array
    expect(calculateMedian([12000, 4000, 8000])).toBe(8000);
  });

  it('normalizes dates reliably across formats and time zone offsets', () => {
    expect(normalizeDateString('2026-11-17')).toBe('2026-11-17');
    expect(normalizeDateString('2026-11-17T14:30:00Z')).toBe('2026-11-17');
    expect(normalizeDateString(new Date('2026-11-20T00:00:00Z'))).toBe('2026-11-20');
  });

  it('enforces cold start when history has fewer than 14 valid days', () => {
    const userGoal = 8000;
    const history: DailyRecord[] = [];

    // 0 days
    const res0 = calculateBaseline(history, '2026-11-01', 'steps', userGoal);
    expect(res0.isColdStart).toBe(true);
    expect(res0.baseline).toBe(userGoal);
    expect(res0.validDaysCount).toBe(0);

    // 13 days of data
    for (let i = 1; i <= 13; i++) {
      history.push({
        date: `2026-10-${String(i).padStart(2, '0')}`,
        steps: 6000,
      });
    }

    const res13 = calculateBaseline(history, '2026-10-14', 'steps', userGoal);
    expect(res13.isColdStart).toBe(true);
    expect(res13.baseline).toBe(userGoal);
    expect(res13.validDaysCount).toBe(13);

    // 14th day added -> cold start ceases
    history.push({ date: '2026-10-14', steps: 6000 });
    const res14 = calculateBaseline(history, '2026-10-15', 'steps', userGoal);
    expect(res14.isColdStart).toBe(false);
    expect(res14.baseline).toBe(6000);
    expect(res14.validDaysCount).toBe(14);
  });

  it('prevents baseline contamination by strictly excluding LAPSED days', () => {
    const userGoal = 10000;
    const history: DailyRecord[] = [];

    // 20 days of healthy activity at 10,000 steps
    for (let i = 1; i <= 20; i++) {
      history.push({
        date: `2026-10-${String(i).padStart(2, '0')}`,
        steps: 10000,
        assignedState: 'ON_TRACK',
      });
    }

    // 5 days of severe lapse at 1,000 steps, flagged as LAPSED
    for (let i = 21; i <= 25; i++) {
      history.push({
        date: `2026-10-${String(i).padStart(2, '0')}`,
        steps: 1000,
        assignedState: 'LAPSED',
      });
    }

    // On Oct 26, baseline should exclude the 5 LAPSED days
    const res = calculateBaseline(history, '2026-10-26', 'steps', userGoal);
    expect(res.validDaysCount).toBe(20);
    expect(res.baseline).toBe(10000);
    expect(res.windowValues.includes(1000)).toBe(false);
  });
});

describe('WellSync Engine - Ladder Target Mechanics', () => {
  it('calculates Minimum (50% baseline), Target (user goal), Stretch (target + 10%)', () => {
    const baseline = 8000;
    const userGoal = 8000;
    const targets = calculateLadderTargets(baseline, userGoal, DEFAULT_ENGINE_CONFIG);

    expect(targets.minimum).toBe(4000); // 50% of 8000
    expect(targets.target).toBe(8000); // user goal
    expect(targets.stretch).toBe(8800); // 8000 + 10%
  });

  it('steps down immediately to MINIMUM on lapse', () => {
    expect(stepDownOnLapse()).toBe('MINIMUM');
  });

  it('steps up ladder levels sequentially', () => {
    expect(stepUpLadder('MINIMUM')).toBe('TARGET');
    expect(stepUpLadder('TARGET')).toBe('STRETCH');
    expect(stepUpLadder('STRETCH')).toBe('STRETCH');
  });

  it('retrieves correct target numbers per level', () => {
    const targets = { minimum: 3500, target: 7000, stretch: 7700 };
    expect(getTargetForLevel(targets, 'MINIMUM')).toBe(3500);
    expect(getTargetForLevel(targets, 'TARGET')).toBe(7000);
    expect(getTargetForLevel(targets, 'STRETCH')).toBe(7700);
  });
});

describe('WellSync Engine - Day Evaluation and State Transitions', () => {
  it('identifies below-par day when below 60% of baseline or missing', () => {
    const userGoal = 10000;

    // Normal day: 7,000 steps (70% >= 60%) -> at-par
    const normalDay = processDay({
      previousResult: null,
      history: [],
      currentRecord: { date: '2026-11-01', steps: 7000 },
      metric: 'steps',
      userGoal,
    });
    expect(normalDay.evaluation.isBelowPar).toBe(false);

    // Below-par day: 5,500 steps (55% < 60%)
    const lowDay = processDay({
      previousResult: normalDay,
      history: [{ date: '2026-11-01', steps: 7000 }],
      currentRecord: { date: '2026-11-02', steps: 5500 },
      metric: 'steps',
      userGoal,
    });
    expect(lowDay.evaluation.isBelowPar).toBe(true);

    // Missing day: steps null / isMissing
    const missingDay = processDay({
      previousResult: lowDay,
      history: [
        { date: '2026-11-01', steps: 7000 },
        { date: '2026-11-02', steps: 5500 },
      ],
      currentRecord: { date: '2026-11-03', steps: null, isMissing: true },
      metric: 'steps',
      userGoal,
    });
    expect(missingDay.evaluation.isBelowPar).toBe(true);
    expect(missingDay.evaluation.isMissing).toBe(true);
  });

  it('transitions to LAPSED on exactly 3 consecutive below-par days and steps ladder down', () => {
    const userGoal = 10000;
    // 7 initial solid days so that rolling 7-day mean stays >= 80% until 3rd below-par day
    const records: DailyRecord[] = [
      { date: '2026-10-25', steps: 10000 },
      { date: '2026-10-26', steps: 10000 },
      { date: '2026-10-27', steps: 10000 },
      { date: '2026-10-28', steps: 10000 },
      { date: '2026-10-29', steps: 10000 },
      { date: '2026-10-30', steps: 10000 },
      { date: '2026-10-31', steps: 10000 }, // at-par baseline established
      { date: '2026-11-01', steps: 5000 }, // Day 1 below-par (< 6000)
      { date: '2026-11-02', steps: 5000 }, // Day 2 below-par (< 6000)
      { date: '2026-11-03', steps: 4000 }, // Day 3 below-par -> LAPSED
    ];

    const results = evaluateHistory(records, userGoal, 'steps');

    // Day 7 (Oct 31)
    expect(results[6].state).toBe('ON_TRACK');

    // Day 8 (Nov 01): 1 below-par day
    expect(results[7].consecutiveBelowPar).toBe(1);
    expect(results[7].state).toBe('ON_TRACK');

    // Day 9 (Nov 02): 2 below-par days
    expect(results[8].consecutiveBelowPar).toBe(2);
    expect(results[8].state).toBe('ON_TRACK');

    // Day 10 (Nov 03): 3 below-par days -> LAPSED
    expect(results[9].consecutiveBelowPar).toBe(3);
    expect(results[9].state).toBe('LAPSED');
    expect(results[9].ladderLevel).toBe('MINIMUM');
    expect(results[9].ladderTargets.minimum).toBe(5000); // 50% of 10000
  });

  it('transitions to RECOVERING on first at-par day after lapse and returns to ON_TRACK after 3 consecutive at-par days', () => {
    const userGoal = 10000;
    const records: DailyRecord[] = [
      { date: '2026-11-01', steps: 3000 }, // 1
      { date: '2026-11-02', steps: 3000 }, // 2
      { date: '2026-11-03', steps: 3000 }, // 3 -> LAPSED
      { date: '2026-11-04', steps: 7000 }, // at-par (>=6000) -> enters RECOVERING (day 1)
      { date: '2026-11-05', steps: 7500 }, // at-par -> RECOVERING (day 2)
      { date: '2026-11-06', steps: 8000 }, // at-par -> RECOVERING (day 3) -> ON_TRACK!
    ];

    const results = evaluateHistory(records, userGoal, 'steps');

    expect(results[2].state).toBe('LAPSED');
    expect(results[2].returnCount).toBe(0);

    // Day 4: First at-par day after lapse
    expect(results[3].state).toBe('RECOVERING');
    expect(results[3].consecutiveAtPar).toBe(1);
    expect(results[3].returnCount).toBe(0);

    // Day 5: Second at-par day
    expect(results[4].state).toBe('RECOVERING');
    expect(results[4].consecutiveAtPar).toBe(2);
    expect(results[4].returnCount).toBe(0);

    // Day 6: Third at-par day completes recovery
    expect(results[5].state).toBe('ON_TRACK');
    expect(results[5].consecutiveAtPar).toBe(3);
    expect(results[5].returnCount).toBe(1); // Increment returnCount!
  });

  it('detects SLIPPING when 7-day rolling mean falls below 80% without reaching 3 consecutive below-par days', () => {
    const userGoal = 10000;
    // Intermittent pattern where 7-day mean drops below 8000 but consecutive below-par is never >= 3
    const records: DailyRecord[] = [
      { date: '2026-11-01', steps: 10000 },
      { date: '2026-11-02', steps: 10000 },
      { date: '2026-11-03', steps: 10000 },
      { date: '2026-11-04', steps: 6000 },
      { date: '2026-11-05', steps: 6000 },
      { date: '2026-11-06', steps: 6000 },
      { date: '2026-11-07', steps: 6000 }, // 7-day mean = (10000*3 + 6000*4)/7 = 7714 < 8000 (80%)
    ];

    const results = evaluateHistory(records, userGoal, 'steps');
    expect(results[6].state).toBe('SLIPPING');
  });

  it('steps up the ladder one rung after 3 consecutive target successes', () => {
    const userGoal = 10000;
    // Start at MINIMUM after a lapse
    const records: DailyRecord[] = [
      { date: '2026-11-01', steps: 2000 }, // 1 (< 6000)
      { date: '2026-11-02', steps: 2000 }, // 2 (< 6000)
      { date: '2026-11-03', steps: 2000 }, // 3 -> LAPSED, ladder=MINIMUM (5000)
      { date: '2026-11-04', steps: 7000 }, // at-par (>=6000), success 1 at MINIMUM (>=5000)
      { date: '2026-11-05', steps: 7000 }, // at-par (>=6000), success 2 at MINIMUM (>=5000)
      { date: '2026-11-06', steps: 7000 }, // at-par (>=6000), success 3 at MINIMUM (>=5000) -> steps up to TARGET
    ];

    const results = evaluateHistory(records, userGoal, 'steps');
    expect(results[2].ladderLevel).toBe('MINIMUM');
    expect(results[3].ladderLevel).toBe('MINIMUM');
    expect(results[4].ladderLevel).toBe('MINIMUM');
    // On 3rd success, ladder steps up from MINIMUM to TARGET
    expect(results[5].ladderLevel).toBe('TARGET');
  });

  it('never resets active days to zero on lapse', () => {
    const userGoal = 8000;
    const records: DailyRecord[] = [
      { date: '2026-11-01', steps: 8000 }, // active day 1
      { date: '2026-11-02', steps: 8500 }, // active day 2
      { date: '2026-11-03', steps: 9000 }, // active day 3
      { date: '2026-11-04', steps: 1000 }, // below-par 1
      { date: '2026-11-05', steps: 1000 }, // below-par 2
      { date: '2026-11-06', steps: 1000 }, // below-par 3 -> LAPSED
    ];

    const results = evaluateHistory(records, userGoal, 'steps');
    expect(results[2].activeDays).toBe(3);
    // Even after entering LAPSED, activeDays remains 3 (never reset to 0!)
    expect(results[5].state).toBe('LAPSED');
    expect(results[5].activeDays).toBe(3);
  });
});

describe('WellSync Engine - Missing Days, Time Zones & Barrier Hypotheses', () => {
  it('handles missing records without error and preserves state integrity', () => {
    const userGoal = 8000;
    const records: DailyRecord[] = [
      { date: '2026-11-01', steps: 8000 },
      { date: '2026-11-02', isMissing: true },
      { date: '2026-11-03', steps: undefined },
      { date: '2026-11-04', steps: null },
    ];

    const results = evaluateHistory(records, userGoal, 'steps');
    expect(results[1].evaluation.isMissing).toBe(true);
    expect(results[2].evaluation.isMissing).toBe(true);
    expect(results[3].evaluation.isMissing).toBe(true);
    expect(results[3].state).toBe('LAPSED');
  });

  it('evaluates barrier hypotheses non-medically with rejection capability', () => {
    const current: DailyRecord = {
      date: '2026-11-15', // Sunday
      steps: 2000,
      contextNote: 'Double shift at hospital',
    };

    const hypotheses = detectBarrierHypotheses([], current, 'steps');
    expect(hypotheses.some((h) => h.id === 'user_context' && h.detected)).toBe(true);

    const userContextHypothesis = hypotheses.find((h) => h.id === 'user_context');
    expect(userContextHypothesis?.description).toContain('Double shift at hospital');
  });

  it('generates appropriate Michie BCTTv1 technique cards per state', () => {
    const lapsedCard = getTechniqueCard('LAPSED', 'MINIMUM');
    expect(lapsedCard.bctId).toBe('BCT 8.7');
    expect(lapsedCard.bctName).toBe('Graded Tasks');
    expect(lapsedCard.limits).toContain('The engine cannot assess physical fatigue');

    const slippingCard = getTechniqueCard('SLIPPING', 'TARGET');
    expect(slippingCard.bctId).toBe('BCT 1.4');
    expect(slippingCard.bctName).toBe('Action Planning');

    const recoveringCard = getTechniqueCard('RECOVERING', 'MINIMUM');
    expect(recoveringCard.bctId).toBe('BCT 2.2');
    expect(recoveringCard.bctName).toBe('Feedback on Behaviour');

    const onTrackStretchCard = getTechniqueCard('ON_TRACK', 'STRETCH');
    expect(onTrackStretchCard.bctId).toBe('BCT 1.3');
    expect(onTrackStretchCard.bctName).toBe('Review Behaviour Goal(s)');
  });

  it('handles below-par days during recovery correctly', () => {
    const userGoal = 10000;
    // Enter lapse, start recovery, experience a single below-par day, then complete recovery
    const records: DailyRecord[] = [
      { date: '2026-11-01', steps: 2000 },
      { date: '2026-11-02', steps: 2000 },
      { date: '2026-11-03', steps: 2000 }, // LAPSED
      { date: '2026-11-04', steps: 7000 }, // RECOVERING day 1
      { date: '2026-11-05', steps: 4000 }, // below-par day during recovery (< 6000)
      { date: '2026-11-06', steps: 7500 }, // at-par day 1 of new streak
      { date: '2026-11-07', steps: 7500 }, // at-par day 2
      { date: '2026-11-08', steps: 7500 }, // at-par day 3 -> ON_TRACK!
    ];

    const results = evaluateHistory(records, userGoal, 'steps');
    expect(results[2].state).toBe('LAPSED');
    expect(results[3].state).toBe('RECOVERING');
    // Day 5: 1 below-par day during recovery does not trigger LAPSED yet, stays RECOVERING
    expect(results[4].state).toBe('RECOVERING');
    expect(results[4].consecutiveBelowPar).toBe(1);
    expect(results[4].consecutiveAtPar).toBe(0);

    // Day 8: Recovery completed after 3 at-par days
    expect(results[7].state).toBe('ON_TRACK');
    expect(results[7].returnCount).toBe(1);
  });

  it('re-triggers LAPSED if 3 consecutive below-par days occur during recovery', () => {
    const userGoal = 10000;
    const records: DailyRecord[] = [
      { date: '2026-11-01', steps: 2000 },
      { date: '2026-11-02', steps: 2000 },
      { date: '2026-11-03', steps: 2000 }, // LAPSED
      { date: '2026-11-04', steps: 7000 }, // RECOVERING
      { date: '2026-11-05', steps: 3000 }, // below-par 1
      { date: '2026-11-06', steps: 3000 }, // below-par 2
      { date: '2026-11-07', steps: 3000 }, // below-par 3 -> re-enters LAPSED!
    ];

    const results = evaluateHistory(records, userGoal, 'steps');
    expect(results[3].state).toBe('RECOVERING');
    expect(results[6].state).toBe('LAPSED');
    expect(results[6].ladderLevel).toBe('MINIMUM');
  });

  it('evaluates sleep metric seamlessly using sleepMinutes', () => {
    const userGoalSleep = 480; // 8 hours in minutes
    const records: DailyRecord[] = [
      { date: '2026-11-01', sleepMinutes: 480 },
      { date: '2026-11-02', sleepMinutes: 450 },
      { date: '2026-11-03', sleepMinutes: 200 }, // below 60% of 480 (288m)
      { date: '2026-11-04', sleepMinutes: 220 },
      { date: '2026-11-05', sleepMinutes: 180 }, // 3rd low sleep day -> LAPSED
    ];

    const results = evaluateHistory(records, userGoalSleep, 'sleep');
    expect(results[0].state).toBe('ON_TRACK');
    expect(results[4].state).toBe('LAPSED');
    expect(results[4].ladderTargets.minimum).toBe(240); // 50% of 480m = 4h
  });
});
