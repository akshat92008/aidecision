"""
tests/test_runway_engine.py
============================
Pytest test suite for the Runway Simulation Engine.
Run: pytest tests/ -v
"""

import math
import pytest
from runway_simulation_engine import (
    StartupFinancials,
    PlannedChange,
    run_simulation,
    run_simulation_from_dict,
    _burn_rate,
    _runway_months,
    _survival_probability,
    _risk_level,
    _cash_out_date,
    _total_monthly_costs,
)
from datetime import date


# ─────────────────────────────────────────────
# Fixtures
# ─────────────────────────────────────────────

@pytest.fixture
def typical_startup() -> StartupFinancials:
    """Typical early-stage Indian SaaS startup."""
    return StartupFinancials(
        current_cash=5_000_000,
        monthly_revenue=800_000,
        monthly_fixed_costs=300_000,
        monthly_variable_costs=150_000,
        team_size=8,
        avg_salary_per_employee=120_000,
        growth_rate=4.5,
    )


@pytest.fixture
def profitable_startup() -> StartupFinancials:
    return StartupFinancials(
        current_cash=10_000_000,
        monthly_revenue=3_000_000,
        monthly_fixed_costs=200_000,
        monthly_variable_costs=100_000,
        team_size=5,
        avg_salary_per_employee=150_000,
        growth_rate=8.0,
    )


@pytest.fixture
def zero_revenue_startup() -> StartupFinancials:
    return StartupFinancials(
        current_cash=2_000_000,
        monthly_revenue=0,
        monthly_fixed_costs=100_000,
        monthly_variable_costs=50_000,
        team_size=3,
        avg_salary_per_employee=80_000,
        growth_rate=0.0,
    )


# ─────────────────────────────────────────────
# Unit tests — financial primitives
# ─────────────────────────────────────────────

class TestBurnRate:
    def test_positive_burn(self):
        assert _burn_rate(1_000_000, 700_000) == 300_000

    def test_zero_burn(self):
        assert _burn_rate(1_000_000, 1_000_000) == 0

    def test_profitable(self):
        assert _burn_rate(700_000, 1_000_000) == -300_000


class TestRunwayMonths:
    def test_normal_runway(self):
        result = _runway_months(6_000_000, 1_000_000)
        assert result == pytest.approx(6.0)

    def test_infinite_runway_zero_burn(self):
        assert _runway_months(5_000_000, 0) == math.inf

    def test_infinite_runway_profitable(self):
        assert _runway_months(5_000_000, -500_000) == math.inf

    def test_zero_cash(self):
        assert _runway_months(0, 500_000) == 0.0

    def test_fractional_runway(self):
        result = _runway_months(500_000, 300_000)
        assert result == pytest.approx(500_000 / 300_000, rel=1e-4)


class TestSurvivalProbability:
    def test_profitable_high_survival(self):
        assert _survival_probability(math.inf, 5.0) == 0.99

    def test_zero_runway_zero_survival(self):
        prob = _survival_probability(0, 5.0)
        assert prob <= 0.10

    def test_high_growth_boosts_survival(self):
        low = _survival_probability(6.0, 0.0)
        high = _survival_probability(6.0, 10.0)
        assert high > low

    def test_probability_bounds(self):
        for runway in [0, 1, 3, 6, 12, 24, 36]:
            for growth in [-5, 0, 5, 15]:
                prob = _survival_probability(float(runway), float(growth))
                assert 0.0 <= prob <= 1.0


class TestRiskLevel:
    def test_high_risk(self):
        assert _risk_level(2.0) == "HIGH"
        assert _risk_level(3.0) == "HIGH"

    def test_medium_risk(self):
        assert _risk_level(4.0) == "MEDIUM"
        assert _risk_level(6.0) == "MEDIUM"

    def test_low_risk(self):
        assert _risk_level(7.0) == "LOW"
        assert _risk_level(math.inf) == "LOW"


class TestCashOutDate:
    def test_infinite_runway_message(self):
        result = _cash_out_date(math.inf)
        assert "Never" in result

    def test_six_month_runway(self):
        ref = date(2025, 1, 1)
        result = _cash_out_date(6.0, reference_date=ref)
        # ~6 months from Jan 2025 → around July 2025
        assert "2025" in result

    def test_zero_runway(self):
        ref = date(2025, 1, 1)
        result = _cash_out_date(0.0, reference_date=ref)
        assert "01 Jan 2025" == result


