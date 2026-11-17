/**
 * WellSync Engine - Behavior Change Technique Recommendations
 *
 * Grounded in Michie et al. (2013) Behavior Change Technique Taxonomy v1 (BCTTv1).
 * Each recommendation provides:
 * 1. BCT code and official title
 * 2. Plain-language behavioral rationale
 * 3. Transparent limits of what the rule-based engine cannot know.
 */

import { LadderLevel, TechniqueCard, UserState } from './types';

/**
 * Returns a transparent technique card based on user state and active ladder rung.
 */
export function getTechniqueCard(state: UserState, ladderLevel: LadderLevel): TechniqueCard {
  switch (state) {
    case 'LAPSED':
      return {
        bctId: 'BCT 8.7',
        bctName: 'Graded Tasks',
        taxonomyRef: 'Michie et al. (2013) BCTTv1, Category 8: Repetition and Substitution',
        suggestion:
          'Step down to your Minimum rung (50% of baseline) for today. Focus on keeping the habit alive with minimal friction.',
        reason:
          'After 3 consecutive below-par days, high targets often trigger abandonment ("what-the-hell effect"). Stepping down preserves your behavioral identity without resetting progress.',
        limits:
          'The engine cannot assess physical fatigue, illness, injury, or emotional stress. Rest is a legitimate choice whenever needed.',
      };

    case 'SLIPPING':
      return {
        bctId: 'BCT 1.4',
        bctName: 'Action Planning',
        taxonomyRef: 'Michie et al. (2013) BCTTv1, Category 1: Goals and Planning',
        suggestion:
          'Plan a specific time, route, or routine for today (e.g., "I will walk for 15 minutes right after lunch").',
        reason:
          'Your 7-day rolling average dropped below 80% of your baseline. Proactive scheduling helps prevent a full lapse before momentum is lost.',
        limits:
          'This is an early trend indicator based solely on numbers. It cannot perceive whether your lower volume was an intentional recovery period.',
      };

    case 'RECOVERING':
      return {
        bctId: 'BCT 2.2',
        bctName: 'Feedback on Behaviour',
        taxonomyRef: 'Michie et al. (2013) BCTTv1, Category 2: Feedback and Monitoring',
        suggestion:
          'Welcome back! Maintain this gentle pace for 3 consecutive at-par days to securely re-establish your baseline rhythm.',
        reason:
          'You broke the lapse with an at-par day. Research indicates that stabilizing for 3 consecutive days cements recovery before raising demands.',
        limits:
          'The engine cannot forecast upcoming travel, weather, or work demands. Step up only when your body and schedule feel ready.',
      };

    case 'ON_TRACK':
    default:
      if (ladderLevel === 'STRETCH') {
        return {
          bctId: 'BCT 1.3',
          bctName: 'Review Behaviour Goal(s)',
          taxonomyRef: 'Michie et al. (2013) BCTTv1, Category 1: Goals and Planning',
          suggestion:
            'You unlocked the Stretch rung (+10%). This is an optional challenge for days when you have extra energy.',
          reason:
            'You achieved 3 consecutive target days. Periodically stretching expands physical self-efficacy without risking burnout.',
          limits:
            'Stretch goals are completely optional. Declining the stretch rung never resets your progress or lowers your baseline.',
        };
      }

      return {
        bctId: 'BCT 1.1',
        bctName: 'Goal Setting (Behaviour)',
        taxonomyRef: 'Michie et al. (2013) BCTTv1, Category 1: Goals and Planning',
        suggestion:
          'Aim for your Target goal today. Consistent, steady completion sustains your personalized baseline.',
        reason:
          'Your current activity matches your personal 28-day baseline. Steady self-monitoring reinforces routine habit automaticity.',
        limits:
          'Baselines reflect past behavior; they do not know if your sleep debt, workload, or temperature in Abu Dhabi requires extra hydration or rest.',
      };
  }
}
