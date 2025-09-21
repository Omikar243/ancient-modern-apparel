import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { designs } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    const results = await db.select()
      .from(designs)
      .where(eq(designs.userId, session.user.id))
      .orderBy(desc(designs.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results);
  } catch (error) {
    console.error('GET designs error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { avatarMeasurements, photoUrls, designData } = body;

    if (!avatarMeasurements || typeof avatarMeasurements !== 'object') {
      return NextResponse.json({ 
        error: 'avatar_measurements is required and must be an object' 
      }, { status: 400 });
    }

    if (!photoUrls || !Array.isArray(photoUrls)) {
      return NextResponse.json({ 
        error: 'photo_urls is required and must be an array' 
      }, { status: 400 });
    }

    const newDesign = await db.insert(designs)
      .values({
        userId: session.user.id,
        avatarMeasurements,
        photoUrls,
        designData: designData || {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json(newDesign[0], { status: 201 });
  } catch (error) {
    console.error('POST designs error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}