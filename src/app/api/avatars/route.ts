import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { avatars } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';

// Validation helper functions
function validateMeasurements(measurements: any) {
  const errors: string[] = [];

  if (!measurements || typeof measurements !== 'object') {
    return { isValid: false, errors: ['Measurements object is required'] };
  }

  const requiredFields = {
    height: { min: 100, max: 250, unit: 'cm' },
    bust: { min: 60, max: 150, unit: 'cm' },
    waist: { min: 50, max: 120, unit: 'cm' },
    hips: { min: 60, max: 150, unit: 'cm' }
  };

  for (const [field, rules] of Object.entries(requiredFields)) {
    const value = measurements[field];

    if (value === undefined || value === null) {
      errors.push(`${field} is required`);
      continue;
    }

    if (typeof value !== 'number' || isNaN(value)) {
      errors.push(`${field} must be a valid number`);
      continue;
    }

    if (value <= 0) {
      errors.push(`${field} must be a positive number`);
      continue;
    }

    if (value < rules.min || value > rules.max) {
      errors.push(`${field} must be between ${rules.min} and ${rules.max} ${rules.unit}`);
      continue;
    }
  }

  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

function validatePhotos(photos: any) {
  if (!Array.isArray(photos)) {
    return { isValid: false, errors: ['Photos must be an array'] };
  }

  if (photos.length === 0) {
    return { isValid: false, errors: ['At least one photo URL is required'] };
  }

  if (photos.length > 10) {
    return { isValid: false, errors: ['Maximum 10 photos allowed'] };
  }

  const errors: string[] = [];
  for (let i = 0; i < photos.length; i++) {
    const photo = photos[i];
    if (typeof photo !== 'string' || photo.trim() === '') {
      errors.push(`Photo ${i + 1} must be a valid URL string`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get avatars for authenticated user only
    const userAvatars = await db.select()
      .from(avatars)
      .where(eq(avatars.userId, session.user.id))
      .orderBy(desc(avatars.createdAt))
      .limit(limit)
      .offset(offset);

    // Parse JSON fields for response
    const parsedAvatars = userAvatars.map(avatar => ({
      id: avatar.id,
      userId: avatar.userId,
      measurements: typeof avatar.measurements === 'string' ? JSON.parse(avatar.measurements) : avatar.measurements,
      photos: typeof avatar.photos === 'string' ? JSON.parse(avatar.photos) : avatar.photos,
      createdAt: avatar.createdAt,
      updatedAt: avatar.updatedAt
    }));

    return NextResponse.json(parsedAvatars);
  } catch (error) {
    console.error('GET avatars error:', error);
    return NextResponse.json({ error: 'Internal server error: ' + error }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { measurements, photos } = body;

    // Validate measurements
    const measurementValidation = validateMeasurements(measurements);
    if (!measurementValidation.isValid) {
      return NextResponse.json({ 
        error: 'Invalid measurements provided',
        code: 'INVALID_MEASUREMENTS',
        validationErrors: measurementValidation.errors
      }, { status: 400 });
    }

    // Validate photos
    const photoValidation = validatePhotos(photos);
    if (!photoValidation.isValid) {
      return NextResponse.json({ 
        error: 'Invalid photos provided',
        code: 'INVALID_PHOTOS',
        validationErrors: photoValidation.errors
      }, { status: 400 });
    }

    const now = new Date().toISOString();

    const newAvatar = await db.insert(avatars)
      .values({
        userId: session.user.id,
        measurements: JSON.stringify(measurements),
        photos: JSON.stringify(photos),
        createdAt: now,
        updatedAt: now
      })
      .returning();

    // Parse JSON fields for response
    const responseAvatar = {
      id: newAvatar[0].id,
      userId: newAvatar[0].userId,
      measurements: typeof newAvatar[0].measurements === 'string' ? JSON.parse(newAvatar[0].measurements) : newAvatar[0].measurements,
      photos: typeof newAvatar[0].photos === 'string' ? JSON.parse(newAvatar[0].photos) : newAvatar[0].photos,
      createdAt: newAvatar[0].createdAt,
      updatedAt: newAvatar[0].updatedAt
    };

    return NextResponse.json(responseAvatar, { status: 201 });

  } catch (error) {
    console.error('POST avatars error:', error);
    return NextResponse.json({ error: 'Internal server error: ' + error }, { status: 500 });
  }
}