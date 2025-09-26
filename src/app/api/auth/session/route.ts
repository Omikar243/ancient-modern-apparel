import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session) {
      return NextResponse.json({ user: null, expires: null }, { status: 200 });
    }

    return NextResponse.json({
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
      },
      expires: session.expiresAt,
    }, { status: 200 });
  } catch (error) {
    console.error('Session fetch error:', error);
    return NextResponse.json({ error: 'Session error' }, { status: 500 });
  }
}