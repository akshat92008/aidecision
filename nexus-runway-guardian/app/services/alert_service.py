"""
app/services/alert_service.py
Generates short, lightweight risk alerts.
"""

class AlertService:
    def generate_alert(self, simulation_result: dict) -> dict:
        current = simulation_result["current"]
        runway = current["runway_months"]
        cash_date = current["cash_out_date"]
        is_profitable = current["is_profitable"]

        if is_profitable:
            return {
                "message": "✅ You are cash-flow positive. Runway is infinite.",
                "risk_level": "LOW"
            }

        risk_level = "LOW"
        emoji = "ℹ️"
        
        if runway < 3:
            risk_level = "CRITICAL"
            emoji = "🚨"
        elif runway < 6:
            risk_level = "WARNING"
            emoji = "⚠️"

        message = f"{emoji} You have {runway} months of runway left. At current burn, you will run out of cash by {cash_date}."
        
        return {
            "message": message,
            "risk_level": risk_level
        }

# Singleton
alert_service = AlertService()
