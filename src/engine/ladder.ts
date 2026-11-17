/**
 * WellSync Engine - Personal Action Ladder
 *
 * Implements the 3-rung ladder: Minimum (50% baseline), Target (user goal), Stretch (Target + 10%).
 * Handles step-down upon lapse and step-up after 3 consecutive successes.
 */

import { DEFAULT_ENGINE_CONFIG, EngineConfig } from './config';
import { LadderLevel, LadderTargets } from './types';

/**
 * Calculates current targets for all three ladder rungs.
 */
export function calculateLadderTargets(
  baseline: number,
  userGoal: number,
  config: EngineConfig = DEFAULT_ENGINE_CONFIG
): LadderTargets {
  const minimum = Math.round(baseline * config.ladderMinimumRatio);
  const target = Math.round(userGoal * config.ladderTargetRatio);
  const stretch = Math.round(target * config.ladderStretchRatio);

  return {
    minimum: Math.max(1, minimum),
    target: Math.max(1, target),
    stretch: Math.max(1, stretch),
  };
}

/**
 * Gets numerical target value for a specific ladder level.
 */
export function getTargetForLevel(targets: LadderTargets, level: LadderLevel): number {
  switch (level) {
    case 'MINIMUM':
      return targets.minimum;
    case 'TARGET':
      return targets.target;
    case 'STRETCH':
      return targets.stretch;
  }
}

/**
 * Steps down ladder to MINIMUM when entering LAPSED state.
 */
export function stepDownOnLapse(): LadderLevel {
  return 'MINIMUM';
}

/**
 * Steps up one level after required consecutive successes.
 * MINIMUM -> TARGET -> STRETCH
 */
export function stepUpLadder(currentLevel: LadderLevel): LadderLevel {
  if (currentLevel === 'MINIMUM') return 'TARGET';
  if (currentLevel === 'TARGET') return 'STRETCH';
  return 'STRETCH';
}
