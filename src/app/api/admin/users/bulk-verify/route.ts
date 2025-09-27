import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { user } from '@/db/schema';
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Authentication check using better-auth
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ 
        error: 'Authentication required' 
      }, { status: 401 });
    }

    // Log operation for audit purposes
    console.log(`Bulk user verification initiated by user: ${session.user.id} at ${new Date().toISOString()}`);

    // Perform bulk update - set all users to verified
    const updatedUsers = await db.update(user)
      .set({ 
        emailVerified: true, 
        updatedAt: new Date()
      })
      .returning();

    const updatedCount = updatedUsers.length;

    // Log completion
    console.log(`Bulk user verification completed. ${updatedCount} users updated by user: ${session.user.id}`);

    return NextResponse.json({
      success: true,
      message: "All users verified successfully",
      updatedCount
    }, { status: 200 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}