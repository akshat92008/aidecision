"""
api.py
======
FastAPI wrapper around the Runway Simulation Engine.
Run: uvicorn api:app --reload
Docs: http://localhost:8000/docs
"""

from __future__ import annotations

from typing import Any, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator
import uvicorn

from runway_simulation_engine import run_simulation_from_dict

# ---------------------------------------------------------------------------
# Pydantic request / response schemas
# ---------------------------------------------------------------------------

class PlannedChangeSchema(BaseModel):
    label: str                          = Field("Unnamed Scenario", description="Human-readable scenario name")
    hire_count: int                     = Field(0, ge=0, description="Number of new hires")
    salary_per_hire: float              = Field(0.0, ge=0, description="Monthly salary per new hire (INR)")
    marketing_spend_change: float       = Field(0.0, description="Monthly marketing spend delta (INR, can be negative)")
    revenue_growth_change: float        = Field(0.0, description="Additional revenue growth percentage-points per month")
    delay_in_launch_days: int           = Field(0, ge=0, description="Product/feature launch delay in days")
    one_time_cost: float                = Field(0.0, ge=0, description="One-off capital expenditure (INR)")
    one_time_revenue_boost: float       = Field(0.0, ge=0, description="One-off revenue event (INR, e.g. enterprise sign-on)")

    model_config = {"json_schema_extra": {
        "example": {
            "label": "Hire 2 senior engineers",
            "hire_count": 2,
            "salary_per_hire": 180000,
            "marketing_spend_change": 0,
            "revenue_growth_change": 0.5,
            "delay_in_launch_days": 0,
            "one_time_cost": 0,
            "one_time_revenue_boost": 0
        }
    }}


class SimulationRequest(BaseModel):
    current_cash: float             = Field(..., gt=0,  description="Current cash balance (INR)")
    monthly_revenue: float          = Field(..., ge=0,  description="Monthly revenue (INR)")
    monthly_fixed_costs: float      = Field(..., ge=0,  description="Monthly fixed costs excl. salaries (INR)")
    monthly_variable_costs: float   = Field(..., ge=0,  description="Monthly variable costs (INR)")
    team_size: int                  = Field(..., ge=0,  description="Current headcount")
    avg_salary_per_employee: float  = Field(..., ge=0,  description="Average fully-loaded salary per employee (INR/month)")
    growth_rate: float              = Field(...,         description="Current monthly revenue growth rate (%)")
    planned_changes: list[PlannedChangeSchema] = Field(
        default_factory=list,
        description="List of scenarios / decisions to evaluate",
        max_length=10,
    )

    @field_validator("growth_rate")
    @classmethod
    def growth_rate_range(cls, v: float) -> float:
        if v < -100 or v > 200:
            raise ValueError("growth_rate must be between -100 and 200 (%)")
        return v

    model_config = {"json_schema_extra": {
        "example": {
            "current_cash": 5000000,
            "monthly_revenue": 800000,
            "monthly_fixed_costs": 300000,
            "monthly_variable_costs": 150000,
            "team_size": 8,
            "avg_salary_per_employee": 120000,
            "growth_rate": 4.5,
            "planned_changes": [
                {
                    "label": "Hire 2 senior engineers",
                    "hire_count": 2,
                    "salary_per_hire": 180000,
                    "marketing_spend_change": 0,
                    "revenue_growth_change": 0.5,
                    "delay_in_launch_days": 0,
                    "one_time_cost": 0,
                    "one_time_revenue_boost": 0
                }
            ]
        }
    }}


# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------

app = FastAPI(
    title="Runway Simulation Engine",
    description=(
        "Production-ready startup runway and burn-rate simulation API. "
        "Analyse financial impact of hiring, marketing, launch delays, and more — "
        "calibrated for Indian startup ecosystem."
    ),
    version="1.0.0",
    contact={"name": "FinTech Engineering", "email": "eng@yourstartup.com"},
    license_info={"name": "Proprietary"},
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/health", tags=["infra"])
def health_check() -> dict[str, str]:
    """Liveness probe."""
    return {"status": "ok", "service": "runway-simulation-engine"}


@app.post(
    "/api/simulate",
    tags=["simulation"],
    summary="Run full runway simulation",
    response_description="Structured simulation result with metrics, scenarios, insights, and founder message",
)
def simulate(body: SimulationRequest) -> dict[str, Any]:
    """
    ## Runway Simulation Engine

    Submit startup financials and a list of planned changes.
    Receive a structured analysis including:

    - **current_metrics** — burn rate, runway, survival probability
    - **scenario_analysis** — per-decision impact on burn & runway
    - **decision_insights** — top 3 risks + actionable recommendations
    - **founder_message** — psychologically calibrated action summary
    """
    try:
        result = run_simulation_from_dict(body.model_dump())
        return result
    except Exception as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@app.post(
    "/api/simulate/quick",
    tags=["simulation"],
    summary="Quick burn & runway check (no scenarios)",
)
def quick_simulate(body: SimulationRequest) -> dict[str, Any]:
    """Lightweight endpoint — returns only current_metrics (faster response)."""
    try:
        payload = body.model_dump()
        payload["planned_changes"] = []
        result = run_simulation_from_dict(payload)
        return {
            "current_metrics": result["current_metrics"],
            "founder_message": result["founder_message"],
        }
    except Exception as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


# ---------------------------------------------------------------------------
# Dev server
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
