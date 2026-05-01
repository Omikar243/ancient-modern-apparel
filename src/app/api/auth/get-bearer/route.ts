import { auth, getAuthDiagnostics } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    console.info("[auth-get-bearer] request", {
      origin: request.headers.get("origin"),
      referer: request.headers.get("referer"),
      host: request.headers.get("host"),
      hasCookie: Boolean(request.headers.get("cookie")),
      hasAuthorization: Boolean(request.headers.get("authorization")),
      diagnostics: getAuthDiagnostics(),
    });

    // Get the session from cookies
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session) {
      console.warn("[auth-get-bearer] no session");
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // The session token is what we need for bearer authentication
    // This is the token stored in the session table
    const token = session.session?.token;

    if (!token) {
      console.error("[auth-get-bearer] session exists but no token found", {
        hasSession: Boolean(session.session),
        hasUser: Boolean(session.user),
        sessionId: session.session?.id ?? null,
      });
      return NextResponse.json(
        { error: "No token in session" },
        { status: 500 }
      );
    }

    console.info("[auth-get-bearer] success", {
      sessionId: session.session?.id ?? null,
      userId: session.user?.id ?? null,
    });
    return NextResponse.json({ token });
  } catch (error) {
    console.error("[auth-get-bearer] failure", error);
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 }
    );
  }
}
