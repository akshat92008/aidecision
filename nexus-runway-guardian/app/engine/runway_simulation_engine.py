"""
app/engine/runway_simulation_engine.py
Core mathematical logic for runway and burn-rate simulation.
"""

from __future__ import annotations
import math
from dataclasses import dataclass, field
from datetime import date, timedelta
from typing import Any

INDIA_STARTUP_MORTALITY_CURVE = {
    0: 0.00, 1: 0.05, 2: 0.12, 3: 0.22, 4: 0.35, 5: 0.48, 6: 0.58,
    7: 0.67, 8: 0.74, 9: 0.80, 10: 0.85, 11: 0.88, 12: 0.91, 18: 0.95, 24: 0.97
}

RISK_THRESHOLDS = {"HIGH": 3, "MEDIUM": 6}

@dataclass
class PlannedChange:
    label: str = "Unnamed Scenario"
    hire_count: int = 0
    salary_per_hire: float = 0.0
    marketing_spend_change: float = 0.0
    revenue_growth_change: float = 0.0
    delay_in_launch_days: int = 0
    one_time_cost: float = 0.0
    one_time_revenue_boost: float = 0.0

@dataclass
class StartupFinancials:
    current_cash: float
    monthly_revenue: float
    monthly_fixed_costs: float
    monthly_variable_costs: float
    team_size: int
    avg_salary_per_employee: float
    growth_rate: float
    planned_changes: list[PlannedChange] = field(default_factory=list)

def _total_monthly_costs(fixed, variable, team, avg_salary, extraHires=0, extraSalary=0.0, marketingDelta=0.0) -> float:
    salary_total = (team * avg_salary) + (extraHires * extraSalary)
    return fixed + variable + salary_total + marketingDelta

def _burn_rate(total_costs, revenue) -> float:
    return total_costs - revenue

def _runway_months(cash, burn) -> float:
    if burn <= 0: return math.inf
    if cash <= 0: return 0.0
    return cash / burn

def _survival_probability(runway, growth_rate) -> float:
    if runway == math.inf: return 0.99
    sorted_keys = sorted(INDIA_STARTUP_MORTALITY_CURVE.keys())
    base_prob = 0.0
    for i, k in enumerate(sorted_keys):
        if runway <= k:
            if i == 0: base_prob = INDIA_STARTUP_MORTALITY_CURVE[k]
            else:
                prev_k = sorted_keys[i - 1]
                frac = (runway - prev_k) / (k - prev_k)
                base_prob = INDIA_STARTUP_MORTALITY_CURVE[prev_k] + frac * (INDIA_STARTUP_MORTALITY_CURVE[k] - INDIA_STARTUP_MORTALITY_CURVE[prev_k])
            break
    else: base_prob = 0.97
    growth_bonus = min(growth_rate * 0.015, 0.15)
    growth_penalty = max(growth_rate * 0.02, -0.20) if growth_rate < 0 else 0.0
    return round(min(max(base_prob + growth_bonus + growth_penalty, 0.01), 0.99), 3)

def _cash_out_date(runway_months: float) -> str:
    if runway_months == math.inf: return "Never (cash-flow positive)"
    days = int(runway_months * 30.44)
    out_date = date.today() + timedelta(days=days)
    return out_date.strftime("%d %b %Y")

def simulate_full(fin: StartupFinancials) -> dict:
    total = _total_monthly_costs(fin.monthly_fixed_costs, fin.monthly_variable_costs, fin.team_size, fin.avg_salary_per_employee)
    burn = _burn_rate(total, fin.monthly_revenue)
    runway = _runway_months(fin.current_cash, burn)
    
    current = {
        "burn_rate": round(burn, 2),
        "runway_months": round(runway, 2) if runway != math.inf else None,
        "survival_probability": _survival_probability(runway, fin.growth_rate),
        "cash_out_date": _cash_out_date(runway),
        "is_profitable": burn <= 0
    }

    scenarios = []
    for c in fin.planned_changes:
        new_total = _total_monthly_costs(fin.monthly_fixed_costs, fin.monthly_variable_costs, fin.team_size, fin.avg_salary_per_employee, c.hire_count, c.salary_per_hire, c.marketing_spend_change)
        new_burn = _burn_rate(new_total, fin.monthly_revenue)
        new_runway = _runway_months(fin.current_cash - c.one_time_cost + c.one_time_revenue_boost, new_burn)
        scenarios.append({
            "label": c.label,
            "new_burn": round(new_burn, 2),
            "new_runway": round(new_runway, 2) if new_runway != math.inf else None,
            "survival_probability": _survival_probability(new_runway, fin.growth_rate + c.revenue_growth_change),
            "cash_out_date": _cash_out_date(new_runway)
        })

    return {"current": current, "scenarios": scenarios}
