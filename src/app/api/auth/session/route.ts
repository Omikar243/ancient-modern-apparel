import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const upstream = await fetch(new URL("/api/auth/get-session", request.url), {
      method: "GET",
      headers: request.headers,
      cache: "no-store",
    });

    if (!upstream.ok) {
      return NextResponse.json({ error: 'Session error' }, { status: upstream.status });
    }

    const session = await upstream.json();

    if (!session?.user || !session?.session) {
      return NextResponse.json({ user: null, expires: null }, { status: 200 });
    }

    return NextResponse.json({
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
      },
      expires: session.session.expiresAt,
    }, { status: 200 });
  } catch (error) {
    console.error('Session fetch error:', error);
    return NextResponse.json({ error: 'Session error' }, { status: 500 });
  }
}
