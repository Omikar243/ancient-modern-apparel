import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { user } from '@/db/schema';
import { eq, or } from 'drizzle-orm';
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

    const requestBody = await request.json();
    const { userId, email } = requestBody;

    // Validate that at least one identifier is provided
    if (!userId && !email) {
      return NextResponse.json({
        error: "Either userId or email must be provided",
        code: "MISSING_IDENTIFIER"
      }, { status: 400 });
    }

    // Validate input types
    if (userId && typeof userId !== 'string') {
      return NextResponse.json({
        error: "userId must be a string",
        code: "INVALID_USER_ID_TYPE"
      }, { status: 400 });
    }

    if (email && typeof email !== 'string') {
      return NextResponse.json({
        error: "email must be a string",
        code: "INVALID_EMAIL_TYPE"
      }, { status: 400 });
    }

    // Validate email format if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({
        error: "Invalid email format",
        code: "INVALID_EMAIL_FORMAT"
      }, { status: 400 });
    }

    // Find user by userId (preferred) or email
    let whereCondition;
    if (userId) {
      whereCondition = eq(user.id, userId);
    } else {
      whereCondition = eq(user.email, email.toLowerCase());
    }

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

    // Update user's email verification status
    const updatedUser = await db.update(user)
      .set({
        emailVerified: true,
        updatedAt: new Date()
      })
      .where(whereCondition)
      .returning();

    if (updatedUser.length === 0) {
      return NextResponse.json({
        error: "Failed to update user",
        code: "UPDATE_FAILED"
      }, { status: 500 });
    }

    // Return success response with updated user info
    return NextResponse.json({
      success: true,
      message: "User email verified successfully",
      user: {
        id: updatedUser[0].id,
        email: updatedUser[0].email,
        name: updatedUser[0].name,
        emailVerified: updatedUser[0].emailVerified,
        updatedAt: updatedUser[0].updatedAt
      }
    }, { status: 200 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error
    }, { status: 500 });
  }
}