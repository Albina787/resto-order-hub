import { NextRequest, NextResponse } from "next/server";
import { ROLE_DASHBOARD_ROUTES } from "@/lib/utils/constants";

const BACKEND_URL =
  process.env.BACKEND_INTERNAL_URL ?? "http://localhost:8080";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const backendRes = await fetch(`${BACKEND_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });

  if (!backendRes.ok) {
    const error = await backendRes.json().catch(() => ({}));
    return NextResponse.json(error, { status: backendRes.status });
  }

  const data = await backendRes.json();
  const { accessToken, user } = data;

  const redirectTo = ROLE_DASHBOARD_ROUTES[user?.role] ?? "/restaurants";

  const response = NextResponse.json({ redirectTo, user, accessToken });

  const setCookie = backendRes.headers.get("Set-Cookie");
  if (setCookie) {
    response.headers.set("Set-Cookie", setCookie);
  }

  return response;
}
