import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { listeningTests, listeningQuestions } from "@/lib/db/schema";
import { isAdmin } from "@/lib/auth";
import { eq } from "drizzle-orm";
import crypto from "crypto";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  try {
    const tests = await db.select().from(listeningTests);
    const result = [];
    for (const t of tests) {
      const questions = await db
        .select()
        .from(listeningQuestions)
        .where(eq(listeningQuestions.testId, t.id));
      result.push({
        ...t,
        questions,
      });
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error("GET admin listening tests error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  try {
    const { title, audioUrl, transcript, difficulty, timeMinutes, isPublished, questions } = await req.json();

    if (!title || !audioUrl) {
      return NextResponse.json({ error: "Title and Audio URL are required" }, { status: 400 });
    }

    const testId = crypto.randomUUID();
    await db.insert(listeningTests).values({
      id: testId,
      title,
      audioUrl,
      transcript: transcript || "",
      difficulty: difficulty || "medium",
      timeMinutes: Number(timeMinutes) || 30,
      isPublished: !!isPublished,
      createdAt: new Date(),
    });

    if (questions && Array.isArray(questions)) {
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        await db.insert(listeningQuestions).values({
          id: crypto.randomUUID(),
          testId,
          type: q.type || "multiple_choice",
          question: q.question,
          options: q.options || null,
          correctAnswer: q.correctAnswer,
          orderIndex: i,
        });
      }
    }

    return NextResponse.json({ success: true, id: testId });
  } catch (error) {
    console.error("POST admin listening test error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  try {
    const { id, title, audioUrl, transcript, difficulty, timeMinutes, isPublished, questions } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await db
      .update(listeningTests)
      .set({
        title,
        audioUrl,
        transcript,
        difficulty,
        timeMinutes: Number(timeMinutes),
        isPublished: !!isPublished,
      })
      .where(eq(listeningTests.id, id));

    if (questions && Array.isArray(questions)) {
      await db.delete(listeningQuestions).where(eq(listeningQuestions.testId, id));

      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        await db.insert(listeningQuestions).values({
          id: crypto.randomUUID(),
          testId: id,
          type: q.type || "multiple_choice",
          question: q.question,
          options: q.options || null,
          correctAnswer: q.correctAnswer,
          orderIndex: i,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT admin listening test error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await db.delete(listeningQuestions).where(eq(listeningQuestions.testId, id));
    await db.delete(listeningTests).where(eq(listeningTests.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE admin listening test error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