class TestTotalMonthlyCosts:
    def test_basic_costs(self):
        result = _total_monthly_costs(
            fixed=200_000, variable=100_000,
            team=5, avg_salary=100_000,
        )
        assert result == 200_000 + 100_000 + 500_000

    def test_with_hires(self):
        result = _total_monthly_costs(
            fixed=200_000, variable=100_000,
            team=5, avg_salary=100_000,
            extra_headcount=2, extra_salary=150_000,
        )
        assert result == 200_000 + 100_000 + 500_000 + 300_000

    def test_with_marketing_delta(self):
        result = _total_monthly_costs(
            fixed=200_000, variable=100_000,
            team=5, avg_salary=100_000,
            marketing_delta=50_000,
        )
        assert result == 200_000 + 100_000 + 500_000 + 50_000


# ─────────────────────────────────────────────
# Integration tests — full simulation
# ─────────────────────────────────────────────

class TestRunSimulation:
    def test_result_structure(self, typical_startup):
        result = run_simulation(typical_startup)
        assert "current_metrics" in result
        assert "scenario_analysis" in result
        assert "decision_insights" in result
        assert "founder_message" in result

    def test_current_metrics_keys(self, typical_startup):
        metrics = run_simulation(typical_startup)["current_metrics"]
        required = {
            "burn_rate", "total_monthly_costs", "runway_months",
            "survival_probability", "cash_out_date", "is_profitable",
            "monthly_cash_flow_projection",
        }
        assert required.issubset(set(metrics.keys()))

    def test_profitable_startup_infinite_runway(self, profitable_startup):
        result = run_simulation(profitable_startup)
        metrics = result["current_metrics"]
        assert metrics["is_profitable"] is True
        assert metrics["runway_months"] is None          # None == ∞ in output
        assert "Profitable" in metrics["runway_label"]

    def test_zero_revenue_startup(self, zero_revenue_startup):
        result = run_simulation(zero_revenue_startup)
        metrics = result["current_metrics"]
        assert metrics["burn_rate"] > 0
        assert metrics["runway_months"] is not None
        assert metrics["runway_months"] < 10            # should have limited runway

    def test_scenario_analysis_count(self, typical_startup):
        changes = [
            PlannedChange(label="Hire 3", hire_count=3, salary_per_hire=100_000),
            PlannedChange(label="Delay launch", delay_in_launch_days=30),
        ]
        typical_startup.planned_changes = changes
        result = run_simulation(typical_startup)
        assert len(result["scenario_analysis"]) == 2

    def test_scenario_keys(self, typical_startup):
        typical_startup.planned_changes = [
            PlannedChange(label="Test", hire_count=1, salary_per_hire=150_000)
        ]
        scenario = run_simulation(typical_startup)["scenario_analysis"][0]
        required = {
            "label", "new_burn_rate", "new_runway", "runway_change",
            "risk_level", "cash_out_date", "survival_probability",
        }
        assert required.issubset(set(scenario.keys()))

    def test_hire_increases_burn(self, typical_startup):
        baseline = run_simulation(typical_startup)["current_metrics"]["burn_rate"]
        typical_startup.planned_changes = [
            PlannedChange(label="Hire 5", hire_count=5, salary_per_hire=200_000)
        ]
        result = run_simulation(typical_startup)
        new_burn = result["scenario_analysis"][0]["new_burn_rate"]
        assert new_burn > baseline

    def test_marketing_delta_reflected(self, typical_startup):
        typical_startup.planned_changes = [
            PlannedChange(label="Extra marketing", marketing_spend_change=500_000)
        ]
        result = run_simulation(typical_startup)
        s = result["scenario_analysis"][0]
        baseline_costs = run_simulation(StartupFinancials(
            current_cash=typical_startup.current_cash,
            monthly_revenue=typical_startup.monthly_revenue,
            monthly_fixed_costs=typical_startup.monthly_fixed_costs,
            monthly_variable_costs=typical_startup.monthly_variable_costs,
            team_size=typical_startup.team_size,
            avg_salary_per_employee=typical_startup.avg_salary_per_employee,
            growth_rate=typical_startup.growth_rate,
        ))["current_metrics"]["total_monthly_costs"]
        assert s["new_total_monthly_costs"] == pytest.approx(baseline_costs + 500_000)

    def test_decision_insights_structure(self, typical_startup):
        result = run_simulation(typical_startup)
        insights = result["decision_insights"]
        assert "top_3_risks" in insights
        assert "top_3_recommendations" in insights
        assert isinstance(insights["top_3_risks"], list)
        assert isinstance(insights["top_3_recommendations"], list)
        assert len(insights["top_3_risks"]) <= 3
        assert len(insights["top_3_recommendations"]) <= 3

    def test_founder_message_is_string(self, typical_startup):
        result = run_simulation(typical_startup)
        assert isinstance(result["founder_message"], str)
        assert len(result["founder_message"]) > 50

    def test_founder_message_contains_rupee_symbol(self, typical_startup):
        result = run_simulation(typical_startup)
        assert "₹" in result["founder_message"]


