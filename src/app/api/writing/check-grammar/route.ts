import { generateAIJson, WRITING_GRAMMAR_PROMPT } from "@/lib/ai/client";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { essay } = await req.json();

    if (!essay || essay.trim().length < 10) {
      return NextResponse.json({ error: "Bài viết quá ngắn để kiểm tra" }, { status: 400 });
    }

    const result = await generateAIJson(WRITING_GRAMMAR_PROMPT(essay), {
      maxTokens: 2500,
      temperature: 0.2,
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Grammar check error:", error);
    return NextResponse.json(
      {
        errors: [],
        correctedEssay: "",
        error: "Không thể kết nối với AI kiểm tra ngữ pháp lúc này."
      },
      { status: 500 }
    );
  }
}
