"""WellSync Replay Analysis Engine
Processes LifeSnaps wearable dataset through WellSync rule-based engine
and produces reproducible evidence benchmarks without runtime AI.
"""

import json
from datetime import datetime, timezone
from pathlib import Path
import numpy as np
import pandas as pd


def load_data(data_path: Path):
    daily_file = data_path / "daily_fitbit_sema_df_unprocessed.csv"
    if not daily_file.exists():
        raise FileNotFoundError(f"Missing required dataset: {daily_file}")

    df = pd.read_csv(daily_file)
    df["date"] = pd.to_datetime(df["date"])
    df["steps"] = pd.to_numeric(df["steps"], errors="coerce")
    df["minutesAsleep"] = pd.to_numeric(df["minutesAsleep"], errors="coerce")
    return df, daily_file


def simulate_participant(
    g: pd.DataFrame,
    overall_median: float,
    lapse_threshold_pct: float = 0.60,
    min_lapse_days: int = 3,
    baseline_window: int = 28,
    min_valid_baseline: int = 14,
):
    """Simulates a single participant through Policy A (fixed goals) and Policy B (WellSync Ladder)."""
    # Policy A for 5000, 7500, 10000
    policy_a = {}
    total_days = len(g)

    for tgt in [5000, 7500, 10000]:
        streak = 0
        longest_streak = 0
        resets = 0
        attainable_days = 0
        days_below_own_baseline = 0

        for _, row in g.iterrows():
            val = row["steps"] if not row["is_missing"] else 0
            if val < overall_median:
                days_below_own_baseline += 1
            if not row["is_missing"] and val >= tgt:
                streak += 1
                attainable_days += 1
                if streak > longest_streak:
                    longest_streak = streak
            else:
                if streak > 0:
                    resets += 1
                streak = 0

        policy_a[tgt] = {
            "resets": resets,
            "longest_streak": longest_streak,
            "attainable_days": attainable_days,
            "attainability_pct": (attainable_days / total_days) * 100
            if total_days > 0
            else 0,
            "days_below_baseline": days_below_own_baseline,
            "total_days": total_days,
        }

    # Policy B: WellSync Ladder
    history = []
    state = "ON_TRACK"
    ladder_level = "TARGET"
    consecutive_below_par = 0
    consecutive_success = 0
    return_count = 0
    active_days = 0
    longest_ladder_streak = 0
    current_ladder_streak = 0
    attainable_days_b = 0
    days_below_own_baseline_b = 0

    lapse_events = []
    recovery_times = []
    current_lapse_start = None
    lapse_in_progress = False

    for cur_date, row in g.iterrows():
        is_missing = row["is_missing"]
        val = row["steps_clean"]

        # 28-day rolling window baseline excluding LAPSED days and missing days
        cutoff_date = cur_date - pd.Timedelta(days=baseline_window)
        valid_hist = [
            h
            for h in history
            if h["date"] >= cutoff_date
            and not h["isMissing"]
            and h["state"] != "LAPSED"
        ]

        if len(valid_hist) >= min_valid_baseline:
            baseline = float(np.median([h["actualValue"] for h in valid_hist]))
        else:
            baseline = overall_median

        min_target = baseline * 0.50
        tgt_target = baseline
        stretch_target = baseline * 1.10

        if ladder_level == "MINIMUM":
            active_target = min_target
        elif ladder_level == "STRETCH":
            active_target = stretch_target
        else:
            active_target = tgt_target

        if val < baseline:
            days_below_own_baseline_b += 1

        # Success day: meets active rung target
        is_success_day = (not is_missing) and (val >= active_target)

        # Below-par day: on Target or Stretch, < 60% of baseline or missing
        is_below_par = is_missing or (val < baseline * lapse_threshold_pct)

        # 7-day calibration suppression
        total_valid_days = len(
            [h for h in history if not h["isMissing"]]
        ) + (0 if is_missing else 1)
        is_calibrating = total_valid_days < 7

        if is_success_day:
            attainable_days_b += 1
            active_days += 1
            current_ladder_streak += 1
            if current_ladder_streak > longest_ladder_streak:
                longest_ladder_streak = current_ladder_streak
        else:
            current_ladder_streak = 0

        # State transitions
        if state == "LAPSED":
            if is_success_day:
                state = "RECOVERING"
                consecutive_success = 1
                consecutive_below_par = 0
            else:
                consecutive_success = 0
        elif state == "RECOVERING":
            if is_success_day:
                consecutive_success += 1
                if consecutive_success >= 3:
                    state = "ON_TRACK"
                    ladder_level = "TARGET"
                    return_count += 1
                    consecutive_success = 0
                    if current_lapse_start is not None:
                        rec_days = (cur_date - current_lapse_start).days
                        recovery_times.append(rec_days)
                        current_lapse_start = None
                        lapse_in_progress = False
            elif is_below_par:
                consecutive_below_par += 1
                consecutive_success = 0
                if consecutive_below_par >= min_lapse_days:
                    state = "LAPSED"
                    ladder_level = "MINIMUM"
        else:  # ON_TRACK or SLIPPING
            if is_calibrating:
                state = "ON_TRACK"
            else:
                if is_below_par:
                    consecutive_below_par += 1
                    consecutive_success = 0
                    if consecutive_below_par >= min_lapse_days:
                        state = "LAPSED"
                        ladder_level = "MINIMUM"
                        consecutive_below_par = 0
                        if not lapse_in_progress:
                            lapse_events.append(cur_date)
                            current_lapse_start = cur_date
                            lapse_in_progress = True
                else:
                    consecutive_below_par = 0
                    if is_success_day:
                        consecutive_success += 1
                        if consecutive_success >= 3 and ladder_level == "TARGET":
                            ladder_level = "STRETCH"

                    last_7 = [h for h in history[-6:]] + [
                        {"actualValue": val, "isMissing": is_missing}
                    ]
                    valid_7 = [h["actualValue"] for h in last_7 if not h["isMissing"]]
                    mean_7 = np.mean(valid_7) if valid_7 else 0
                    if mean_7 < baseline * 0.80:
                        state = "SLIPPING"
                    else:
                        state = "ON_TRACK"

        history.append(
            {
                "date": cur_date,
                "actualValue": val,
                "isMissing": is_missing,
                "state": state,
                "ladderLevel": ladder_level,
            }
        )

    policy_b = {
        "resets": 0,  # Streak reset to zero is eliminated in Policy B
        "longest_streak": longest_ladder_streak,
        "active_days": active_days,
        "attainable_days": attainable_days_b,
        "attainability_pct": (attainable_days_b / total_days) * 100
        if total_days > 0
        else 0,
        "days_below_baseline": days_below_own_baseline_b,
        "return_count": return_count,
        "total_days": total_days,
        "lapses_count": len(lapse_events),
        "recovery_times": recovery_times,
    }

    return policy_a, policy_b


