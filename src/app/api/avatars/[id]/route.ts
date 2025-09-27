import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userAvatars } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate ID parameter
    const id = params.id;
    if (!id || isNaN(parseInt(id)) || parseInt(id) <= 0) {
      return NextResponse.json(
        { 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, 
        { status: 400 }
      );
    }

    // Authentication check
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session) {
      return NextResponse.json(
        { 
          error: 'Authentication required',
          code: 'AUTHENTICATION_REQUIRED' 
        }, 
        { status: 401 }
      );
    }

    // Fetch avatar by ID from userAvatars table
    const avatar = await db.select()
      .from(userAvatars)
      .where(eq(userAvatars.id, parseInt(id)))
      .limit(1);

    if (avatar.length === 0) {
      return NextResponse.json(
        { 
          error: 'Avatar not found',
          code: 'AVATAR_NOT_FOUND' 
        }, 
        { status: 404 }
      );
    }

    // Authorization check - verify avatar belongs to authenticated user
    if (avatar[0].userId !== session.user.id) {
      return NextResponse.json(
        { 
          error: 'Access denied - you do not own this avatar',
          code: 'ACCESS_DENIED' 
        }, 
        { status: 403 }
      );
    }

    // Return avatar with parsed measurements in expected format
    const avatarData = {
      id: avatar[0].id,
      userId: avatar[0].userId,
      measurements: typeof avatar[0].measurements === 'string' 
        ? JSON.parse(avatar[0].measurements) 
        : avatar[0].measurements,
      fittedModelUrl: null, // userAvatars doesn't have this field yet
      createdAt: avatar[0].updatedAt // using updatedAt as createdAt
    };

    return NextResponse.json(avatarData, { status: 200 });

  } catch (error) {
    console.error('GET avatar error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + error,
        code: 'INTERNAL_SERVER_ERROR' 
      }, 
      { status: 500 }
    );
  }
}