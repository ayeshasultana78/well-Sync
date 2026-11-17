# WellSync Clinical Safety & Ethical Guardrails

## 1. Non-Medical & Non-Diagnostic Stance
WellSync is explicitly designed as a **behavioral self-regulation and habit maintenance tool**. It is:
- **NOT** a medical device.
- **NOT** intended to diagnose, treat, cure, or prevent any physical or mental health condition.
- **NOT** a substitute for professional clinical advice, medical diagnosis, or therapy.

Users experiencing chronic fatigue, persistent insomnia, severe depressive symptoms, physical pain, or acute stress are strongly encouraged to consult a licensed healthcare professional.

---

## 2. Prohibition of Diagnostic Inference
The WellSync engine adheres to strict safety boundaries regarding biometric interpretation:
- **No Pathological Labeling**: The engine never equates low activity with clinical depression, nor does it label erratic sleep patterns as clinical insomnia or circadian rhythm disorders.
- **Rule-Based Descriptive Feedback**: Drops in activity are labeled strictly in behavioral terms (e.g., "Below-Par Day", "Temporary Behavioral Lapse", "Slipping Trend").
- **No Medication Advice**: The application never suggests medications, supplements, or medical interventions.

---

## 3. Barrier Hypothesis Architecture & User Veto Rights
When a behavioral lapse occurs (3 consecutive below-par days), the recovery interface surfaces potential reasons for the disruption. To ensure clinical safety and ethical validity, these hypotheses are governed by strict constraints:

### 3.1 Allowed Hypothesis Types (Strictly Non-Clinical)
1. **Weekday vs. Weekend Pattern**: Detects whether drops systematically align with weekend or weekday transitions.
2. **Short Dip**: Identifies isolated 1- or 2-day drops that have occurred within an otherwise stable routine.
3. **Routine Timing Shift**: Detects if activity was shifted to unusual hours (e.g., late evening walking).
4. **Self-Declared Context**: Enables the user to voluntarily tag personal circumstances (e.g., *Travel / Commute*, *Heavy Workload*, *Mild Illness*, *Inclement Weather*).

### 3.2 User Veto Rights
- Every hypothesis is presented as an inquiry, never an assertion.
- The user has an explicit, accessible **"Reject Hypothesis"** button for every suggestion.
- When rejected, the hypothesis is marked as invalid for that recovery cycle, respecting user agency and avoiding cognitive resistance.

---

## 4. Psychological Safety & Non-Punitive Design
Commercial fitness trackers frequently induce psychological distress through punitive streak-tracking mechanics. WellSync counteracts these risks:

| Risk in Standard Trackers | WellSync Safety Mechanism |
| :--- | :--- |
| **"What-The-Hell" Effect (Lapse to Relapse)** | Standard apps reset streaks to zero after a single missed day, causing users to abandon habits in frustration. WellSync **never resets progress to zero**; targets step down to a manageable 50% Minimum rung. |
| **Streak Anxiety & Compulsive Behavior** | Users often force themselves to exercise through illness or injury to protect an arbitrary number. WellSync explicitly accommodates recovery through low-intensity micro-commitments. |
| **Punitive Language & Shaming** | WellSync completely omits words like "failed", "broken", "lazy", or "guilty". State transitions use objective, supportive terminology (*On Track*, *Slipping*, *Lapsed*, *Recovering*). |
| **Burnout from Static Goals** | Rigid targets (e.g., 10,000 steps every day) fail to account for physiological recovery. WellSync adapts targets based on the user's rolling 28-day baseline. |

---

## 5. Local Data Sovereignty & Zero External Transmission
To prevent surveillance risks, data leakage, and unauthorized commercial exploitation:
- **Zero Cloud Backend**: All user data resides solely in the client browser's `localStorage`.
- **Zero Third-Party Scripts**: No Google Analytics, Facebook Pixel, tracking pixels, or external CDN scripts are loaded.
- **Zero Runtime AI Calls**: No prompts or personal biometric data are ever transmitted to OpenAI, Anthropic, Google Gemini, or any LLM provider.
- **Genuine Erase**: The "Wipe All Data" button in Settings immediately purges all keys from `localStorage`, with zero residual caching or recovery possibility.
