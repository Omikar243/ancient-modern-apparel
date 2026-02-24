import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userAvatars } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Validate ID parameter
    const { id } = await params;
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

    // Fetch avatar to verify ownership and get file info
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

    const userId = session.user.id;
    const avatarId = parseInt(id);

    // Delete from database
    await db.delete(userAvatars).where(eq(userAvatars.id, avatarId));

    // Delete GLB if exists (from previous saves)
    if (avatar[0].measurements) { // Check if has fittedModelUrl, but since table doesn't, skip or assume
      // For now, since table doesn't store fittedModelUrl, skip GLB delete
      // In full implementation, store fittedModelUrl and delete from storage
      console.log('GLB cleanup skipped - implement fittedModelUrl storage');
    }

    // Delete photos if associated (from designs table, but for simplicity, delete all user photos in bucket)
    try {
      const { error } = await supabaseAdmin.storage
        .from('photos')
        .remove([`${userId}/avatar_front`, `${userId}/avatar_back`, `${userId}/avatar_left`, `${userId}/avatar_right`]);
      
      if (error && error.message !== 'No object found matching the specified arguments') {
        console.warn('Photos cleanup warning:', error.message);
      }
    } catch (storageError) {
      console.error('Photos storage cleanup error:', storageError);
    }

    return NextResponse.json({
      message: 'Avatar deleted successfully',
      deletedId: avatarId
    }, { status: 200 });

  } catch (error) {
    console.error('DELETE avatar error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + error,
        code: 'INTERNAL_SERVER_ERROR' 
      }, 
      { status: 500 }
    );
  }
}