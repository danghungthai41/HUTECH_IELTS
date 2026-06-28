import { generateAIJson, SPEAKING_SCORE_PROMPT } from "@/lib/ai/client";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { speakingSubmissions } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { testId, part, questions, transcripts } = await req.json();

    const user = await getCurrentUser();

    const result = await generateAIJson<Record<string, string>>(
      SPEAKING_SCORE_PROMPT(part, questions, transcripts),
      { maxTokens: 2000 }
    );

    // Save to database if user is logged in. A DB failure must not discard
    // a successful AI score.
    if (user && testId) {
      try {
        await db.insert(speakingSubmissions).values({
          id: crypto.randomUUID(),
          userId: user.id,
          testId: testId,
          transcripts: transcripts,
          audioUrls: [], // Can be populated if uploading audio files to bucket
          fluencyCoherence: result.fluencyCoherence,
          lexicalResource: result.lexicalResource,
          grammaticalRange: result.grammaticalRange,
          pronunciation: result.pronunciation,
          overallBand: result.overallBand,
          feedback: result.feedback,
          createdAt: new Date(),
        });
      } catch (dbError) {
        console.error("Speaking score: failed to save submission:", dbError);
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Speaking score error:", error);
    return NextResponse.json(
      { error: "AI chấm điểm hiện chưa khả dụng. Vui lòng thử lại sau." },
      { status: 502 }
    );
  }
}
