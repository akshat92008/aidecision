import { NextResponse } from "next/server";
import { simulationEngine } from "@/lib/server/simulation-engine";
import { z } from "zod";

const RequestSchema = z.object({
  current_cash: z.number().gt(0),
  monthly_revenue: z.number().min(0),
  monthly_fixed_costs: z.number().min(0),
  monthly_variable_costs: z.number().min(0),
  team_size: z.number().min(0),
  avg_salary_per_employee: z.number().min(0),
  growth_rate: z.number(),
  planned_changes: z.array(z.object({
    label: z.string(),
    hire_count: z.number().min(0),
    salary_per_hire: z.number().min(0),
    marketing_spend_change: z.number(),
    revenue_growth_change: z.number(),
    delay_in_launch_days: z.number().min(0),
    one_time_cost: z.number().min(0),
    one_time_revenue_boost: z.number().min(0),
  })).default([]),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = RequestSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const result = simulationEngine.runSimulation(validation.data);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Simulation Error:", error);
    return NextResponse.json(
      { error: "Failed to process runway simulation." },
      { status: 500 }
    );
  }
}
