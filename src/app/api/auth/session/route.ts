import { NextRequest, NextResponse } from 'next/server';
import { getAuthDiagnostics } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    console.info("[auth-session] request", {
      origin: request.headers.get("origin"),
      referer: request.headers.get("referer"),
      host: request.headers.get("host"),
      hasCookie: Boolean(request.headers.get("cookie")),
      hasAuthorization: Boolean(request.headers.get("authorization")),
      diagnostics: getAuthDiagnostics(),
    });

    const upstream = await fetch(new URL("/api/auth/get-session", request.url), {
      method: "GET",
      headers: request.headers,
      cache: "no-store",
    });

    if (!upstream.ok) {
      console.warn("[auth-session] upstream failed", {
        status: upstream.status,
        statusText: upstream.statusText,
      });
      return NextResponse.json({ error: 'Session error' }, { status: upstream.status });
    }

    const session = await upstream.json();

    if (!session?.user || !session?.session) {
      console.info("[auth-session] no active session");
      return NextResponse.json({ user: null, expires: null }, { status: 200 });
    }

    console.info("[auth-session] success", {
      userId: session.user.id,
      sessionId: session.session.id ?? null,
      expiresAt: session.session.expiresAt ?? null,
    });
    return NextResponse.json({
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
      },
      expires: session.session.expiresAt,
    }, { status: 200 });
  } catch (error) {
    console.error('[auth-session] failure', error);
    return NextResponse.json({ error: 'Session error' }, { status: 500 });
  }
}
