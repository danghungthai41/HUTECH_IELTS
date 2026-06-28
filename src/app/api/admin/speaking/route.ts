import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { speakingTests } from "@/lib/db/schema";
import { isAdmin } from "@/lib/auth";
import { eq } from "drizzle-orm";
import crypto from "crypto";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  try {
    const tests = await db.select().from(speakingTests);
    return NextResponse.json(tests);
  } catch (error) {
    console.error("GET admin speaking tests error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  try {
    const { title, part, questions, cueCard, preparationTime, speakingTime, difficulty, isPublished } = await req.json();

    if (!title || !questions || !Array.isArray(questions)) {
      return NextResponse.json({ error: "Title and Questions array are required" }, { status: 400 });
    }

    const newId = crypto.randomUUID();
    await db.insert(speakingTests).values({
      id: newId,
      title,
      part: part || "part1",
      questions,
      cueCard: cueCard || null,
      preparationTime: Number(preparationTime) || 60,
      speakingTime: Number(speakingTime) || 120,
      difficulty: difficulty || "medium",
      isPublished: !!isPublished,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, id: newId });
  } catch (error) {
    console.error("POST admin speaking test error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  try {
    const { id, title, part, questions, cueCard, preparationTime, speakingTime, difficulty, isPublished } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await db
      .update(speakingTests)
      .set({
        title,
        part,
        questions,
        cueCard,
        preparationTime: Number(preparationTime),
        speakingTime: Number(speakingTime),
        difficulty,
        isPublished: !!isPublished,
      })
      .where(eq(speakingTests.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT admin speaking test error:", error);
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

    await db.delete(speakingTests).where(eq(speakingTests.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE admin speaking test error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
