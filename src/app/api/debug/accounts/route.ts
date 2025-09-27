import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { account, user } from '@/db/schema';
import { eq, like, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const userId = searchParams.get('userId');
    const provider = searchParams.get('provider');

    // Validate parameters
    if (userId && typeof userId !== 'string') {
      return NextResponse.json({
        error: "Invalid userId parameter",
        code: "INVALID_USER_ID"
      }, { status: 400 });
    }

    if (email && typeof email !== 'string') {
      return NextResponse.json({
        error: "Invalid email parameter", 
        code: "INVALID_EMAIL"
      }, { status: 400 });
    }

    if (provider && typeof provider !== 'string') {
      return NextResponse.json({
        error: "Invalid provider parameter",
        code: "INVALID_PROVIDER"
      }, { status: 400 });
    }

    // Build query with joins
    let query = db.select({
      accountId: account.id,
      providerId: account.providerId,
      password: account.password,
      accountCreatedAt: account.createdAt,
      userEmail: user.email,
      userName: user.name,
      emailVerified: user.emailVerified,
      userId: user.id,
      accessToken: account.accessToken,
      refreshToken: account.refreshToken,
      scope: account.scope
    })
    .from(account)
    .leftJoin(user, eq(account.userId, user.id));

    // Apply filters
    const conditions = [];
    
    if (email) {
      conditions.push(like(user.email, `%${email}%`));
    }
    
    if (userId) {
      conditions.push(eq(user.id, userId));
    }
    
    if (provider) {
      conditions.push(eq(account.providerId, provider));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const accounts = await query;

    // Mask password hashes for security
    const maskedAccounts = accounts.map(acc => ({
      ...acc,
      password: acc.password ? `${acc.password.substring(0, 10)}...` : null,
      accessToken: acc.accessToken ? `${acc.accessToken.substring(0, 10)}...` : null,
      refreshToken: acc.refreshToken ? `${acc.refreshToken.substring(0, 10)}...` : null
    }));

    const response = NextResponse.json({
      accounts: maskedAccounts,
      count: maskedAccounts.length,
      filters: {
        email: email || null,
        userId: userId || null,
        provider: provider || null
      }
    });

    // Add warning headers
    response.headers.set('X-Debug-Endpoint', 'true');
    response.headers.set('X-Warning', 'This is a debug endpoint for development use only');
    response.headers.set('X-Security-Notice', 'Sensitive data has been masked for security');

    return response;

  } catch (error) {
    console.error('GET /api/debug/accounts error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error,
      code: "INTERNAL_ERROR"
    }, { status: 500 });
  }
}