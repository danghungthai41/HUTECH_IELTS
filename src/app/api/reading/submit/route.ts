import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { readingSubmissions, readingQuestions } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { isAnswerCorrect } from "@/lib/utils";
import { eq } from "drizzle-orm";
import crypto from "crypto";

const mockAnswers: Record<string, string> = {
  q1: "B",
  q2: "FALSE",
  q3: "TRUE",
  q4: "DNS",
  q5: "C",
  q6: "FALSE",
  q7: "1991",
};

export async function POST(req: Request) {
  try {
    const { passageId, answers } = await req.json();

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let score = 0;
    let total = 0;

    // Handle mock data
    if (passageId === "r1") {
      total = Object.keys(mockAnswers).length;
      for (const qId of Object.keys(mockAnswers)) {
        if (isAnswerCorrect(answers[qId], mockAnswers[qId])) score++;
      }
    } else {
      // Query from MySQL DB
      const dbQuestions = await db
        .select()
        .from(readingQuestions)
        .where(eq(readingQuestions.passageId, passageId));

      total = dbQuestions.length;
      for (const q of dbQuestions) {
        if (isAnswerCorrect(answers[q.id], q.correctAnswer)) score++;
      }
    }

    // Save submission to MySQL
    await db.insert(readingSubmissions).values({
      id: crypto.randomUUID(),
      userId: user.id,
      passageId: passageId,
      answers: answers,
      score: score,
      totalQuestions: total,
      createdAt: new Date(),
    });

    return NextResponse.json({
      score,
      total,
    });
  } catch (error) {
    console.error("Submit reading error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
