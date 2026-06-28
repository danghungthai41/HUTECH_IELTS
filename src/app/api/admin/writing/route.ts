import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { writingTests } from "@/lib/db/schema";
import { isAdmin } from "@/lib/auth";
import { eq } from "drizzle-orm";
import crypto from "crypto";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  try {
    const tests = await db.select().from(writingTests);
    return NextResponse.json(tests);
  } catch (error) {
    console.error("GET admin writing tests error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  try {
    const { title, task, prompt, imageUrl, timeMinutes, difficulty, isPublished } = await req.json();

    if (!title || !prompt) {
      return NextResponse.json({ error: "Title and Prompt are required" }, { status: 400 });
    }

    const newId = crypto.randomUUID();
    await db.insert(writingTests).values({
      id: newId,
      title,
      task: task || "task2",
      prompt,
      imageUrl: imageUrl || null,
      timeMinutes: Number(timeMinutes) || 40,
      difficulty: difficulty || "medium",
      isPublished: !!isPublished,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, id: newId });
  } catch (error) {
    console.error("POST admin writing test error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  try {
    const { id, title, task, prompt, imageUrl, timeMinutes, difficulty, isPublished } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await db
      .update(writingTests)
      .set({
        title,
        task,
        prompt,
        imageUrl,
        timeMinutes: Number(timeMinutes),
        difficulty,
        isPublished: !!isPublished,
      })
      .where(eq(writingTests.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT admin writing test error:", error);
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

    await db.delete(writingTests).where(eq(writingTests.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE admin writing test error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
