import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { readingPassages, readingQuestions } from "@/lib/db/schema";
import { isAdmin } from "@/lib/auth";
import { eq } from "drizzle-orm";
import crypto from "crypto";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  try {
    const passages = await db.select().from(readingPassages);
    const result = [];
    for (const p of passages) {
      const questions = await db
        .select()
        .from(readingQuestions)
        .where(eq(readingQuestions.passageId, p.id));
      result.push({
        ...p,
        questions,
      });
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error("GET admin reading passages error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  try {
    const { title, passage, difficulty, timeMinutes, isPublished, questions } = await req.json();

    if (!title || !passage) {
      return NextResponse.json({ error: "Title and Passage are required" }, { status: 400 });
    }

    const passageId = crypto.randomUUID();
    await db.insert(readingPassages).values({
      id: passageId,
      title,
      passage,
      difficulty: difficulty || "medium",
      timeMinutes: Number(timeMinutes) || 20,
      isPublished: !!isPublished,
      createdAt: new Date(),
    });

    if (questions && Array.isArray(questions)) {
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        await db.insert(readingQuestions).values({
          id: crypto.randomUUID(),
          passageId,
          type: q.type || "multiple_choice",
          question: q.question,
          options: q.options || null,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation || null,
          orderIndex: i,
        });
      }
    }

    return NextResponse.json({ success: true, id: passageId });
  } catch (error) {
    console.error("POST admin reading passage error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  try {
    const { id, title, passage, difficulty, timeMinutes, isPublished, questions } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await db
      .update(readingPassages)
      .set({
        title,
        passage,
        difficulty,
        timeMinutes: Number(timeMinutes),
        isPublished: !!isPublished,
      })
      .where(eq(readingPassages.id, id));

    if (questions && Array.isArray(questions)) {
      // Simple way: delete old questions and insert new ones
      await db.delete(readingQuestions).where(eq(readingQuestions.passageId, id));

      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        await db.insert(readingQuestions).values({
          id: crypto.randomUUID(),
          passageId: id,
          type: q.type || "multiple_choice",
          question: q.question,
          options: q.options || null,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation || null,
          orderIndex: i,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT admin reading passage error:", error);
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

    // Cascade delete questions first
    await db.delete(readingQuestions).where(eq(readingQuestions.passageId, id));
    await db.delete(readingPassages).where(eq(readingPassages.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE admin reading passage error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
