"""
app/services/output_service.py
Transforms simulation results into a strategic Founder Report.
"""

from typing import Any

class OutputService:
    def generate_founder_report(self, simulation_result: dict) -> dict:
        current = simulation_result["current"]
        runway = current["runway_months"] or 0
        is_profitable = current["is_profitable"]

        # 4. Strategic Score Calculation
        runway_weight = min(runway / 18, 1.0) * 60
        survival_weight = current["survival_probability"] * 40
        score = round(runway_weight + survival_weight)

        # 5. Risk Heatmap
        risk_map = {
            "burnEfficiency": "HIGH" if runway < 6 else "LOW",
            "growthVelocity": "STABLE" if current["survival_probability"] > 0.6 else "LOW",
            "survivalConfidence": f"{round(current['survival_probability'] * 100)}%"
        }

        # 6. Action Plan (Mapped for UI)
        prioritized_actions = []
        for task in actions:
            level = "CRITICAL" if runway <= 3 else "URGENT" if runway <= 6 else "STRATEGIC"
            prioritized_actions.append({"level": level, "task": task})

        return {
            "headline": headline,
            "runway_status": runway_status,
            "critical_warning": warning,
            "key_insights": insights,
            "founder_message": message,
            "runway_score": score,
            "risk_heatmap": risk_map,
            "prioritized_action_plan": prioritized_actions,
            "strategic_insight": f"Nexus Risk Engine estimates a {round(current['survival_probability'] * 100)}% transition success rate.",
            "raw_metrics": {
                "burn_rate": current["burn_rate"],
                "runway_months": runway,
                "is_profitable": is_profitable
            }
        }

# Singleton
output_service = OutputService()
