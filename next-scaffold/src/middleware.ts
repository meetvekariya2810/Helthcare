import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("bjk_token")?.value;

  // Protected paths check
  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isHrmsRoute = pathname.startsWith("/hrms");
  const isEmployeeRoute =
    pathname.startsWith("/employee") &&
    !pathname.startsWith("/employee/login") &&
    !pathname.startsWith("/employee/change-password");
  const isCanteenRoute =
    pathname.startsWith("/canteen") && !pathname.startsWith("/canteen/login");

  // Redirect unauthenticated requests to appropriate login portal
  if (!token) {
    if (isDashboardRoute || isHrmsRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
    if (isEmployeeRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/employee/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
    if (isCanteenRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/canteen/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
  }

  // Response with security headers
  const response = NextResponse.next();
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/employee/:path*",
    "/canteen/:path*",
    "/hrms/:path*",
  ],
};
