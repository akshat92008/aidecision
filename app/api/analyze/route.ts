import { NextResponse } from "next/server";
import { generateDecisionReport } from "@/lib/server/decision-engine";
import { createClient } from "@/utils/supabase/server";
import { z } from "zod";

const RequestSchema = z.object({
  query: z.string().min(5, "Query is too short"),
  constraints: z.any().optional(),
  industryKillers: z.array(z.any()).optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validate request input
    const validation = RequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { query, constraints, industryKillers } = validation.data;

    // PHASE 4: PII Scrubbing (Server-Side)
    const { guardrails } = await import("@/lib/server/guardrails");
    const safeQuery = guardrails.scrub(query);

    // Generate the report
    const finalReport = await generateDecisionReport(safeQuery, industryKillers);

    // PHASE 2: PERISTENCE
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // Create initial decision record
      const { data: decision, error: dError } = await supabase
        .from('decisions')
        .insert({
          user_id: user.id,
          query: query,
          constraints: constraints || {},
          viability_score: finalReport.viability_score,
          status: 'active',
          last_report: finalReport,
          milestones: finalReport.ninety_day_roadmap.map((title: string) => ({
            id: crypto.randomUUID(),
            title,
            status: 'pending'
          }))
        })
        .select()
        .single();

      if (dError) console.error("[Supabase Error] Decision Insert:", dError);
    }

    return NextResponse.json(finalReport);
  } catch (error: any) {
    console.error("Error in AI decision engine:", error);
    
    const status = error.message.includes("rate limit") ? 429 : 500;
    const message = error.message.includes("rate limit") 
      ? "AI model is busy (rate limited). Please try again in a moment." 
      : (error.message || "Failed to generate decision report. Please try again.");
    
    return NextResponse.json(
      { error: message },
      { status }
    );
  }
}

