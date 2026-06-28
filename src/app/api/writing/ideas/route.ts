import { generateAIJson, WRITING_IDEAS_PROMPT } from "@/lib/ai/client";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { task, prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Thiếu đề bài" }, { status: 400 });
    }

    const result = await generateAIJson(
      WRITING_IDEAS_PROMPT(task || "task2", prompt),
      { maxTokens: 2000 }
    );
    return NextResponse.json(result);
  } catch (error) {
    console.error("Writing ideas error:", error);
    return NextResponse.json(
      {
        outline: "Không thể lấy dàn ý gợi ý lúc này. Vui lòng thử lại sau.",
        vocabulary: []
      },
      { status: 500 }
    );
  }
}
