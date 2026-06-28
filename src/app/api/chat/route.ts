import { streamChatText } from "@/lib/ai/client";

export const runtime = "edge";

const SYSTEM_PROMPT = `You are hutechIELTShacker, an expert IELTS tutor and examiner. You help students prepare for the IELTS exam.

You can help with:
- IELTS Writing Task 1 and Task 2 guidance and feedback
- IELTS Speaking tips, sample answers, and vocabulary
- IELTS Reading strategies and question type explanations
- IELTS Listening tips and question types
- Grammar, vocabulary, and pronunciation advice
- Band score explanations and improvement strategies

Always be encouraging, specific, and provide concrete examples. When giving feedback, follow the official IELTS marking criteria.
Respond in the same language as the user (Vietnamese or English).`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const stream = await streamChatText(
      [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      { maxTokens: 2000, temperature: 0.7 }
    );

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response("Xin lỗi, không thể kết nối với AI lúc này.", {
      status: 502,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
