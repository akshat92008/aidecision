"""
app/api/routes.py
Unified FastAPI routes for Nexus OS (All 5 Modules).
"""
from fastapi import APIRouter, HTTPException
from app.services.simulation_service import simulation_service
from app.services.output_service import output_service
from app.services.alert_service import alert_service
from app.services.execution_service import execution_service
from app.services.growth_service import growth_service
from app.services.unicorn_service import unicorn_service
from app.services.audit_service import audit_service
import logging

router = APIRouter()
logger = logging.getLogger("nexus-guardian")

# MODULE 1: RUNWAY GUARDIAN
@router.post("/simulate")
async def simulate(payload: dict):
    try:
        return simulation_service.perform_full_simulation(payload)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/audit-report")
async def audit_report(payload: dict):
    try:
        raw_result = simulation_service.perform_full_simulation(payload)
        report = output_service.generate_founder_report(raw_result)
        return {"status": "success", "data": report}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# MODULE 2: EXECUTION INTELLIGENCE
@router.post("/execution/drift-analysis")
async def analyze_drift(payload: dict):
    try:
        return execution_service.analyze_drift(payload)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# MODULE 3: GROWTH EXPERIMENT ENGINE
@router.post("/growth/suggest")
async def suggest_experiments(payload: dict):
    try:
        return growth_service.suggest_experiments(payload)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# MODULE 4: UNICORN AGENT
@router.post("/unicorn/market-scan")
async def market_scan(payload: dict):
    try:
        return unicorn_service.market_scan(payload)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# MODULE 5: DECISION AUDIT
@router.post("/audit/review")
async def review_decision(payload: dict):
    try:
        return audit_service.review_decisions(payload)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
