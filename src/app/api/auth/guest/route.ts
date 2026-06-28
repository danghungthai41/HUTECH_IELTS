import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { createSession } from "@/lib/auth";
import crypto from "crypto";

export async function POST() {
  try {
    const id = crypto.randomUUID();
    // Using a shorter identifier to keep the email readable
    const email = `guest_${id.substring(0, 8)}@trial.com`;
    
    // Insert guest user into the database
    await db.insert(users).values({
      id,
      email,
      passwordHash: "", // Empty hash makes normal password login impossible for this account
      fullName: "Khách Dùng Thử",
      role: "user",
    });

    await createSession(id, "user");

    return NextResponse.json({
      user: {
        id,
        email,
        fullName: "Khách Dùng Thử",
        role: "user",
      },
    });
  } catch (error) {
    console.error("Guest login error:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi tạo phiên dùng thử." },
      { status: 500 }
    );
  }
}
