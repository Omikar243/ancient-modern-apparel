import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { avatars } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication check
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED' 
      }, { status: 401 });
    }

    const { id } = params;

    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: 'Valid ID is required',
        code: 'INVALID_ID' 
      }, { status: 400 });
    }

    const avatarId = parseInt(id);

    // Check if ID is a positive integer
    if (avatarId <= 0) {
      return NextResponse.json({ 
        error: 'ID must be a positive integer',
        code: 'INVALID_ID' 
      }, { status: 400 });
    }

    // Check if avatar exists and belongs to authenticated user
    const existingAvatar = await db.select()
      .from(avatars)
      .where(and(eq(avatars.id, avatarId), eq(avatars.userId, session.user.id)))
      .limit(1);

    if (existingAvatar.length === 0) {
      // Check if avatar exists at all to distinguish between not found and unauthorized
      const avatarExists = await db.select()
        .from(avatars)
        .where(eq(avatars.id, avatarId))
        .limit(1);

      if (avatarExists.length === 0) {
        return NextResponse.json({ 
          error: 'Avatar not found',
          code: 'AVATAR_NOT_FOUND' 
        }, { status: 404 });
      } else {
        return NextResponse.json({ 
          error: 'Access denied: You do not own this avatar',
          code: 'ACCESS_DENIED' 
        }, { status: 403 });
      }
    }

    // Delete the avatar
    const deleted = await db.delete(avatars)
      .where(and(eq(avatars.id, avatarId), eq(avatars.userId, session.user.id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to delete avatar',
        code: 'DELETE_FAILED' 
      }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Avatar deleted successfully',
      deletedAvatar: {
        id: deleted[0].id,
        userId: deleted[0].userId,
        createdAt: deleted[0].createdAt,
        updatedAt: deleted[0].updatedAt
      }
    }, { status: 200 });

  } catch (error) {
    console.error('DELETE avatar error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}