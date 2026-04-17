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
    const validation = RequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 });
    }

    const { query, constraints, industryKillers } = validation.data;
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // 1. Setup onThought callback to stream chunks
          const onThought = (agent: string, thought: string) => {
            const chunk = JSON.stringify({ type: 'thought', payload: { agent, thought, timestamp: new Date().toISOString() } });
            controller.enqueue(encoder.encode(chunk + "\n"));
          };

          // 2. PHASE 4: PII Scrubbing (Server-Side)
          const { guardrails } = await import("@/lib/server/guardrails");
          const safeQuery = guardrails.scrub(query);

          // 3. Generate the report with the callback
          const finalReport = await generateDecisionReport(safeQuery, industryKillers, onThought);

          // 4. PHASE 2: PERISTENCE
          const supabase = await createClient();
          const { data: { user } } = await supabase.auth.getUser();

          if (user) {
            const { error: dError } = await supabase
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
              });
            if (dError) console.error("[Supabase Error] Decision Insert:", dError);
          }

          // 5. Stream final report
          const finalChunk = JSON.stringify({ type: 'report', payload: finalReport });
          controller.enqueue(encoder.encode(finalChunk + "\n"));
          controller.close();
        } catch (error: any) {
          const errorChunk = JSON.stringify({ type: 'error', payload: error.message || "Internal Engine Failure" });
          controller.enqueue(encoder.encode(errorChunk + "\n"));
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error("Error in AI decision engine setup:", error);
    return NextResponse.json({ error: "Failed to initialize stream" }, { status: 500 });
  }
}

