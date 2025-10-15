import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Protect dashboard routes with a very simple cookie check
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public paths
  const isPublic = pathname.startsWith("/login") || pathname.startsWith("/api/auth");
  if (isPublic) return NextResponse.next();

  // Protect dashboard pages only
  if (pathname.startsWith("/dashboard")) {
    const authCookie = request.cookies.get("auth");
    if (!authCookie || authCookie.value !== "1") {
      const url = new URL("/login", request.url);
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/api/auth/:path*"],
};


