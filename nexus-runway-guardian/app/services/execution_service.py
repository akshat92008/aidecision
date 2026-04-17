"""
app/services/execution_service.py
MODULE 2: EXECUTION INTELLIGENCE
Analyzes tasks and KPIs to detect strategic drift.
"""
from datetime import datetime

class ExecutionService:
    def analyze_drift(self, payload: dict) -> dict:
        tasks = payload.get("tasks", [])
        kpis = payload.get("kpis", {})
        
        drift_detected = False
        bottlenecks = []
        
        # Heuristic 1: Check for overdue critical tasks
        today = datetime.today()
        for task in tasks:
            if task.get("status") != "completed" and "due_date" in task:
                try:
                    due_date = datetime.strptime(task["due_date"], "%Y-%m-%d")
                    if due_date < today:
                        drift_detected = True
                        days_behind = (today - due_date).days
                        bottlenecks.append({
                            "task": task["title"],
                            "issue": f"{days_behind} Days Behind Schedule",
                            "severity": "HIGH" if days_behind > 7 else "MEDIUM"
                        })
                except ValueError:
                    pass

        # Heuristic 2: KPI Deviation
        for kpi, data in kpis.items():
            target = data.get("target", 0)
            actual = data.get("actual", 0)
            if target > 0 and (actual / target) < 0.8:  # 20% off target
                drift_detected = True
                bottlenecks.append({
                    "task": f"KPI Miss: {kpi.upper()}",
                    "issue": f"Running at {int((actual/target)*100)}% of target",
                    "severity": "CRITICAL"
                })

        return {
            "drift_detected": drift_detected,
            "bottlenecks": bottlenecks,
            "action": "Intervention Required" if drift_detected else "Execution on Track",
            "score": max(0, 100 - (len(bottlenecks) * 15))
        }

execution_service = ExecutionService()
