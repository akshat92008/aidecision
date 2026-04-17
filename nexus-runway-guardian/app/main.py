"""
app/main.py
Nexus Runway Guardian Dashboard Entrypoint.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

# Import unified routes
from app.api.routes import router as api_router

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("nexus-guardian")

app = FastAPI(
    title="Nexus Runway Guardian",
    description="Unified Strategic Runway Simulation & Audit Engine.",
    version="1.0.0"
)

# Middleware for Next.js integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to your domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root Welcome & Status
@app.get("/")
def home():
    return {
        "engine": "Nexus Runway Guardian",
        "status": "Operational",
        "intelligence": "Strategic Audit Reporting Active",
        "documentation": "/docs"
    }

# Health Check
@app.get("/health")
def health():
    return {"status": "operational", "version": "1.0.0"}

# Include Unified Routes
app.include_router(api_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
