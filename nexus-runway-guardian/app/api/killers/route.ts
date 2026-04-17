import { NextResponse } from "next/server";
import { getIndustryKillers } from "@/lib/server/ai-provider";
import { z } from "zod";

const RequestSchema = z.object({
  query: z.string().min(5),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = RequestSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid query" }, { status: 400 });
    }

    const { query } = validation.data;
    const detection = await getIndustryKillers(query);

    return NextResponse.json(detection);
  } catch (error: any) {
    console.error("[API: killers] Error:", error.message || error);
    return NextResponse.json({ 
      error: "Failed to detect industry risks.",
      details: error.message 
    }, { status: 500 });
  }
}
