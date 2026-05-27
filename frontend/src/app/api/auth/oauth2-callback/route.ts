import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { token, user } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: "Missing token" },
        { status: 400 }
      );
    }

    // The refresh token is already set as an HttpOnly cookie by the backend
    // during the OAuth redirect — we don't need to set it again here

    return NextResponse.json({ success: true, user, accessToken: token });
  } catch (error) {
    console.error("OAuth2 callback error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
