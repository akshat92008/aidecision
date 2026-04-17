"""
app/api/routes.py
Unified FastAPI routes for Nexus Runway Guardian.
"""

from fastapi import APIRouter, HTTPException
from app.services.simulation_service import simulation_service
from app.services.output_service import output_service
from app.services.alert_service import alert_service
import logging

router = APIRouter()
logger = logging.getLogger("nexus-guardian")

@router.post("/simulate")
async def simulate(payload: dict):
    """Returns raw simulation JSON."""
    try:
        result = simulation_service.perform_full_simulation(payload)
        return result
    except Exception as e:
        logger.error(f"Simulation failure: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/audit-report")
async def audit_report(payload: dict):
    """Main endpoint: Returns structured founder report."""
    try:
        # 1. Run simulation
        raw_result = simulation_service.perform_full_simulation(payload)
        # 2. Transform to report
        report = output_service.generate_founder_report(raw_result)
        return {"status": "success", "data": report}
    except Exception as e:
        logger.error(f"Audit failure: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/runway-alert")
async def runway_alert(payload: dict):
    """Lightweight: Returns short alert message."""
    try:
        # 1. Run simulation
        raw_result = simulation_service.perform_full_simulation(payload)
        # 2. Generate alert
        alert = alert_service.generate_alert(raw_result)
        return alert
    except Exception as e:
        logger.error(f"Alert failure: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
