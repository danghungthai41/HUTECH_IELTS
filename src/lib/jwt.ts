// Edge-safe JWT/session constants shared by the auth helpers and middleware.
// Keep this file free of Node-only imports (no `crypto`, `next/headers`, db)
// so it can run inside the Edge middleware runtime.

const rawSecret = process.env.JWT_SECRET;

// `next build` runs with NODE_ENV=production but has no runtime secrets, so we
// must not throw during the build phase — only when actually serving requests.
const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";

if (!rawSecret && process.env.NODE_ENV === "production" && !isBuildPhase) {
  // Fail fast in production rather than silently signing sessions with a
  // public, well-known key that would let anyone forge admin sessions.
  throw new Error(
    "JWT_SECRET is not set. Refusing to run with an insecure default key."
  );
}

if (!rawSecret) {
  console.warn(
    "[auth] JWT_SECRET is not set — using an insecure development fallback. " +
      "Set JWT_SECRET in .env.local before deploying."
  );
}

export const JWT_SECRET = new TextEncoder().encode(
  rawSecret || "dev-only-insecure-fallback-secret-do-not-use-in-production"
);

export const SESSION_COOKIE_NAME = "session";
