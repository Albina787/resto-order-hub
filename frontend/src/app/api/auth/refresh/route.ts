import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_INTERNAL_URL ?? "http://localhost:8080";

export async function POST(request: NextRequest) {
  // Forward the refreshToken cookie to the backend
  const cookieHeader = request.headers.get("cookie") ?? "";

  const backendRes = await fetch(`${BACKEND_URL}/api/v1/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Forward cookies so the backend receives the HttpOnly refreshToken
      cookie: cookieHeader,
    },
  });

  if (!backendRes.ok) {
    // Clear the invalid/expired refreshToken cookie
    const response = NextResponse.json({ error: "Refresh failed" }, { status: 401 });
    response.cookies.set({
      name: "refreshToken",
      value: "",
      httpOnly: true,
      path: "/",
      maxAge: 0,
      sameSite: "strict",
    });
    return response;
  }

  const data = await backendRes.json();
  const { accessToken, user } = data;

  const response = NextResponse.json({ accessToken, user });

  // Forward the new Set-Cookie header from backend (new refreshToken)
  const setCookie = backendRes.headers.get("set-cookie");
  if (setCookie) {
    response.headers.set("set-cookie", setCookie);
  }

  return response;
}
