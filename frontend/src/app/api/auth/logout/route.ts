import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_INTERNAL_URL ?? "http://localhost:8080";

export async function POST(request: NextRequest) {
  const cookieHeader = request.headers.get("cookie") ?? "";

  // Tell backend to invalidate the refresh token in DB
  await fetch(`${BACKEND_URL}/api/v1/auth/logout`, {
    method: "POST",
    headers: { cookie: cookieHeader },
  }).catch(() => {
    // Ignore backend errors — we still clear the cookie on the client
  });

  const response = NextResponse.json({ ok: true });

  // Clear the HttpOnly refreshToken cookie
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
