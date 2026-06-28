import { generateAIJson, SPEAKING_SAMPLE_PROMPT } from "@/lib/ai/client";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { question } = await req.json();

    if (!question) {
      return NextResponse.json({ error: "Thiếu câu hỏi" }, { status: 400 });
    }

    const result = await generateAIJson(SPEAKING_SAMPLE_PROMPT(question), {
      maxTokens: 1500,
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Speaking sample answer error:", error);
    return NextResponse.json(
      {
        sampleAnswer: "Không thể lấy câu trả lời mẫu lúc này. Vui lòng thử lại sau.",
        vocabulary: []
      },
      { status: 500 }
    );
  }
}
