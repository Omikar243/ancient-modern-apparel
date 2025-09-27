import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { user } from '@/db/schema';
import { eq, or } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json();
    const { userId, email } = requestBody;

    // Validate that at least one identifier is provided
    if (!userId && !email) {
      return NextResponse.json({ 
        error: "Either userId or email must be provided",
        code: "MISSING_IDENTIFIER" 
      }, { status: 400 });
    }

    // Build query based on available identifiers (prefer userId if both provided)
    let whereCondition;
    if (userId) {
      whereCondition = eq(user.id, userId);
    } else {
      whereCondition = eq(user.email, email);
    }

    // Find the user
    const existingUser = await db.select()
      .from(user)
      .where(whereCondition)
      .limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json({ 
        error: "User not found",
        code: "USER_NOT_FOUND" 
      }, { status: 404 });
    }

    const currentUser = existingUser[0];
    const previousEmailVerified = currentUser.emailVerified;

    // Update user's email verification status
    const updated = await db.update(user)
      .set({
        emailVerified: true,
        updatedAt: new Date()
      })
      .where(whereCondition)
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ 
        error: "Failed to update user",
        code: "UPDATE_FAILED" 
      }, { status: 500 });
    }

    const updatedUser = updated[0];

    // Prepare response with debug warning headers
    const response = NextResponse.json({
      success: true,
      message: "User email verified successfully",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        emailVerified: updatedUser.emailVerified,
        updatedAt: updatedUser.updatedAt
      },
      previousStatus: previousEmailVerified
    }, { status: 200 });

    // Add warning headers indicating this is a debug endpoint
    response.headers.set('X-Debug-Endpoint', 'true');
    response.headers.set('X-Warning', 'This is a debug endpoint - do not use in production');

    return response;

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}