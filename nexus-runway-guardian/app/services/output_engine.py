"""
app/services/output_engine.py
Transforms raw simulation JSON into a high-impact strategic report for founders.
"""

from typing import Any

class OutputEngine:
    def generate_audit_report(self, simulation_result: dict) -> dict:
        current = simulation_result["current"]
        runway = current["runway_months"] or 0
        
        # 1. Strategic Signals (Prioritized Actions)
        actions = []
        if runway <= 3:
            actions.append({"level": "CRITICAL", "task": "Freeze all non-essential hiring and marketing spend immediately."})
            actions.append({"level": "STRATEGIC", "task": "Initiate bridge round or seed-extension conversations today."})
        elif runway <= 6:
            actions.append({"level": "URGENT", "task": "Audit vendor SaaS subscriptions for 20% cost reduction."})
            actions.append({"level": "STRATEGIC", "task": "Optimize sales cycle to accelerate MRR by 1.5x."})
        else:
            actions.append({"level": "HEALTHY", "task": "Maintain growth momentum while monitoring burn efficiency."})
            actions.append({"level": "STRATEGIC", "task": "Plan next milestone fundraise for 6 months from now."})

        # 2. Risk Heatmap
        risk_map = {
            "Burn Efficiency": "HIGH" if runway < 6 else "LOW",
            "Growth Velocity": "LOW" if current["survival_probability"] < 0.6 else "STABLE",
            "Survival Confidence": f"{current['survival_probability'] * 100}%"
        }

        # 3. High Impact Insight
        insight = f"Nexus Risk Engine estimates a {current['survival_probability']*100}% transition success rate over the next 12 months."

        return {
            "runway_score": self._calculate_score(runway, current["survival_probability"]),
            "prioritized_action_plan": actions,
            "risk_heatmap": risk_map,
            "strategic_insight": insight,
            "raw_metrics": {
                "burn": current["burn_rate"],
                "runway": runway,
                "is_profitable": current["is_profitable"]
            }
        }

    def _calculate_score(self, runway: float, survival: float) -> int:
        # Score from 0 to 100
        runway_weight = min(runway / 18, 1.0) * 60  # max 60 pts
        survival_weight = survival * 40             # max 40 pts
        return int(runway_weight + survival_weight)
