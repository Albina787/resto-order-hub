import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/reservations", "/orders", "/profile", "/dashboard"];
const publicOnlyRoutes = ["/login", "/register", "/forgot-password", "/reset-password"];

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const isProtectedRoute = protectedRoutes.some(
    (route) => path === route || path.startsWith(`${route}/`)
  );
  const isPublicOnlyRoute = publicOnlyRoutes.some(
    (route) => path === route || path.startsWith(`${route}/`)
  );

  // Check for refresh token in cookies (set by auth flow)
  const refreshToken = request.cookies.get("refreshToken")?.value;
  // Also check Authorization header for SSR requests
  const hasToken = !!refreshToken;

  if (isProtectedRoute && !hasToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", path);
    return NextResponse.redirect(loginUrl);
  }

  if (isPublicOnlyRoute && hasToken) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$).*)"],
};
