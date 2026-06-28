import { generateAIText, READING_EXPLAIN_PROMPT, READING_HINT_PROMPT } from "@/lib/ai/client";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  let mode = "explain";
  try {
    const body = await req.json();
    const { passage, question, studentAnswer, correctAnswer } = body;
    mode = body.mode || "explain";

    if (!passage || !question) {
      return NextResponse.json({ error: "Thiếu dữ liệu bài đọc hoặc câu hỏi" }, { status: 400 });
    }

    const promptText = mode === "hint"
      ? READING_HINT_PROMPT(passage, question)
      : READING_EXPLAIN_PROMPT(passage, question, correctAnswer, studentAnswer || "(Chưa trả lời)");

    const text = await generateAIText(promptText, { maxTokens: 500 });

    return NextResponse.json({ result: text });
  } catch (error) {
    console.error("Reading explain/hint error:", error);
    return NextResponse.json(
      { result: mode === "hint" ? "Không thể lấy gợi ý lúc này." : "Không thể lấy giải thích lúc này." },
      { status: 500 }
    );
  }
}
