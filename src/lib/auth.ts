import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import crypto from "crypto";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { JWT_SECRET, SESSION_COOKIE_NAME } from "@/lib/jwt";

// PBKDF2 work factor. The iteration count is stored inside the hash so existing
// hashes keep verifying after this value is raised (legacy hashes used 1000).
const PBKDF2_ITERATIONS = 600_000;
const PBKDF2_KEYLEN = 64;
const PBKDF2_DIGEST = "sha512";

// Hashing password using native pbkdf2. Format: "salt:iterations:hash".
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, PBKDF2_KEYLEN, PBKDF2_DIGEST)
    .toString("hex");
  return `${salt}:${PBKDF2_ITERATIONS}:${hash}`;
}

export function verifyPassword(password: string, storedValue: string): boolean {
  const parts = storedValue.split(":");
  // Legacy "salt:hash" (1000 iterations) vs new "salt:iterations:hash".
  const [salt, iterationsOrHash, maybeHash] = parts;
  const hash = parts.length === 3 ? maybeHash : iterationsOrHash;
  const iterations = parts.length === 3 ? Number(iterationsOrHash) : 1000;
  if (!salt || !hash || !Number.isFinite(iterations)) return false;

  const testHash = crypto
    .pbkdf2Sync(password, salt, iterations, PBKDF2_KEYLEN, PBKDF2_DIGEST)
    .toString("hex");
  const a = Buffer.from(hash, "hex");
  const b = Buffer.from(testHash, "hex");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export async function createSession(userId: string, role: string) {
  const token = await new SignJWT({ userId, role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  return token;
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getSessionPayload(token?: string) {
  const t = token || (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  if (!t) return null;
  try {
    const { payload } = await jwtVerify(t, JWT_SECRET);
    return payload as { userId: string; role: string };
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const session = await getSessionPayload();
  if (!session) return null;
  try {
    const [user] = await db.select().from(users).where(eq(users.id, session.userId));
    return user || null;
  } catch {
    return null;
  }
}

export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === "admin";
}
