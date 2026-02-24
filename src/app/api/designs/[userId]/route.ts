import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { designs } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';

interface Params {
  userId: string;
}

export async function GET(
  request: NextRequest, 
  { params }: { params: Promise<Params> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session?.user) {
      return NextResponse.json({ 
        error: 'Authentication required' 
      }, { status: 401 });
    }

    const { userId } = await params;

    // Authorization check: users can only access their own designs
    if (userId !== session.user.id) {
      return NextResponse.json({ 
        error: 'Access denied: You can only view your own designs',
        code: 'ACCESS_DENIED'
      }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get designs for the authenticated user
    const userDesigns = await db.select()
      .from(designs)
      .where(eq(designs.userId, userId))
      .orderBy(desc(designs.createdAt))
      .limit(limit)
      .offset(offset);

    // Parse JSON fields for response
    const parsedDesigns = userDesigns.map(design => ({
      ...design,
      colors: typeof (design as any).colors === 'string' ? JSON.parse((design as any).colors) : (design as any).colors
    }));

    return NextResponse.json(parsedDesigns);

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}