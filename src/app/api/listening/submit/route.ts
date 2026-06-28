import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { listeningSubmissions, listeningQuestions } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { isAnswerCorrect } from "@/lib/utils";
import { eq } from "drizzle-orm";
import crypto from "crypto";

const mockAnswers: Record<string, string> = {
  lq1: "15th March",
  lq2: "two adults",
  lq3: "C",
  lq4: "Johnson",
  lq5: "SH2024",
};

export async function POST(req: Request) {
  try {
    const { testId, answers } = await req.json();

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let score = 0;
    let total = 0;

    // Handle mock data
    if (testId === "l1") {
      total = Object.keys(mockAnswers).length;
      for (const qId of Object.keys(mockAnswers)) {
        if (isAnswerCorrect(answers[qId], mockAnswers[qId])) score++;
      }
    } else {
      // Query from MySQL DB
      const dbQuestions = await db
        .select()
        .from(listeningQuestions)
        .where(eq(listeningQuestions.testId, testId));

      total = dbQuestions.length;
      for (const q of dbQuestions) {
        if (isAnswerCorrect(answers[q.id], q.correctAnswer)) score++;
      }
    }

    // Save submission to MySQL
    await db.insert(listeningSubmissions).values({
      id: crypto.randomUUID(),
      userId: user.id,
      testId: testId,
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
    console.error("Submit listening error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
