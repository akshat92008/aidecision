# 🚀 Runway Simulation Engine

> Production-ready startup runway, burn-rate, and financial-decision simulator — calibrated for the **Indian startup ecosystem**.

---

## Architecture

```
runway_engine/
├── runway_simulation_engine.py   ← Core engine (pure stdlib, no deps)
├── api.py                        ← FastAPI wrapper (plug-in ready)
├── requirements.txt
└── tests/
    └── test_runway_engine.py     ← Full pytest suite (35+ tests)
```

---

## Quick Start

```bash
pip install -r requirements.txt

# Run demo simulation
python runway_simulation_engine.py

# Start API server
uvicorn api:app --reload
# Swagger UI → http://localhost:8000/docs
```

---

## API Endpoints

| Method | Path                | Description                        |
|--------|---------------------|------------------------------------|
| GET    | `/health`           | Liveness probe                     |
| POST   | `/api/simulate`     | Full simulation (all outputs)      |
| POST   | `/api/simulate/quick` | Burn + runway only (fast)        |

### Sample Request

```json
POST /api/simulate
{
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
```

### Response Shape

```json
{
  "current_metrics": {
    "burn_rate": 610000,
    "runway_months": 8.2,
    "survival_probability": 0.743,
    "cash_out_date": "12 Nov 2025",
    "is_profitable": false,
    "monthly_cash_flow_projection": [...]
  },
  "scenario_analysis": [
    {
      "label": "Hire 2 senior engineers",
      "new_burn_rate": 970000,
      "new_runway": 5.15,
      "runway_change": -3.05,
      "runway_change_label": "reduces runway by 3.1 months",
      "risk_level": "MEDIUM",
      "cash_out_date": "25 Aug 2025",
      "survival_probability": 0.521,
      "monthly_cash_flow_projection": [...]
    }
  ],
  "decision_insights": {
    "top_3_risks": ["..."],
    "top_3_recommendations": ["..."]
  },
  "founder_message": "At your current burn of ₹6,10,000/month..."
}
```

---

## Core Logic

### Burn Rate
```
burn_rate = total_monthly_costs - monthly_revenue
```

### Total Monthly Costs
```
total_costs = fixed_costs + variable_costs
            + (team_size × avg_salary)
            + (hire_count × salary_per_hire)
            + marketing_spend_change
```

### Runway
```
runway_months = current_cash / burn_rate
             = ∞  if burn_rate ≤ 0  (profitable)
```

### Survival Probability
Blends an empirical India-startup mortality curve (runway depth) with growth-rate momentum:
```
survival = base_probability(runway_months)
         + growth_bonus  (≤ +15pp)
         - growth_penalty (if negative growth)
```

### Risk Classification
| Runway        | Risk Level |
|---------------|------------|
| ≤ 3 months    | HIGH       |
| 3 – 6 months  | MEDIUM     |
| > 6 months    | LOW        |

---

## Plug into Next.js (aidecision project)

```typescript
// app/api/simulate/route.ts
export async function POST(req: Request) {
  const body = await req.json();
  const res = await fetch("http://localhost:8000/api/simulate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return Response.json(data);
}
```

---

## Running Tests

```bash
pytest tests/ -v --tb=short
```

---

## Edge Cases Handled

| Scenario | Behaviour |
|---|---|
| Profitable startup | runway = ∞, survival = 0.99 |
| Zero revenue | Full burn, short runway flagged |
| Zero burn rate | ∞ runway returned |
| Launch delay | Revenue blocked for N months in projection |
| One-time costs | Deducted from cash before simulation |
| Negative growth | Survival penalised accordingly |
