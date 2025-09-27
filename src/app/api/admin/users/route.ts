import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { user } from '@/db/schema';
import { eq, like, and, or, desc, count } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Authentication check using better-auth
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ 
        error: 'Authentication required' 
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    
    // Parse and validate pagination parameters
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');
    const search = searchParams.get('search');

    let limit = 50; // default
    let offset = 0; // default

    if (limitParam) {
      const parsedLimit = parseInt(limitParam);
      if (isNaN(parsedLimit) || parsedLimit < 1) {
        return NextResponse.json({ 
          error: 'Limit must be a positive integer',
          code: 'INVALID_LIMIT' 
        }, { status: 400 });
      }
      limit = Math.min(parsedLimit, 100); // max 100
    }

    if (offsetParam) {
      const parsedOffset = parseInt(offsetParam);
      if (isNaN(parsedOffset) || parsedOffset < 0) {
        return NextResponse.json({ 
          error: 'Offset must be a non-negative integer',
          code: 'INVALID_OFFSET' 
        }, { status: 400 });
      }
      offset = parsedOffset;
    }

    // Build base query for users
    let usersQuery = db.select({
      id: user.id,
      email: user.email,
      name: user.name,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt
    }).from(user);

    // Apply search filter if provided
    if (search && search.trim()) {
      const searchTerm = search.trim();
      usersQuery = usersQuery.where(
        or(
          like(user.email, `%${searchTerm}%`),
          like(user.name, `%${searchTerm}%`)
        )
      );
    }

    // Apply ordering, pagination and execute query
    const users = await usersQuery
      .orderBy(desc(user.createdAt))
      .limit(limit + 1) // Get one extra to check if there are more
      .offset(offset);

    // Check if there are more records
    const hasMore = users.length > limit;
    if (hasMore) {
      users.pop(); // Remove the extra record
    }

    // Get total users count
    let totalUsersQuery = db.select({ count: count() }).from(user);
    if (search && search.trim()) {
      const searchTerm = search.trim();
      totalUsersQuery = totalUsersQuery.where(
        or(
          like(user.email, `%${searchTerm}%`),
          like(user.name, `%${searchTerm}%`)
        )
      );
    }
    const totalUsersResult = await totalUsersQuery;
    const totalUsers = totalUsersResult[0]?.count || 0;

    // Get unverified users count for diagnostics
    const unverifiedCountResult = await db.select({ count: count() })
      .from(user)
      .where(eq(user.emailVerified, false));
    const unverifiedCount = unverifiedCountResult[0]?.count || 0;

    return NextResponse.json({
      users,
      totalUsers,
      unverifiedCount,
      pagination: {
        limit,
        offset,
        hasMore
      }
    });

  } catch (error) {
    console.error('GET /api/admin/users error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}