class TestRunSimulationFromDict:
    def test_dict_input(self):
        payload = {
            "current_cash": 3_000_000,
            "monthly_revenue": 500_000,
            "monthly_fixed_costs": 200_000,
            "monthly_variable_costs": 80_000,
            "team_size": 5,
            "avg_salary_per_employee": 100_000,
            "growth_rate": 3.0,
            "planned_changes": [
                {
                    "label": "Launch paid ads",
                    "hire_count": 0,
                    "salary_per_hire": 0,
                    "marketing_spend_change": 100_000,
                    "revenue_growth_change": 1.5,
                    "delay_in_launch_days": 0,
                    "one_time_cost": 0,
                    "one_time_revenue_boost": 0,
                }
            ],
        }
        result = run_simulation_from_dict(payload)
        assert "current_metrics" in result
        assert len(result["scenario_analysis"]) == 1

    def test_no_planned_changes(self):
        payload = {
            "current_cash": 1_000_000,
            "monthly_revenue": 200_000,
            "monthly_fixed_costs": 100_000,
            "monthly_variable_costs": 50_000,
            "team_size": 2,
            "avg_salary_per_employee": 90_000,
            "growth_rate": 5.0,
            "planned_changes": [],
        }
        result = run_simulation_from_dict(payload)
        assert result["scenario_analysis"] == []


# ─────────────────────────────────────────────
# Edge case tests
# ─────────────────────────────────────────────

class TestEdgeCases:
    def test_single_rupee_cash(self):
        fin = StartupFinancials(
            current_cash=1,
            monthly_revenue=0,
            monthly_fixed_costs=100_000,
            monthly_variable_costs=0,
            team_size=1,
            avg_salary_per_employee=50_000,
            growth_rate=0.0,
        )
        result = run_simulation(fin)
        assert result["current_metrics"]["runway_months"] == pytest.approx(0.0, abs=1e-5)

    def test_very_high_growth_rate(self):
        fin = StartupFinancials(
            current_cash=10_000_000,
            monthly_revenue=500_000,
            monthly_fixed_costs=100_000,
            monthly_variable_costs=50_000,
            team_size=3,
            avg_salary_per_employee=80_000,
            growth_rate=50.0,
        )
        result = run_simulation(fin)
        assert result["current_metrics"]["survival_probability"] > 0.5

    def test_all_zeros_planned_change(self, typical_startup):
        typical_startup.planned_changes = [PlannedChange(label="Do nothing")]
        result = run_simulation(typical_startup)
        s = result["scenario_analysis"][0]
        # No change → burn should equal baseline
        baseline_burn = result["current_metrics"]["burn_rate"]
        assert s["new_burn_rate"] == pytest.approx(baseline_burn)

    def test_cash_projection_terminates_at_zero(self):
        fin = StartupFinancials(
            current_cash=300_000,
            monthly_revenue=0,
            monthly_fixed_costs=100_000,
            monthly_variable_costs=0,
            team_size=1,
            avg_salary_per_employee=50_000,
            growth_rate=0.0,
        )
        result = run_simulation(fin)
        projection = result["current_metrics"]["monthly_cash_flow_projection"]
        # Should stop before 18 months since cash runs out
        assert len(projection) < 18
        assert projection[-1]["cash_balance"] <= 0


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
