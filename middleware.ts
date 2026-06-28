import { type NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { JWT_SECRET, SESSION_COOKIE_NAME } from "@/lib/jwt";

export async function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  let user: { userId: string; role: string } | null = null;
  if (sessionToken) {
    try {
      const { payload } = await jwtVerify(sessionToken, JWT_SECRET);
      user = payload as { userId: string; role: string };
    } catch {
      // Invalid token
    }
  }

  const isAuthPage =
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/register");
  const isAdminPage = request.nextUrl.pathname.startsWith("/admin");
  const isAppPage =
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/writing") ||
    request.nextUrl.pathname.startsWith("/speaking") ||
    request.nextUrl.pathname.startsWith("/reading") ||
    request.nextUrl.pathname.startsWith("/listening") ||
    request.nextUrl.pathname.startsWith("/chat");

  if (!user && (isAppPage || isAdminPage)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (user && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (user && isAdminPage && user.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

