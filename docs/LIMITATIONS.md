# WellSync Limitations & Risk Analysis

## 1. Project & Team Status
- **Competition Context**: Prototype engineered for the **Future Health Digital Innovation Challenge 2026 (Abu Dhabi)**, Challenge 09: *Sustaining Healthy Behaviors*.
- **Student Status**: Developed entirely by **two undergraduate university students** with no institutional clinical partner, no healthcare provider backing, and zero commercial affiliations.
- **Zero Human Clinical Testing**: The application has undergone **zero clinical trials, zero formal user testing, and zero randomized controlled evaluations**. All performance data presented is derived exclusively from retrospective algorithmic replays on an open-access dataset.

---

## 2. Scope & Behavioral Restrictions
- **Behaviors Supported**: The system is strictly restricted to **daily steps (count)** and **sleep duration (hours/minutes)**. No nutritional logging, heart-rate variability diagnostics, caloric expenditure claims, or medication adherence tracking are included.
- **Rule-Based Engine Only**: WellSync explicitly disclaims any use of artificial intelligence, deep learning, or large language models at runtime. The engine executes 100% deterministic, inspectable rules.

---

## 3. Dataset & Demographic Limitations
- **LifeSnaps Cohort Scope**: The retrospective replay utilizes data from the open-access LifeSnaps dataset (Zenodo 7229547).
- **Non-Abu Dhabi Cohort**: The LifeSnaps cohort consists of a multi-national research sample and **is not an Abu Dhabi or UAE sample**.
- **Generalizability Warning**: Behavioral rhythms, climate adaptations (e.g., extreme summer heat affecting outdoor walking in the GCC), cultural routines, and demographic distributions in Abu Dhabi differ fundamentally from the LifeSnaps cohort. These results **must not be assumed representative** of UAE or GCC populations without localized validation.
- **Replay vs. Proven Change**: A retrospective replay demonstrates solely how algorithmic rules classify and respond to static historical sensor traces. It **does not prove behavior change** or long-term habit formation in live participants.

---

## 4. Barrier Hypothesis Limitations
- **Strictly Non-Clinical**: Barrier hypotheses generated during recovery are limited to four mechanical patterns:
  1. *Weekday vs. Weekend Pattern*
  2. *Short Dip (1–2 day drop)*
  3. *Routine Shift (change in timing of activity)*
  4. *Self-Declared Context (user-selected tags: travel, busy, illness, weather)*
- **User Veto Rights**: Because rule-based hypotheses lack clinical context, users have the absolute right to reject any suggested barrier. Rejected hypotheses are permanently flagged and suppressed.
- **No Diagnostic Inferences**: The engine never infers medical conditions (e.g., diagnosing clinical depression from prolonged low steps, or sleep apnea from sleep fragmentation).

---

## 5. Deliberately Excluded Features & Risk Analysis

The following features were intentionally excluded from WellSync due to well-documented psychological and ethical risks:

| Excluded Feature | Psychological & Ethical Risk Identified | WellSync Design Choice |
| :--- | :--- | :--- |
| **Workplace / Employer Dashboards** | Creates workplace surveillance, coercion, and discriminatory performance evaluations based on biometric telemetry. | Zero backend, zero external reporting, zero employer/insurer export formats. |
| **Insurer Access & Premium Incentives** | Promotes penalty-based health stratification and punishes users experiencing chronic illness or socioeconomic barriers. | All data is stored strictly in the user's browser `localStorage` and never leaves the device. |
| **Public Peer Leaderboards & Streaks** | Triggers toxic social comparison, shame, anxiety, and the "what-the-hell" abandonment effect when a streak is broken. | Progress is tracked via cumulative **Active Days** and **Return Count**, with no public sharing or zero-resets. |
| **Social Competitions & Ranking** | Marginalizes individuals recovering from illness or injury; disincentivizes users who cannot compete with high-activity peers. | Focus is placed exclusively on intra-individual progress against one's own rolling baseline. |

---

## 6. Translation Limitations
- **Arabic Localization**: WellSync provides complete English and Arabic interfaces with bidirectional right-to-left (RTL) layout.
- **Unreviewed Status**: The Arabic translation was drafted by the student engineering team and has **not yet been reviewed by an accredited native Arabic linguist or behavioral clinician**. A prominent, persistent disclaimer is rendered on all Arabic views to transparently inform users.
