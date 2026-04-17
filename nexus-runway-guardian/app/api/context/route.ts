import { NextResponse } from "next/server";
import { getConsultationQuestions } from "@/lib/server/ai-provider";
import { z } from "zod";

const RequestSchema = z.object({
  query: z.string().min(5),
  constraints: z.any().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = RequestSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
    }

    const { query, constraints } = validation.data;
    const consultation = await getConsultationQuestions(query, constraints);

    return NextResponse.json(consultation);
  } catch (error: any) {
    console.error("[API: context] Error:", error.message || error);
    return NextResponse.json({ 
      error: "Failed to detect context gaps.",
      details: error.message 
    }, { status: 500 });
  }
}
