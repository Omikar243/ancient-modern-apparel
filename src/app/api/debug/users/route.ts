// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { user } from '@/db/schema';
import { like, or, desc, count } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Pagination parameters
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');

    // Build base query
    let query = db.select({
      id: user.id,
      email: user.email,
      name: user.name,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt
    }).from(user);

    // Add search filter if provided
    if (search) {
      const searchCondition = or(
        like(user.email, `%${search}%`),
        like(user.name, `%${search}%`)
      );
      query = query.where(searchCondition);
    }

    // Get users with pagination and ordering
    const users = await query
      .orderBy(desc(user.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    let countQuery = db.select({ count: count() }).from(user);
    if (search) {
      const searchCondition = or(
        like(user.email, `%${search}%`),
        like(user.name, `%${search}%`)
      );
      countQuery = countQuery.where(searchCondition);
    }
    const totalResult = await countQuery;
    const totalUsers = totalResult[0].count;

    // Separate verified and unverified users
    const verifiedUsers = users.filter(u => u.emailVerified === true);
    const unverifiedUsers = users.filter(u => u.emailVerified === false);

    // Create summary statistics
    const summary = {
      total: users.length,
      verified: verifiedUsers.length,
      unverified: unverifiedUsers.length
    };

    const response = NextResponse.json({
      users,
      totalUsers,
      verifiedUsers,
      unverifiedUsers,
      summary
    });

    // Add warning header indicating debug endpoint
    response.headers.set('X-Debug-Endpoint', 'true');
    response.headers.set('X-Warning', 'This is a debug endpoint - do not use in production');

    return response;

  } catch (error) {
    console.error('GET /api/debug/users error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}