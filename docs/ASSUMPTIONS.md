# WellSync Engine Specifications & Behavioral Assumptions

## 1. Overview & Competition Scope
WellSync is a competition prototype developed for the **Future Health Digital Innovation Challenge 2026 (Abu Dhabi)**, Challenge 09: *Sustaining Healthy Behaviors*. This document formally records all behavioral assumptions, mathematical thresholds, and configuration parameters embedded in the deterministic rule-based engine (`src/engine/`).

All engine defaults are centrally declared in `src/engine/config.ts` and can be adjusted for research calibration.

---

## 2. Core Behavioral Parameters & Configurable Defaults

| Parameter | Default Value | Rationale & Behavioral Basis |
| :--- | :--- | :--- |
| `baselineWindowDays` | **28 days** | A 4-week rolling window captures four complete weekend/weekday cycles while remaining responsive to seasonal or lifestyle changes. |
| `minValidDaysForBaseline` | **14 days** | Half of the 28-day window ensures statistical stability of the median before relying entirely on observed behavior. |
| `calibrationDays` | **7 valid days** | For the first 7 recorded days, `SLIPPING` and `LAPSED` state transitions are suppressed ("learning your baseline") to prevent false alarms during initial calibration. |
| `belowParThresholdPct` | **60% (0.60)** | A day with activity under 60% of baseline (or a missing day) indicates a substantial drop below typical behavior, warranting attention before a full lapse occurs. |
| `slippingThresholdPct` | **80% (0.80)** | A 7-day rolling mean under 80% of baseline signals an emerging downward trend before reaching consecutive lapse days. |
| `lapseConsecutiveDays` | **3 days** | 3 consecutive below-par days differentiate genuine behavioral lapses from temporary 1- or 2-day disruptions (e.g., travel, weather). |
| `recoveryConsecutiveDays` | **3 days** | 3 consecutive success days on the Minimum rung are required to demonstrate habit re-establishment before stepping back up to the Target rung. |
| `minimumLadderRatio` | **50% (0.50)** | In accordance with BCT 8.7 (*Graded tasks*), stepping the target down to 50% lowers psychological friction and restores self-efficacy. |
| `stretchLadderRatio` | **110% (1.10)** | Provides an attainable challenge when a user achieves sustained mastery (3 consecutive successes on Target). |

---

## 3. Mathematical Definitions

### 3.1 Single Baseline Definition
The engine utilizes a single, unified baseline calculation:
$$\text{Baseline} = \text{Median}\Big(\{ v_i \in \text{History} \mid \text{date}_i \in [t - 28, t - 1], \neg\text{isMissing}_i, \text{state}_i \neq \text{LAPSED} \}\Big)$$
- **Cold Start Rule**: If the number of valid (non-missing, non-lapsed) days in the 28-day window is fewer than **14 days**, the baseline falls back directly to the **user's declared goal** (or participant median in the replay).

### 3.2 Baseline Contamination Prevention
Days classified as `LAPSED` are **strictly excluded** from the rolling baseline window calculation. 
- *Rationale*: If lapse days (e.g., 2,000 steps during an illness) were incorporated into the rolling median, the baseline would artificially decline. This downward spiral would falsely redefine a deteriorated routine as "normal," lowering expectations and preventing genuine behavioral recovery.

### 3.3 Success Day Definition
A day is evaluated as a **Success Day** if and only if:
$$\text{actualValue} \ge \text{currentLadderTarget} \quad \text{and} \quad \neg\text{isMissing}$$
- *Consistency Resolution*: Because the Minimum rung is set at 50% of baseline (below the 60% below-par threshold), defining success relative to the **active rung target** ensures that users who achieve their stepped-down Minimum target are counted as successful, can complete their recovery, and step back up the ladder.
- The 60% below-par threshold is applied exclusively when on the **Target** or **Stretch** rung to detect emerging lapses.

### 3.4 3-Rung Adaptive Ladder Transitions
The engine maintains three ladder levels:
1. **Minimum Rung**: $0.50 \times \text{Baseline}$
2. **Target Rung**: $1.00 \times \text{Baseline}$ (or User Goal during cold start)
3. **Stretch Rung**: $1.10 \times \text{Target}$

**Transition Rules**:
- **Step-Down to Minimum**: Occurs immediately upon entering the `LAPSED` state (after 3 consecutive below-par days).
- **Step-Up to Target**: Occurs upon completing recovery (3 consecutive success days on the Minimum rung). Restores state to `ON_TRACK` and increments `returnCount`.
- **Step-Up to Stretch**: Occurs after 3 consecutive success days while on the Target rung.
- **Step-Down from Stretch**: If a below-par day occurs while on Stretch, the ladder reverts to Target.

---

## 4. Cumulative Progress (No Streak Resets)
WellSync deliberately rejects the punitive "streak that resets to zero" mechanic common in commercial wellness applications.
- **Active Days**: Cumulative count of days the user met their active ladder target. Never decreases or resets.
- **Return Count**: Cumulative count of completed recoveries from lapses. Each return represents a demonstrated act of psychological resilience.
- *Behavioral Justification*: Resetting streaks to zero triggers the "what-the-hell" effect (Cochran & Tesser, 1996), wherein a single lapse induces complete behavioral abandonment due to perceived total loss of progress.

---

## 5. Retrospective Replay Assumptions (LifeSnaps)
In the retrospective replay analysis (`analysis/replay.py`):
1. **Target Equals Participant Baseline**: For each participant, Target is dynamically set to their individual baseline ($\text{Target}_i = \text{Baseline}_i$).
2. **Cold Start Participant Fallback**: For each participant's first 13 valid days (before 14 valid days exist in the rolling window), the fallback goal equals that participant's overall median steps across their recorded history.
3. **Missing Day Treatment**: In wearable sensor data, unsynced or unrecorded calendar days are marked as missing (`isMissing = True`, `actualValue = 0`), which counts as a below-par day.
4. **Zero Participant Identifiers**: Replay outputs exported to the app contain strictly aggregated group metrics and zero individual identifiers.
