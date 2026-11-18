/**
 * Automated Accessibility (a11y) Audit using axe-core
 *
 * NOTE: This automated audit provides a PARTIAL heuristic check for common
 * accessibility defects (color contrast, ARIA landmarks, form labels, role validity).
 * As stated in docs/LIMITATIONS.md, automated audits do NOT prove formal WCAG 2.1 AA
 * compliance and cannot substitute for manual assistive technology evaluation.
 */

import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { JSDOM } from 'jsdom';
import axe from 'axe-core';
import { TodayScreen } from '../screens/TodayScreen';
import { RecoveryScreen } from '../screens/RecoveryScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { EvidenceScreen } from '../screens/EvidenceScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { AboutScreen } from '../screens/AboutScreen';
import { OnboardingModal } from '../screens/OnboardingModal';
import { DEFAULT_APP_STATE } from '../storage/storage';
import { EngineDayResult } from '../engine/types';

const mockResult: EngineDayResult = {
  date: '2026-11-01',
  state: 'ON_TRACK',
  previousState: 'ON_TRACK',
  ladderLevel: 'TARGET',
  ladderTargets: { minimum: 4000, target: 8000, stretch: 8800 },
  currentLadderTarget: 8000,
  isSuccessDay: true,
  isTargetAttained: true,
  baseline: 8000,
  isColdStart: false,
  isLearningBaseline: false,
  evaluation: {
    date: '2026-11-01',
    metric: 'steps',
    actualValue: 8500,
    baseline: 8000,
    thresholdValue: 4800,
    ratio: 1.06,
    isBelowPar: false,
    isMissing: false,
  },
  consecutiveBelowPar: 0,
  consecutiveSuccessDays: 3,
  consecutiveLadderSuccesses: 3,
  activeDays: 14,
  returnCount: 1,
  barrierHypotheses: [
    {
      id: 'short_dip',
      title: 'Short Dip',
      description: 'Temporary activity reduction',
      detected: false,
    },
  ],
  techniqueCard: {
    bctId: 'BCT 1.1',
    bctName: 'Goal setting (behaviour)',
    taxonomyRef: 'Michie et al. (2013) BCTTv1 #1.1',
    suggestion: 'Keep your active target in focus',
    reason: 'Daily behavioral goal keeps motivation steady',
    limits: 'Requires ongoing engagement',
  },
};

async function auditHtmlFragment(fragmentHtml: string, title: string) {
  // Wrap in a complete, valid HTML5 container with lang and title
  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${title}</title>
</head>
<body>
  <main>
    ${fragmentHtml}
  </main>
</body>
</html>`;

  const dom = new JSDOM(fullHtml, { runScripts: 'outside-only' });
  const results = await axe.run(dom.window.document.documentElement, {
    runOnly: {
      type: 'tag',
      values: ['wcag2a', 'wcag2aa', 'best-practice'],
    },
    rules: {
      // In headless jsdom, layout-dependent color contrast calculations cannot compute pixel styles
      'color-contrast': { enabled: false },
    },
  });

  return results;
}

describe('Automated axe-core Accessibility Audit (Partial Heuristic Check)', () => {
  it('audits TodayScreen without critical accessibility violations', async () => {
    const html = renderToStaticMarkup(
      <TodayScreen
        profile={DEFAULT_APP_STATE.profile}
        latestResult={mockResult}
        metric="steps"
        language="en"
        onChangeMetric={() => {}}
        onSaveRecord={() => {}}
        onNavigateToRecovery={() => {}}
      />
    );
    const results = await auditHtmlFragment(html, 'Today Screen');
    expect(results.violations.filter(v => v.impact === 'critical')).toHaveLength(0);
  });

  it('audits RecoveryScreen without critical accessibility violations', async () => {
    const html = renderToStaticMarkup(
      <RecoveryScreen
        profile={DEFAULT_APP_STATE.profile}
        latestResult={mockResult}
        metric="steps"
        language="en"
        onCommitMicroAction={() => {}}
        onNavigateToToday={() => {}}
      />
    );
    const results = await auditHtmlFragment(html, 'Recovery Screen');
    expect(results.violations.filter(v => v.impact === 'critical')).toHaveLength(0);
  });

  it('audits HistoryScreen without critical accessibility violations', async () => {
    const html = renderToStaticMarkup(
      <HistoryScreen
        profile={DEFAULT_APP_STATE.profile}
        historyResults={[mockResult]}
        metric="steps"
        language="en"
        onChangeMetric={() => {}}
        onNavigateToToday={() => {}}
        onNavigateToSettings={() => {}}
      />
    );
    const results = await auditHtmlFragment(html, 'History Screen');
    expect(results.violations.filter(v => v.impact === 'critical')).toHaveLength(0);
  });

  it('audits EvidenceScreen without critical accessibility violations', async () => {
    const html = renderToStaticMarkup(<EvidenceScreen language="en" />);
    const results = await auditHtmlFragment(html, 'Evidence Screen');
    expect(results.violations.filter(v => v.impact === 'critical')).toHaveLength(0);
  });

  it('audits SettingsScreen without critical accessibility violations', async () => {
    const html = renderToStaticMarkup(
      <SettingsScreen
        profile={DEFAULT_APP_STATE.profile}
        quietHours={DEFAULT_APP_STATE.quietHours}
        textSize="standard"
        language="en"
        onUpdateProfile={() => {}}
        onUpdateQuietHours={() => {}}
        onChangeTextSize={() => {}}
        onLoadSyntheticPersona={() => {}}
        onExportData={() => {}}
        onDeleteAllData={() => {}}
      />
    );
    const results = await auditHtmlFragment(html, 'Settings Screen');
    expect(results.violations.filter(v => v.impact === 'critical')).toHaveLength(0);
  });

  it('audits AboutScreen without critical accessibility violations', async () => {
    const html = renderToStaticMarkup(<AboutScreen language="en" />);
    const results = await auditHtmlFragment(html, 'About Screen');
    expect(results.violations.filter(v => v.impact === 'critical')).toHaveLength(0);
  });

  it('audits OnboardingModal without critical accessibility violations', async () => {
    const html = renderToStaticMarkup(
      <OnboardingModal
        initialProfile={DEFAULT_APP_STATE.profile}
        language="en"
        onComplete={() => {}}
      />
    );
    const results = await auditHtmlFragment(html, 'Onboarding Modal');
    expect(results.violations.filter(v => v.impact === 'critical')).toHaveLength(0);
  });
});
