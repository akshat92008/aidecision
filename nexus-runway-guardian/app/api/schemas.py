"""
app/api/schemas.py
Pydantic V2 models for input validation and consistent API documentation.
"""

from typing import List, Optional
from pydantic import BaseModel, Field

class PlannedChangeSchema(BaseModel):
    label: str = Field("Unnamed Scenario")
    hire_count: int = Field(0, ge=0)
    salary_per_hire: float = Field(0.0, ge=0)
    marketing_spend_change: float = Field(0.0)
    revenue_growth_change: float = Field(0.0)
    delay_in_launch_days: int = Field(0, ge=0)
    one_time_cost: float = Field(0.0, ge=0)
    one_time_revenue_boost: float = Field(0.0, ge=0)

class SimulationRequest(BaseModel):
    current_cash: float = Field(..., gt=0)
    monthly_revenue: float = Field(..., ge=0)
    monthly_fixed_costs: float = Field(..., ge=0)
    monthly_variable_costs: float = Field(..., ge=0)
    team_size: int = Field(..., ge=0)
    avg_salary_per_employee: float = Field(..., ge=0)
    growth_rate: float = Field(...)
    planned_changes: List[PlannedChangeSchema] = Field(default_factory=list)

class AuditReportResponse(BaseModel):
    runway_score: int
    prioritized_action_plan: List[dict]
    risk_heatmap: dict
    strategic_insight: str
    raw_metrics: dict
