# WellSync: Sustaining Healthy Behaviors

> **Competition Prototype**: Future Health Digital Innovation Challenge 2026 (Abu Dhabi)  
> **Track**: Challenge 09 — Sustaining Healthy Behaviors  
> **Team Status**: Two undergraduate students (No clinical partner, zero human user testing)  
> **Submission Deadline**: Friday 20 November 2026  

---

## 1. What is WellSync?

Most digital health applications rely on **punitive gamification** (e.g., streaks that reset to zero upon a single missed day). When an unexpected life event, illness, or fatigue causes a missed day, the broken streak induces the psychological "what-the-hell" effect (Cochran & Tesser, 1996), driving users from temporary lapse into complete disengagement.

**WellSync** replaces punitive streak-tracking with a **scientific, rule-based adaptive ladder**:
- **Continuous Baseline Tracking**: Tracks rolling 28-day behavioral medians for **daily steps** and **sleep duration** (cold start < 14 valid days falls back to the user's declared goal).
- **Lapse Detection without Contamination**: Detects lapses (3 consecutive below-par days < 60% of baseline), while explicitly excluding lapse days from baseline calculations to prevent downward expectation spirals.
- **Adaptive Step-Down (BCT 8.7 *Graded tasks*)**: During a lapse, the target steps down to a manageable **Minimum rung (50% of baseline)** instead of resetting progress to zero.
- **Resilience-Based Step-Up**: Meeting the Minimum target counts as a success day; achieving 3 consecutive successes completes recovery, steps the user back up to Target, and increments the user's **Return Count**.
- **Transparent Theory-Driven Grounding**: Every intervention maps to the Michie et al. (2013) Behavior Change Technique Taxonomy v1 (BCTTv1), surfacing exact rationale and known behavioral limits.

---

## 2. Hard Non-Negotiable Rules & Compliance

| Rule | Specification | Verification & Implementation |
| :--- | :--- | :--- |
| **1. Zero Runtime AI / LLMs** | No chatbot, no LLM calls, no API keys, no black-box machine learning. | 100% deterministic, inspectable pure functions in `src/engine/`. |
| **2. Zero External Network Requests** | No external APIs, no cloud backends, no CDNs, no analytics or trackers. | Production build has 0 fetch/XHR calls. System fonts only (`dist/` audited). |
| **3. Client-Side Data Sovereignty** | Guest mode for all features; no accounts or login. Local browser storage only. | `localStorage` with `try/catch` fallbacks, full JSON export, and genuine permanent wipe. |
| **4. Zero Fabricated Evidence** | No placeholder numbers, no assumed distributions, no simulated metrics on evidence page. | Evidence numbers are generated exclusively from real LifeSnaps data files via `analysis/replay.py`. |
| **5. Non-Clinical Stance** | No medical diagnoses, no clinical condition inferences, no therapeutic claims. | Barrier hypotheses restricted to 4 mechanical rules with full user veto/rejection rights. |
| **6. Non-Punitive Architecture** | No streak that resets to zero. No employer or insurer surveillance views. | Progress tracks **Active Days** and **Return Count**. Social/workplace features excluded. |
| **7. Dual-Language & RTL** | English and Arabic with right-to-left layout and unreviewed translation notice. | Full bidirectional layout with persistent translation disclaimer until native review. |
| **8. Accessibility Focus** | Keyboard focus indicators, sufficient contrast, screen-reader labels, reduced motion. | `:focus-visible` rings, `prefers-reduced-motion` media queries, font size scaling (A / A+ / A++). |

---

## 3. Project Structure

```
WellSync/
├── analysis/                      # Python Replay Analysis Environment
│   ├── data/                      # LifeSnaps dataset directory (.gitkeep tracked)
│   ├── replay.py                  # Deterministic simulation of Policy A vs Policy B
│   ├── replay_analysis.ipynb      # Step-by-step reproducible research notebook
│   └── requirements.txt           # Python analysis dependencies (pandas, numpy, scipy)
├── docs/                          # Comprehensive Technical & Regulatory Documentation
│   ├── ASSUMPTIONS.md             # Engine specifications, mathematical thresholds, and baseline rules
│   ├── LIMITATIONS.md             # Student status, non-Abu Dhabi cohort, excluded features risk analysis
│   ├── DATA.md                    # Verified column names, units, Zenodo CC BY 4.0 confirmation
│   ├── SAFETY.md                  # Non-clinical guardrails, user veto rights, psychological safety
│   └── LICENSES.md                # Full open-source library inventory and license texts
├── src/
│   ├── engine/                    # Pure Deterministic Behavioral Engine
│   │   ├── baseline.ts            # 28-day rolling median & contamination prevention
│   │   ├── ladder.ts              # 3-rung adaptive targets (Minimum, Target, Stretch)
│   │   ├── barriers.ts            # Non-medical barrier hypothesis detection & user veto
│   │   ├── recommendations.ts     # Michie BCTTv1 technique cards with rationale and limits
│   │   ├── state.ts               # Core state machine (On-Track, Slipping, Lapsed, Recovering)
│   │   ├── types.ts               # Complete TypeScript interfaces
│   │   └── config.ts              # Central parameter dictionary
│   ├── screens/                   # Client Application Views
│   │   ├── TodayScreen.tsx        # Daily check-in, ladder HUD, streak-free metrics, BCT cards
│   │   ├── RecoveryScreen.tsx     # Step-down view, rejectable hypotheses, micro-commitments
│   │   ├── HistoryScreen.tsx      # Chronological log table with state filtering
│   │   ├── EvidenceScreen.tsx     # LifeSnaps replay benchmarks, demographics, sensitivity grid
│   │   ├── SettingsScreen.tsx     # Goals, quiet hours, synthetic demo loader, export, wipe
│   │   └── AboutScreen.tsx        # Attribution, student declaration, Michie taxonomy, risk audit
│   ├── storage/                   # Resilient In-Browser Storage & Data Sovereignty
│   ├── i18n/                      # English & Arabic Localization Dictionary
│   ├── data/                      # Synthetic demo personas & generated evidence payload
│   ├── App.tsx                    # Top-level state integration & RTL styling
│   └── main.tsx                   # React 19 entrypoint
├── package.json                   # Web dependencies & scripts
├── tsconfig.json                  # Strict TypeScript configuration
└── vite.config.ts                 # Zero-network build configuration with Vitest setup
```

---

## 4. Getting Started & Local Development

### 4.1 Prerequisites
- **Node.js**: v18+ (tested on Node.js v22.12.0)
- **npm**: v9+ (tested on npm 10.9.0)
- **Python**: 3.10+ (for running the replay analysis)

### 4.2 Web Application Setup
```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Open browser at http://localhost:5173
```

### 4.3 Running Unit Tests & Coverage
```bash
# Run tests
npm test

# Run tests with V8 coverage report
npm run test:coverage
```

**Actual Test Coverage Reported**:
- **Test Suites**: 3 passed (3 total: engine, storage, i18n)
- **Total Tests**: 30 passed (30 total)
- **Engine Statements**: **97.35%**
- **Engine Branches**: **93.83%**
- **Engine Functions**: **100.00%**
- **Engine Lines**: **97.35%**
- **Localization Statements**: **100.00%**
- **Localization Functions**: **100.00%**

### 4.4 Building for Production
```bash
npm run build
```
The output is written to `dist/` as a static client-side bundle ready for instant deployment to any static web host.

---

## 5. Running the LifeSnaps Replay Analysis

The replay analysis processes the real LifeSnaps wearable dataset through the deterministic WellSync engine to generate reproducible benchmarks.

1. Ensure the raw dataset is placed in `analysis/data/`:
   - `daily_fitbit_sema_df_unprocessed.csv`
2. Install Python dependencies:
   ```bash
   pip install -r analysis/requirements.txt
   ```
3. Run the replay script:
   ```bash
   python analysis/replay.py
   ```
4. The script executes the 71-participant simulation and outputs:
   - Descriptive lapse frequency and recovery distributions.
   - Comparative Policy A (fixed 5k, 7.5k, 10k goals with streak reset) vs Policy B (WellSync Personal Ladder).
   - Demographic disaggregation with privacy masking ($n < 5$).
   - 36-cell multi-parameter sensitivity analysis grid.
   - Generates `src/data/evidence_data.json` with full provenance for display in the app's Evidence tab.

---

## 6. Deployment to Static Hosting

Because WellSync has zero server dependencies, it can be deployed to any static host:

- **GitHub Pages**: Build with `npm run build` and deploy the `dist/` directory via the `gh-pages` branch or GitHub Actions.
- **Cloudflare Pages / Vercel / Netlify**: Connect the repository with build command `npm run build` and output directory `dist`.
- **Offline / Local File**: Open `dist/index.html` in any modern web browser.

---

## 7. Verification of Zero Network Activity

To independently verify that WellSync makes zero outgoing network calls:
1. Open the deployed application or `npm run preview` in Google Chrome or Firefox.
2. Open Developer Tools (`F12`) and select the **Network** tab.
3. Check the **Disable cache** checkbox and reload the page.
4. Interact with the application: log steps, switch tabs, load synthetic demo personas, export JSON data, wipe data, and change language.
5. Filter by `Fetch/XHR`: Observe **0 network requests**. All operations execute 100% locally.

---

## 8. Documentation Index

- [docs/ASSUMPTIONS.md](docs/ASSUMPTIONS.md): Complete engine specification, mathematical definitions, and configuration rationale.
- [docs/LIMITATIONS.md](docs/LIMITATIONS.md): Student status, non-clinical scope, non-Abu Dhabi cohort notes, and excluded feature risk analysis.
- [docs/DATA.md](docs/DATA.md): LifeSnaps dataset verification, column dictionary, units, and CC BY 4.0 citation confirmation on the record.
- [docs/SAFETY.md](docs/SAFETY.md): Non-diagnostic boundaries, barrier hypothesis constraints, user veto rights, and privacy protections.
- [docs/LICENSES.md](docs/LICENSES.md): Full open-source dependency list and licensing statements.
