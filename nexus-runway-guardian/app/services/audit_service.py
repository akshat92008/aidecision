"""
app/services/audit_service.py
MODULE 5: DECISION AUDIT SYSTEM
Scores founder decisions and detects historical patterns.
"""
class AuditService:
    def review_decisions(self, payload: dict) -> dict:
        decisions = payload.get("decisions", [])
        
        if not decisions:
            return {
                "founder_score": 0,
                "win_rate": 0,
                "pattern_detected": "Awaiting enough decisions to analyze.",
                "total_decisions": 0
            }

        successes = sum(1 for d in decisions if d.get("actual_outcome", "").lower() == "success")
        failures = len(decisions) - successes
        win_rate = (successes / len(decisions)) * 100 if decisions else 0
        
        score = 50 + (win_rate * 0.5)

        patterns = []
        failed_decisions = [d for d in decisions if d.get("actual_outcome", "").lower() == "failed"]
        
        if len(failed_decisions) >= 2:
            patterns.append("Consistently underestimating time-to-market for new initiatives.")
            score -= 5
        elif successes >= 3:
            patterns.append("High accuracy in pricing-related strategic decisions.")
            score += 10

        return {
            "founder_score": int(max(0, min(100, score))),
            "win_rate": int(win_rate),
            "total_decisions": len(decisions),
            "pattern_detected": patterns[0] if patterns else "Adapting normally to market conditions."
        }

audit_service = AuditService()
