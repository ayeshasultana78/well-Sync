/**
 * WellSync Engine Configuration & Defaults
 *
 * All parameters are centralized here and documented in docs/ASSUMPTIONS.md.
 * These defaults follow the Challenge 09 specification and behavioral science rationale.
 */

export interface EngineConfig {
  /** Number of calendar days to look back for rolling baseline (default 28) */
  baselineWindowDays: number;
  /** Minimum valid at-par or non-lapse days required to compute baseline (default 14). Below this, use user goal */
  minValidDaysForBaseline: number;
  /** Threshold below which a day is classified as below-par (default 0.60 = 60% of baseline) */
  belowParThresholdRatio: number;
  /** Consecutive below-par days required to enter LAPSED state (default 3) */
  lapseConsecutiveDays: number;
  /** 7-day rolling mean ratio below which state is SLIPPING if not lapsed (default 0.80 = 80% of baseline) */
  slippingMeanRatio: number;
  /** Consecutive at-par days required to complete RECOVERING and return to ON_TRACK (default 3) */
  recoveryConsecutiveAtParDays: number;
  /** Ladder minimum rung multiplier relative to baseline (default 0.50 = 50%) */
  ladderMinimumRatio: number;
  /** Ladder target rung multiplier relative to user goal (default 1.00 = 100%) */
  ladderTargetRatio: number;
  /** Ladder stretch rung multiplier relative to target goal (default 1.10 = 110%) */
  ladderStretchRatio: number;
  /** Consecutive target/ladder successes required to step up one ladder rung (default 3) */
  ladderStepUpSuccesses: number;
}

export const DEFAULT_ENGINE_CONFIG: EngineConfig = {
  baselineWindowDays: 28,
  minValidDaysForBaseline: 14,
  belowParThresholdRatio: 0.60,
  lapseConsecutiveDays: 3,
  slippingMeanRatio: 0.80,
  recoveryConsecutiveAtParDays: 3,
  ladderMinimumRatio: 0.50,
  ladderTargetRatio: 1.00,
  ladderStretchRatio: 1.10,
  ladderStepUpSuccesses: 3,
};
