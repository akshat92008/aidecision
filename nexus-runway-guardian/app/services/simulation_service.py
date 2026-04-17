"""
app/services/simulation_service.py
Wraps the engine logic into a service layer.
"""

from app.engine.runway_simulation_engine import StartupFinancials, PlannedChange, simulate_full

class SimulationService:
    def perform_full_simulation(self, payload: dict) -> dict:
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
        return simulate_full(fin)

# Singleton
simulation_service = SimulationService()
