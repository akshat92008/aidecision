import { NextResponse } from "next/server";
import { getRefinedProblem } from "@/lib/server/ai-provider";
import { z } from "zod";

const RequestSchema = z.object({
  query: z.string().min(5),
  answers: z.record(z.any()),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = RequestSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid answers provided" }, { status: 400 });
    }

    const { query, answers } = validation.data;
    const refined = await getRefinedProblem(query, answers);

    return NextResponse.json(refined);
  } catch (error: any) {
    console.error("[API: refine] Error:", error.message || error);
    return NextResponse.json({ 
      error: "Failed to refine context.",
      details: error.message 
    }, { status: 500 });
  }
}
