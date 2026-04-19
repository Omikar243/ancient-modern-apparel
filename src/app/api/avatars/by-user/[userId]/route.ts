import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userAvatars } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { getLatestLegacyAvatarExtras } from '@/lib/avatar-session-service';

interface PageProps {
  params: {
    userId: string;
  };
}

function parseMaybeJson(value: any): any {
  let current = value;
  while (typeof current === "string") {
    try {
      const parsed = JSON.parse(current);
      if (parsed === current) break;
      current = parsed;
    } catch {
      break;
    }
  }
  return current;
}

export async function GET(request: NextRequest, { params }: { params: Promise<PageProps['params']> }) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED' 
      }, { status: 401 });
    }

    const { userId } = await params;

    // Validate userId parameter
    if (!userId) {
      return NextResponse.json({ 
        error: 'User ID is required',
        code: 'MISSING_USER_ID' 
      }, { status: 400 });
    }

    // Check authorization - users can only access their own avatar data
    if (userId !== session.user.id) {
      return NextResponse.json({ 
        error: 'Access denied. You can only access your own avatar data',
        code: 'ACCESS_DENIED' 
      }, { status: 403 });
    }

    // Get avatar data for the authenticated user
    const avatar = await db.select()
      .from(userAvatars)
      .where(eq(userAvatars.userId, userId))
      .limit(1);

    if (avatar.length === 0) {
      const legacyExtras = await getLatestLegacyAvatarExtras(userId);
      if (!legacyExtras.measurements) {
        return NextResponse.json({ 
          error: 'Avatar not found',
          code: 'AVATAR_NOT_FOUND' 
        }, { status: 404 });
      }

      return NextResponse.json({
        id: legacyExtras.avatarSessionId,
        userId,
        measurements: legacyExtras.measurements,
        photos: [],
        unitPreference: "cm",
        fittedModelUrl: legacyExtras.fittedModelUrl,
        avatarSessionId: legacyExtras.avatarSessionId,
        updatedAt: new Date().toISOString(),
      }, { status: 200 });
    }

    const legacyExtras = await getLatestLegacyAvatarExtras(userId);

    // Parse JSON fields and return avatar data
    const avatarData = avatar[0];
    return NextResponse.json({
      id: avatarData.id,
      userId: avatarData.userId,
      measurements: parseMaybeJson(avatarData.measurements),
      photos: parseMaybeJson(avatarData.photos),
      unitPreference: avatarData.unitPreference,
      fittedModelUrl: legacyExtras.fittedModelUrl,
      avatarSessionId: legacyExtras.avatarSessionId,
      updatedAt: avatarData.updatedAt
    }, { status: 200 });

  } catch (error) {
    console.error('GET avatar error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error,
      code: 'INTERNAL_SERVER_ERROR' 
    }, { status: 500 });
  }
}
