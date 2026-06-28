import { generateAIJson, WRITING_SCORE_PROMPT } from "@/lib/ai/client";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { writingSubmissions } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { countWords } from "@/lib/utils";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { testId, task, prompt, essay } = await req.json();

    if (!essay || essay.trim().length < 10) {
      return NextResponse.json({ error: "Bài viết quá ngắn" }, { status: 400 });
    }

    const user = await getCurrentUser();

    const result = await generateAIJson<Record<string, string>>(
      WRITING_SCORE_PROMPT(task, prompt, essay),
      { maxTokens: 2500 }
    );

    // Save to database if user is logged in and it's a standard test (not custom).
    // A DB failure here must not discard a successful AI score.
    if (user && testId && testId !== "custom") {
      try {
        await db.insert(writingSubmissions).values({
          id: crypto.randomUUID(),
          userId: user.id,
          testId: testId,
          essay,
          wordCount: countWords(essay),
          taskAchievement: result.taskAchievement,
          coherenceCohesion: result.coherenceCohesion,
          lexicalResource: result.lexicalResource,
          grammaticalRange: result.grammaticalRange,
          overallBand: result.overallBand,
          feedback: result.feedback,
          improvedEssay: result.improvedEssay,
          createdAt: new Date(),
        });
      } catch (dbError) {
        console.error("Writing score: failed to save submission:", dbError);
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Writing score error:", error);
    return NextResponse.json(
      { error: "AI chấm điểm hiện chưa khả dụng. Vui lòng thử lại sau." },
      { status: 502 }
    );
  }
}
