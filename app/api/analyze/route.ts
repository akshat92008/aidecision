import { NextResponse } from "next/server";
import { generateDecisionReport } from "@/lib/server/ai-provider";
import { z } from "zod";

const RequestSchema = z.object({
  query: z.string().min(5, "Query is too short"),
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

    const { query, industryKillers } = validation.data;

    // Generate the report
    const finalReport = await generateDecisionReport(query, industryKillers);

    return NextResponse.json(finalReport);
  } catch (error: any) {
    console.error("Error in AI decision engine:", error);
    
    // Better user-facing error messages
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

