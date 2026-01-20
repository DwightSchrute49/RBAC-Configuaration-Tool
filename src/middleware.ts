import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const isAuthPage = request.nextUrl.pathname.startsWith("/auth");
  const isApiAuth = request.nextUrl.pathname.startsWith("/api/auth");
  const isRootPath = request.nextUrl.pathname === "/";

  // Allow root path - it will handle its own redirect
  if (isRootPath) {
    return NextResponse.next();
  }

  // Allow API auth endpoints
  if (isApiAuth) {
    return NextResponse.next();
  }

  // Redirect to login if not authenticated and trying to access protected route
  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Redirect to dashboard if authenticated and trying to access auth pages
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
