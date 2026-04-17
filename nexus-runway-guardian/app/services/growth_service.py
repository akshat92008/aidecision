"""
app/services/growth_service.py
MODULE 3: GROWTH EXPERIMENT ENGINE
Suggests high-ROI experiments based on current metrics.
"""
class GrowthService:
    def suggest_experiments(self, payload: dict) -> dict:
        metrics = payload.get("metrics", {})
        cac = metrics.get("cac", 0)
        ltv = metrics.get("ltv", 0)
        burn = metrics.get("monthly_burn", 0)
        
        experiments = []

        if cac > 0 and (ltv / cac) < 3:
            experiments.append({
                "id": "exp_price_1",
                "name": "15% Price Increase Test",
                "hypothesis": "Higher pricing will filter low-intent users, instantly improving LTV/CAC ratio without increasing marketing spend.",
                "expected_roi": "+12% MRR",
                "effort": "LOW"
            })
            experiments.append({
                "id": "exp_retention_1",
                "name": "WhatsApp Cart-Recovery",
                "hypothesis": "In the Indian market, WhatsApp reminders convert 3x better than email. Should recover lost checkout revenue.",
                "expected_roi": "+8% MRR",
                "effort": "MEDIUM"
            })
        else:
            experiments.append({
                "id": "exp_scale_1",
                "name": "Scale Meta Ads Budget by 20%",
                "hypothesis": "Unit economics are healthy. Scaling top-of-funnel should yield proportional revenue growth.",
                "expected_roi": f"+{int(burn * 0.1)} MRR",
                "effort": "LOW"
            })

        experiments.append({
            "id": "exp_referral",
            "name": "B2B Founder Referral Program",
            "hypothesis": "Incentivize existing successful users with platform credits to refer peers. Drops CAC significantly.",
            "expected_roi": "-15% Blended CAC",
            "effort": "HIGH"
        })

        return {
            "status": "active",
            "primary_constraint": "Unit Economics" if (cac > 0 and (ltv/cac) < 3) else "Top of Funnel",
            "experiments": experiments[:3]
        }

growth_service = GrowthService()
