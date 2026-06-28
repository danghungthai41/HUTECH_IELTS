import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { hashPassword, createSession } from "@/lib/auth";
import { eq } from "drizzle-orm";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email, password, fullName } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email và mật khẩu là bắt buộc." }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Mật khẩu phải từ 8 ký tự trở lên." }, { status: 400 });
    }

    // Check existing
    const [existing] = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim()));
    if (existing) {
      return NextResponse.json({ error: "Email này đã được đăng ký." }, { status: 400 });
    }

    const id = crypto.randomUUID();
    const passwordHash = hashPassword(password);

    await db.insert(users).values({
      id,
      email: email.toLowerCase().trim(),
      passwordHash,
      fullName,
      role: "user",
    });

    await createSession(id, "user");

    return NextResponse.json({
      user: {
        id,
        email,
        fullName,
        role: "user",
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Đã xảy ra lỗi hệ thống." }, { status: 500 });
  }
}