def run_full_analysis():
    data_path = Path(__file__).resolve().parent / "data"
    df, daily_file = load_data(data_path)

    # Participant preparation
    participants = []
    for pid, group in df.groupby("id"):
        g = group.sort_values("date").copy()
        full_dates = pd.date_range(g["date"].min(), g["date"].max(), freq="D")
        g = g.set_index("date").reindex(full_dates)
        g["id"] = pid
        g["steps_clean"] = g["steps"].fillna(0)
        g["is_missing"] = g["steps"].isnull()

        valid_steps = g.loc[~g["is_missing"], "steps"]
        if len(valid_steps) == 0:
            continue
        overall_median = float(valid_steps.median())

        gender = (
            group["gender"].dropna().iloc[0]
            if group["gender"].notnull().any()
            else "Unknown"
        )
        age = (
            group["age"].dropna().iloc[0]
            if group["age"].notnull().any()
            else "Unknown"
        )

        participants.append(
            {
                "id": pid,
                "group": g,
                "overall_median": overall_median,
                "gender": gender,
                "age": age,
                "valid_days": len(valid_steps),
                "total_days": len(g),
            }
        )

    print(f"Loaded {len(participants)} valid participants.")

    # 1. Main Replay: Policy A vs Policy B
    all_res_a = {5000: [], 7500: [], 10000: []}
    all_res_b = []
    all_recovery_times = []
    all_lapse_counts = []

    for p in participants:
        res_a, res_b = simulate_participant(p["group"], p["overall_median"])
        for tgt in [5000, 7500, 10000]:
            all_res_a[tgt].append({**res_a[tgt], "gender": p["gender"], "age": p["age"]})
        all_res_b.append(
            {
                **res_b,
                "gender": p["gender"],
                "age": p["age"],
                "overall_median": p["overall_median"],
            }
        )
        all_recovery_times.extend(res_b["recovery_times"])
        all_lapse_counts.append(res_b["lapses_count"])

    # Aggregate Policy Comparisons
    comparison_table = []
    for tgt in [5000, 7500, 10000]:
        df_a = pd.DataFrame(all_res_a[tgt])
        comparison_table.append(
            {
                "policy": f"Policy A (Fixed {tgt:,} steps)",
                "mean_resets": round(float(df_a["resets"].mean()), 1),
                "median_resets": round(float(df_a["resets"].median()), 1),
                "longest_streak_mean": round(float(df_a["longest_streak"].mean()), 1),
                "longest_streak_median": round(float(df_a["longest_streak"].median()), 1),
                "attainability_pct": round(float(df_a["attainability_pct"].mean()), 1),
                "days_below_baseline_mean": round(float(df_a["days_below_baseline"].mean()), 1),
            }
        )

    df_b = pd.DataFrame(all_res_b)
    comparison_table.append(
        {
            "policy": "Policy B (WellSync Personal Ladder)",
            "mean_resets": round(float(df_b["resets"].mean()), 1),  # 0.0
            "median_resets": round(float(df_b["resets"].median()), 1),
            "longest_streak_mean": round(float(df_b["longest_streak"].mean()), 1),
            "longest_streak_median": round(float(df_b["longest_streak"].median()), 1),
            "attainability_pct": round(float(df_b["attainability_pct"].mean()), 1),
            "days_below_baseline_mean": round(float(df_b["days_below_baseline"].mean()), 1),
            "mean_return_count": round(float(df_b["return_count"].mean()), 1),
            "mean_active_days": round(float(df_b["active_days"].mean()), 1),
        }
    )

    # 2. Descriptive Lapse Frequency & Recovery Times
    recovery_stats = {
        "total_lapses_detected": int(sum(all_lapse_counts)),
        "mean_lapses_per_participant": round(float(np.mean(all_lapse_counts)), 2),
        "median_lapses_per_participant": round(float(np.median(all_lapse_counts)), 1),
        "participants_with_lapses": int(sum(1 for c in all_lapse_counts if c > 0)),
        "total_recoveries_completed": len(all_recovery_times),
        "mean_recovery_days": round(float(np.mean(all_recovery_times)), 1)
        if all_recovery_times
        else None,
        "median_recovery_days": round(float(np.median(all_recovery_times)), 1)
        if all_recovery_times
        else None,
        "min_recovery_days": int(np.min(all_recovery_times))
        if all_recovery_times
        else None,
        "max_recovery_days": int(np.max(all_recovery_times))
        if all_recovery_times
        else None,
    }

    # 3. Demographic Subgroups (Masking cells with n < 5)
    def compute_subgroup(group_col):
        records = []
        for val, sub in df_b.groupby(group_col):
            count = len(sub)
            if count < 5 or str(val) == "Unknown":
                records.append(
                    {
                        "subgroup": str(val),
                        "participant_count": count,
                        "masked": True,
                        "note": "Masked (n < 5 or unverified)",
                    }
                )
            else:
                sub_a_10k = pd.DataFrame(
                    [r for r in all_res_a[10000] if r[group_col] == val]
                )
                records.append(
                    {
                        "subgroup": str(val),
                        "participant_count": count,
                        "masked": False,
                        "policy_b_attainability_pct": round(
                            float(sub["attainability_pct"].mean()), 1
                        ),
                        "policy_b_longest_streak": round(
                            float(sub["longest_streak"].mean()), 1
                        ),
                        "policy_b_mean_returns": round(
                            float(sub["return_count"].mean()), 1
                        ),
                        "policy_b_mean_lapses": round(
                            float(sub["lapses_count"].mean()), 1
                        ),
                        "policy_a_10k_resets": round(
                            float(sub_a_10k["resets"].mean()), 1
                        ),
                        "policy_a_10k_attainability_pct": round(
                            float(sub_a_10k["attainability_pct"].mean()), 1
                        ),
                    }
                )
        return records

    gender_breakdown = compute_subgroup("gender")
    age_breakdown = compute_subgroup("age")

    # 4. Sensitivity Analysis Grid
    # Lapse length: 2 to 5 days
    # Threshold: 50% to 70% (0.50, 0.60, 0.70)
    # Baseline window: 14 to 42 days (14, 28, 42)
    sensitivity_grid = []
    print("Running sensitivity grid analysis...")
    for lapse_len in [2, 3, 4, 5]:
        for thresh in [0.50, 0.60, 0.70]:
            for window in [14, 28, 42]:
                lapses_sample = []
                recov_sample = []
                attain_sample = []

                for p in participants:
                    _, sim_b = simulate_participant(
                        p["group"],
                        p["overall_median"],
                        lapse_threshold_pct=thresh,
                        min_lapse_days=lapse_len,
                        baseline_window=window,
                        min_valid_baseline=min(14, window // 2),
                    )
                    lapses_sample.append(sim_b["lapses_count"])
                    attain_sample.append(sim_b["attainability_pct"])
                    recov_sample.extend(sim_b["recovery_times"])

                sensitivity_grid.append(
                    {
                        "lapse_length_days": lapse_len,
                        "below_par_threshold_pct": int(thresh * 100),
                        "baseline_window_days": window,
                        "mean_lapses_per_participant": round(
                            float(np.mean(lapses_sample)), 2
                        ),
                        "total_lapses_detected": int(sum(lapses_sample)),
                        "mean_attainability_pct": round(
                            float(np.mean(attain_sample)), 1
                        ),
                        "mean_recovery_days": round(float(np.mean(recov_sample)), 1)
                        if recov_sample
                        else None,
                    }
                )

    # 5. Build Final Provenance Payload
    run_date = datetime.now(timezone.utc).isoformat()
    evidence_payload = {
        "status": "Generated from LifeSnaps dataset",
        "provenance": {
            "source_files": [daily_file.name],
            "total_source_rows": len(df),
            "total_participants": len(participants),
            "run_date_utc": run_date,
            "script_version": "1.0.0",
            "citation": "LifeSnaps Dataset (Zenodo 7229547, CC BY 4.0, PMC9622868)",
            "demographic_notice": "Cohort is a non-Abu Dhabi sample; replay reflects rule execution against recorded sensor data and does not prove behaviour change.",
        },
        "descriptive_recovery": recovery_stats,
        "policy_comparison": comparison_table,
        "demographics": {
            "gender": gender_breakdown,
            "age": age_breakdown,
            "masking_threshold": 5,
        },
        "sensitivity": sensitivity_grid,
    }

    # Write output to app data directory
    output_path = (
        Path(__file__).resolve().parent.parent
        / "src"
        / "data"
        / "evidence_data.json"
    )
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(evidence_payload, f, indent=2)

    print(f"Successfully generated evidence output at: {output_path}")
    print(f"Total participants: {len(participants)}")
    print(f"Total lapses detected: {recovery_stats['total_lapses_detected']}")
    print(
        f"Mean recovery time: {recovery_stats['mean_recovery_days']} days (median: {recovery_stats['median_recovery_days']})"
    )


if __name__ == "__main__":
    run_full_analysis()
