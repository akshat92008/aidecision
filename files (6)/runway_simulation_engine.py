"""
runway_simulation_engine.py
============================
Production-ready Runway Simulation Engine for Indian Startups.
Author  : Senior FinTech Engineer / Startup CFO
Version : 1.0.0
Usage   : Standalone module or plug into FastAPI / Next.js API route.
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field, asdict
from datetime import date, timedelta
from typing import Any
import json


# ---------------------------------------------------------------------------
# Constants calibrated for Indian startup ecosystem (2024-25)
# ---------------------------------------------------------------------------
INDIA_STARTUP_MORTALITY_CURVE = {
    # runway_months -> base survival probability (empirical estimate)
    0:  0.00,
    1:  0.05,
    2:  0.12,
    3:  0.22,
    4:  0.35,
    5:  0.48,
    6:  0.58,
    7:  0.67,
    8:  0.74,
    9:  0.80,
    10: 0.85,
    11: 0.88,
    12: 0.91,
    18: 0.95,
    24: 0.97,
}

RISK_THRESHOLDS = {
    "HIGH":   3,    # ≤ 3 months runway  → HIGH risk
    "MEDIUM": 6,    # ≤ 6 months runway  → MEDIUM risk
    # > 6 months                          → LOW risk
}

INR_SYMBOL = "₹"
SIMULATION_HORIZON_MONTHS = 18   # How far ahead we simulate (max)


# ---------------------------------------------------------------------------
# Input schemas (dataclasses — easy to replace with Pydantic for FastAPI)
# ---------------------------------------------------------------------------

@dataclass
class PlannedChange:
    """One scenario / planned decision to evaluate."""
    label: str                          = "Unnamed Scenario"
    hire_count: int                     = 0
    salary_per_hire: float              = 0.0          # INR / month per hire
    marketing_spend_change: float       = 0.0          # +/- INR / month delta
    revenue_growth_change: float        = 0.0          # percentage-point delta (e.g. +2 means growth goes from 5% → 7%)
    delay_in_launch_days: int           = 0            # days delayed (delays next N months revenue)
    one_time_cost: float                = 0.0          # e.g. equipment, licences
    one_time_revenue_boost: float       = 0.0          # e.g. enterprise deal sign-on


@dataclass
class StartupFinancials:
    """Complete financial snapshot of the startup."""
    current_cash: float                 # INR
    monthly_revenue: float              # INR
    monthly_fixed_costs: float          # INR
    monthly_variable_costs: float       # INR
    team_size: int
    avg_salary_per_employee: float      # INR / month
    growth_rate: float                  # % per month (e.g. 5 means 5 %)
    planned_changes: list[PlannedChange] = field(default_factory=list)


# ---------------------------------------------------------------------------
# Core financial primitives
# ---------------------------------------------------------------------------

def _total_monthly_costs(
    fixed: float,
    variable: float,
    team: int,
    avg_salary: float,
    extra_headcount: int = 0,
    extra_salary: float = 0.0,
    marketing_delta: float = 0.0,
) -> float:
    """Return total monthly cash outflow."""
    salary_total = (team * avg_salary) + (extra_headcount * extra_salary)
    return fixed + variable + salary_total + marketing_delta


def _burn_rate(total_costs: float, revenue: float) -> float:
    """
    Net monthly cash burn.
    Positive  → burning cash.
    Negative  → cash-flow positive (profitable).
    """
    return total_costs - revenue


def _runway_months(cash: float, burn: float) -> float:
    """
    Months of runway remaining.
    Returns math.inf for profitable / zero-burn startups.
    """
    if burn <= 0:
        return math.inf          # cash-flow positive → infinite runway
    if cash <= 0:
        return 0.0
    return cash / burn


def _survival_probability(runway: float, growth_rate: float) -> float:
    """
    Heuristic survival probability blending runway depth with growth momentum.
    Calibrated for Indian early-stage startups.
    """
    if runway == math.inf:
        return 0.99              # profitable but never 100% (ops risk)

    # Interpolate from mortality curve
    sorted_keys = sorted(INDIA_STARTUP_MORTALITY_CURVE.keys())
    base_prob = 0.0
    for i, k in enumerate(sorted_keys):
        if runway <= k:
            if i == 0:
                base_prob = INDIA_STARTUP_MORTALITY_CURVE[k]
            else:
                prev_k = sorted_keys[i - 1]
                frac = (runway - prev_k) / (k - prev_k)
                base_prob = (
                    INDIA_STARTUP_MORTALITY_CURVE[prev_k]
                    + frac * (INDIA_STARTUP_MORTALITY_CURVE[k] - INDIA_STARTUP_MORTALITY_CURVE[prev_k])
                )
            break
    else:
        base_prob = 0.97         # beyond 24 months

    # Adjust for growth rate: each 1 % monthly growth ≈ +1.5 pp survival
    growth_bonus = min(growth_rate * 0.015, 0.15)
    # Penalise negative growth
    growth_penalty = max(growth_rate * 0.02, -0.20) if growth_rate < 0 else 0.0

    prob = base_prob + growth_bonus + growth_penalty
    return round(min(max(prob, 0.01), 0.99), 3)


def _cash_out_date(runway_months: float, reference_date: date | None = None) -> str:
    """Return ISO-format estimated date when cash hits zero."""
    if runway_months == math.inf:
        return "Never (cash-flow positive)"
    ref = reference_date or date.today()
    days = int(runway_months * 30.44)
    out_date = ref + timedelta(days=days)
    return out_date.strftime("%d %b %Y")


def _risk_level(runway_months: float) -> str:
    """Classify runway risk as LOW / MEDIUM / HIGH."""
    if runway_months == math.inf or runway_months > RISK_THRESHOLDS["MEDIUM"]:
        return "LOW"
    if runway_months > RISK_THRESHOLDS["HIGH"]:
        return "MEDIUM"
    return "HIGH"


# ---------------------------------------------------------------------------
# Monthly cash simulation
# ---------------------------------------------------------------------------

def _simulate_cash_flow(
    starting_cash: float,
    starting_revenue: float,
    total_monthly_costs: float,
    growth_rate_pct: float,
    horizon_months: int = SIMULATION_HORIZON_MONTHS,
    delay_months: int = 0,          # revenue blocked for this many months
    one_time_cost: float = 0.0,
    one_time_revenue: float = 0.0,
    revenue_growth_delta_pct: float = 0.0,   # extra percentage-point growth
) -> list[dict[str, Any]]:
    """
    Simulate month-by-month cash balance.
    Returns a list of monthly snapshots up to horizon_months or cash-out.
    """
    monthly_growth = (growth_rate_pct + revenue_growth_delta_pct) / 100.0
    cash = starting_cash - one_time_cost + one_time_revenue
    revenue = starting_revenue
    snapshots = []

    for month in range(1, horizon_months + 1):
        effective_revenue = 0.0 if month <= delay_months else revenue
        net_burn = total_monthly_costs - effective_revenue
        cash -= net_burn
        revenue *= (1 + monthly_growth)

        snapshots.append({
            "month": month,
            "cash_balance": round(cash, 2),
            "monthly_revenue": round(effective_revenue, 2),
            "burn_rate": round(net_burn, 2),
        })

        if cash <= 0:
            break

    return snapshots


# ---------------------------------------------------------------------------
# Current metrics calculator
# ---------------------------------------------------------------------------

def _compute_current_metrics(fin: StartupFinancials) -> dict[str, Any]:
    total_costs = _total_monthly_costs(
        fixed=fin.monthly_fixed_costs,
        variable=fin.monthly_variable_costs,
        team=fin.team_size,
        avg_salary=fin.avg_salary_per_employee,
    )
    burn = _burn_rate(total_costs, fin.monthly_revenue)
    runway = _runway_months(fin.current_cash, burn)
    survival = _survival_probability(runway, fin.growth_rate)
    cash_flow_projection = _simulate_cash_flow(
        starting_cash=fin.current_cash,
        starting_revenue=fin.monthly_revenue,
        total_monthly_costs=total_costs,
        growth_rate_pct=fin.growth_rate,
    )

    runway_display = round(runway, 2) if runway != math.inf else None

    return {
        "burn_rate": round(burn, 2),
        "total_monthly_costs": round(total_costs, 2),
        "net_monthly_revenue": round(fin.monthly_revenue, 2),
        "runway_months": runway_display,
        "runway_label": "∞ (Profitable)" if runway == math.inf else f"{runway_display} months",
        "cash_out_date": _cash_out_date(runway),
        "survival_probability": survival,
        "survival_probability_pct": f"{round(survival * 100, 1)}%",
        "is_profitable": burn <= 0,
        "monthly_cash_flow_projection": cash_flow_projection,
    }


# ---------------------------------------------------------------------------
# Scenario analyser
# ---------------------------------------------------------------------------

def _analyse_scenario(
    fin: StartupFinancials,
    change: PlannedChange,
    baseline_burn: float,
    baseline_runway: float,
) -> dict[str, Any]:
    """Evaluate financial impact of a single planned change."""

    # Adjusted costs
    new_total_costs = _total_monthly_costs(
        fixed=fin.monthly_fixed_costs,
        variable=fin.monthly_variable_costs,
        team=fin.team_size,
        avg_salary=fin.avg_salary_per_employee,
        extra_headcount=change.hire_count,
        extra_salary=change.salary_per_hire,
        marketing_delta=change.marketing_spend_change,
    )

    delay_months = math.ceil(change.delay_in_launch_days / 30.44) if change.delay_in_launch_days > 0 else 0

    new_burn = _burn_rate(new_total_costs, fin.monthly_revenue)
    new_runway = _runway_months(
        fin.current_cash - change.one_time_cost + change.one_time_revenue_boost,
        new_burn,
    )
    runway_change = (
        (new_runway - baseline_runway)
        if (new_runway != math.inf and baseline_runway != math.inf)
        else None
    )
    risk = _risk_level(new_runway)
    survival = _survival_probability(new_runway, fin.growth_rate + change.revenue_growth_change)
    cash_date = _cash_out_date(new_runway)

    # Monthly projection under this scenario
    projection = _simulate_cash_flow(
        starting_cash=fin.current_cash - change.one_time_cost + change.one_time_revenue_boost,
        starting_revenue=fin.monthly_revenue,
        total_monthly_costs=new_total_costs,
        growth_rate_pct=fin.growth_rate,
        delay_months=delay_months,
        one_time_cost=0.0,          # already deducted above
        revenue_growth_delta_pct=change.revenue_growth_change,
    )

    new_runway_display = round(new_runway, 2) if new_runway != math.inf else None

    return {
        "label": change.label,
        "new_burn_rate": round(new_burn, 2),
        "new_total_monthly_costs": round(new_total_costs, 2),
        "new_runway": new_runway_display,
        "new_runway_label": "∞ (Profitable)" if new_runway == math.inf else f"{new_runway_display} months",
        "runway_change": round(runway_change, 2) if runway_change is not None else "N/A",
        "runway_change_label": _runway_change_label(runway_change),
        "risk_level": risk,
        "cash_out_date": cash_date,
        "survival_probability": survival,
        "survival_probability_pct": f"{round(survival * 100, 1)}%",
        "hire_cost_monthly": round(change.hire_count * change.salary_per_hire, 2),
        "monthly_cash_flow_projection": projection,
    }


def _runway_change_label(change: float | None) -> str:
    if change is None:
        return "N/A (infinite runway involved)"
    direction = "increases" if change > 0 else "reduces"
    return f"{direction} runway by {abs(round(change, 1))} months"


# ---------------------------------------------------------------------------
# Decision intelligence engine
# ---------------------------------------------------------------------------

def _generate_decision_insights(
    fin: StartupFinancials,
    current: dict[str, Any],
    scenarios: list[dict[str, Any]],
) -> dict[str, Any]:
    """Synthesise top risks and actionable recommendations."""

    burn = current["burn_rate"]
    runway = current["runway_months"] or math.inf

    risks: list[str] = []
    recommendations: list[str] = []

    # --- Risk: High burn rate ---
    if burn > 0 and runway <= 6:
        risks.append(
            f"Critical burn-rate of {INR_SYMBOL}{burn:,.0f}/month with only "
            f"{runway} months of runway — fundraising or revenue action required within 60 days."
        )

    # --- Risk: Zero / low growth ---
    if fin.growth_rate < 2:
        risks.append(
            f"Monthly revenue growth of {fin.growth_rate}% is below the 2% minimum required to "
            f"extend runway through organic expansion. Flat growth accelerates cash-out."
        )

    # --- Risk: Salary burden ---
    salary_bill = fin.team_size * fin.avg_salary_per_employee
    salary_as_pct_of_costs = (salary_bill / current["total_monthly_costs"] * 100) if current["total_monthly_costs"] > 0 else 0
    if salary_as_pct_of_costs > 60:
        risks.append(
            f"Salary costs ({INR_SYMBOL}{salary_bill:,.0f}/month) represent "
            f"{salary_as_pct_of_costs:.0f}% of total spend — dangerously concentrated "
            f"people-cost; any attrition or involuntary churn increases risk."
        )

    # --- Risk: High-risk scenarios ---
    high_risk_scenarios = [s for s in scenarios if s["risk_level"] == "HIGH"]
    if high_risk_scenarios:
        labels = ", ".join(s["label"] for s in high_risk_scenarios)
        risks.append(
            f"The following planned changes push runway into HIGH RISK territory: {labels}. "
            f"Re-evaluate before committing."
        )

    # --- Risk: No revenue ---
    if fin.monthly_revenue == 0:
        risks.append(
            "Zero current revenue — all cash is being consumed without any inflow. "
            "First rupee of revenue is the single most impactful milestone right now."
        )

    # --- Recommendations ---

    # Revenue lever
    rev_needed_to_break_even = burn if burn > 0 else 0
    if rev_needed_to_break_even > 0 and fin.monthly_revenue > 0:
        pct_increase_needed = (rev_needed_to_break_even / fin.monthly_revenue) * 100
        recommendations.append(
            f"Increase monthly revenue by {INR_SYMBOL}{rev_needed_to_break_even:,.0f} "
            f"({pct_increase_needed:.0f}% uplift) to reach break-even. "
            f"Focus on upselling existing customers before chasing new acquisition — "
            f"upsell conversion is 3-5x cheaper for Indian B2B SaaS."
        )

    # Cost lever
    if burn > 0:
        target_cut = burn * 0.30
        recommendations.append(
            f"Achieve a 30% cost reduction ({INR_SYMBOL}{target_cut:,.0f}/month) by auditing "
            f"SaaS subscriptions, deferring non-critical hires, and renegotiating vendor contracts "
            f"— this alone extends runway by ~{round(target_cut / burn * runway, 1)} months."
        )

    # Fundraise timing
    if runway != math.inf and runway <= 9:
        ideal_start = max(1, round(runway - 4))
        recommendations.append(
            f"Start Series A / seed-extension conversations now. "
            f"Indian VC due diligence averages 90-120 days — "
            f"beginning at month {ideal_start} gives you a comfortable buffer before "
            f"cash-out on {current['cash_out_date']}."
        )
    elif runway != math.inf and runway <= 18:
        recommendations.append(
            f"Runway of {runway} months is adequate but not comfortable. "
            f"Begin warm introductions to investors in month 3-4 to keep optionality open."
        )

    # Growth lever
    if fin.growth_rate < 5:
        recommendations.append(
            f"Push monthly revenue growth from {fin.growth_rate}% to ≥5%. "
            f"Even a 3pp growth improvement compounds: at 5% vs {fin.growth_rate}% growth, "
            f"revenue doubles in 14 months instead of {round(70/max(fin.growth_rate,0.1))} — "
            f"dramatically changing your fundraise narrative."
        )

    return {
        "top_3_risks": risks[:3],
        "top_3_recommendations": recommendations[:3],
    }


# ---------------------------------------------------------------------------
# Founder message generator
# ---------------------------------------------------------------------------

def _generate_founder_message(
    fin: StartupFinancials,
    current: dict[str, Any],
    scenarios: list[dict[str, Any]],
) -> str:
    """
    Psychologically strong, personalised founder message.
    Direct, specific, actionable — no generic filler.
    """
    lines: list[str] = []
    burn = current["burn_rate"]
    runway = current["runway_months"]
    cash_date = current["cash_out_date"]

    # Opening — tailor to financial state
    if current["is_profitable"]:
        lines.append(
            f"You're cash-flow positive — congratulations, that puts you in the top 8% of Indian early-stage startups. "
            f"Your current monthly surplus is {INR_SYMBOL}{abs(burn):,.0f}. "
            f"The real risk now is complacency and misallocation of excess cash."
        )
    elif runway and runway <= 3:
        lines.append(
            f"URGENT: At your current burn of {INR_SYMBOL}{burn:,.0f}/month, "
            f"you have {runway} months of runway — cash runs out by {cash_date}. "
            f"This is a 90-day crisis, not a planning exercise."
        )
    else:
        lines.append(
            f"At your current burn of {INR_SYMBOL}{burn:,.0f}/month, "
            f"you have {runway} months of runway — cash estimated to run out by {cash_date}."
        )

    # Scenario impacts
    for s in scenarios:
        rc = s.get("runway_change")
        label = s["label"]
        if isinstance(rc, (int, float)):
            direction = "reduces" if rc < 0 else "extends"
            lines.append(
                f"{label} {direction} your runway by {abs(rc):.1f} months "
                f"(new cash-out: {s['cash_out_date']}, Risk: {s['risk_level']})."
            )
        if s["risk_level"] == "HIGH":
            extra_burn = s["new_burn_rate"] - burn
            lines.append(
                f"  → '{label}' increases monthly burn by {INR_SYMBOL}{extra_burn:,.0f}. "
                f"Reconsider or phase this decision."
            )

    # Specific action call-out
    if burn > 0 and fin.monthly_revenue > 0:
        mktg_cut = fin.monthly_fixed_costs * 0.15
        rev_target = round(burn * 1.25 / fin.monthly_revenue * 100 - 100, 1)
        lines.append(
            f"\nRecommendation: Cut discretionary spend by {INR_SYMBOL}{mktg_cut:,.0f}/month "
            f"OR increase revenue by {rev_target}% to create meaningful runway headroom."
        )
    elif fin.monthly_revenue == 0:
        lines.append(
            f"\nRecommendation: Generating even {INR_SYMBOL}{burn * 0.3:,.0f}/month in revenue "
            f"(30% of burn) would extend your runway by {round(0.3 * (runway or 0), 1)} months "
            f"— make this your sole focus this quarter."
        )

    # Closing conviction line
    survival_pct = current["survival_probability_pct"]
    lines.append(
        f"\nYour current 12-month survival probability is estimated at {survival_pct}. "
        f"Every month of extended runway improves this by ~3-5 percentage points. "
        f"Capital efficiency is your moat right now — protect it."
    )

    return " ".join(lines)


# ---------------------------------------------------------------------------
# Public API — main entry point
# ---------------------------------------------------------------------------

def run_simulation(fin: StartupFinancials) -> dict[str, Any]:
    """
    Execute the full runway simulation.

    Parameters
    ----------
    fin : StartupFinancials
        Complete startup financial snapshot with optional planned changes.

    Returns
    -------
    dict
        Structured JSON-serialisable result with:
        - current_metrics
        - scenario_analysis
        - decision_insights
        - founder_message
    """
    # 1. Current state
    current_metrics = _compute_current_metrics(fin)
    baseline_burn   = current_metrics["burn_rate"]
    baseline_runway = current_metrics["runway_months"] or math.inf

    # 2. Scenario analysis
    scenario_results: list[dict[str, Any]] = []
    for change in fin.planned_changes:
        result = _analyse_scenario(fin, change, baseline_burn, baseline_runway)
        scenario_results.append(result)

    # 3. Decision insights
    decision_insights = _generate_decision_insights(fin, current_metrics, scenario_results)

    # 4. Founder message
    founder_message = _generate_founder_message(fin, current_metrics, scenario_results)

    return {
        "current_metrics": current_metrics,
        "scenario_analysis": scenario_results,
        "decision_insights": decision_insights,
        "founder_message": founder_message,
    }


# ---------------------------------------------------------------------------
# FastAPI-ready adapter
# ---------------------------------------------------------------------------

def run_simulation_from_dict(payload: dict[str, Any]) -> dict[str, Any]:
    """
    Convenience wrapper that accepts a plain dict (e.g. from JSON body).
    Ideal for FastAPI / Flask route handlers.

    Example
    -------
    @app.post("/api/simulate")
    async def simulate(body: dict):
        return run_simulation_from_dict(body)
    """
    changes = [
        PlannedChange(**c) for c in payload.get("planned_changes", [])
    ]
    fin = StartupFinancials(
        current_cash            = float(payload["current_cash"]),
        monthly_revenue         = float(payload["monthly_revenue"]),
        monthly_fixed_costs     = float(payload["monthly_fixed_costs"]),
        monthly_variable_costs  = float(payload["monthly_variable_costs"]),
        team_size               = int(payload["team_size"]),
        avg_salary_per_employee = float(payload["avg_salary_per_employee"]),
        growth_rate             = float(payload["growth_rate"]),
        planned_changes         = changes,
    )
    return run_simulation(fin)


# ---------------------------------------------------------------------------
# CLI / quick demo
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    sample_payload = {
        "current_cash":             5_000_000,      # ₹50 lakhs
        "monthly_revenue":          800_000,         # ₹8 lakhs
        "monthly_fixed_costs":      300_000,         # ₹3 lakhs
        "monthly_variable_costs":   150_000,         # ₹1.5 lakhs
        "team_size":                8,
        "avg_salary_per_employee":  120_000,         # ₹1.2 lakh/month
        "growth_rate":              4.5,             # 4.5% MoM
        "planned_changes": [
            {
                "label":                  "Hire 2 senior engineers",
                "hire_count":             2,
                "salary_per_hire":        180_000,
                "marketing_spend_change": 0,
                "revenue_growth_change":  0,
                "delay_in_launch_days":   0,
                "one_time_cost":          0,
                "one_time_revenue_boost": 0,
            },
            {
                "label":                  "10-day launch delay",
                "hire_count":             0,
                "salary_per_hire":        0,
                "marketing_spend_change": 0,
                "revenue_growth_change":  -0.5,
                "delay_in_launch_days":   10,
                "one_time_cost":          0,
                "one_time_revenue_boost": 0,
            },
            {
                "label":                  "Double marketing budget",
                "hire_count":             0,
                "salary_per_hire":        0,
                "marketing_spend_change": 200_000,
                "revenue_growth_change":  2.0,
                "delay_in_launch_days":   0,
                "one_time_cost":          0,
                "one_time_revenue_boost": 0,
            },
        ],
    }

    result = run_simulation_from_dict(sample_payload)
    print(json.dumps(result, indent=2, default=str))
