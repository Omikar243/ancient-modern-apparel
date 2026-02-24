import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { avatars } from '@/db/schema';
import { eq } from 'drizzle-orm';
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

export async function GET(
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

    // Fetch avatar by ID
    const avatar = await db.select()
      .from(avatars)
      .where(eq(avatars.id, parseInt(id)))
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

    // Return avatar with parsed JSON fields
    const avatarData = {
      id: avatar[0].id,
      userId: avatar[0].userId,
      measurements: typeof avatar[0].measurements === 'string' 
        ? JSON.parse(avatar[0].measurements) 
        : avatar[0].measurements,
      photos: typeof avatar[0].photos === 'string' 
        ? JSON.parse(avatar[0].photos) 
        : avatar[0].photos,
      createdAt: avatar[0].createdAt,
      updatedAt: avatar[0].updatedAt
    };

    return NextResponse.json(avatarData, { status: 200 });

  } catch (error) {
    console.error('GET avatar error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + error,
        code: 'INTERNAL_SERVER_ERROR' 
      }, 
      { status: 500 }
    );
  }
}

export async function PUT(
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

    // Parse request body
    const body = await request.json();
    const { measurements, photos } = body;

    // Fetch existing avatar
    const existingAvatar = await db.select()
      .from(avatars)
      .where(eq(avatars.id, parseInt(id)))
      .limit(1);

    if (existingAvatar.length === 0) {
      return NextResponse.json(
        { 
          error: 'Avatar not found',
          code: 'AVATAR_NOT_FOUND' 
        }, 
        { status: 404 }
      );
    }

    // Authorization check
    if (existingAvatar[0].userId !== session.user.id) {
      return NextResponse.json(
        { 
          error: 'Access denied - you do not own this avatar',
          code: 'ACCESS_DENIED' 
        }, 
        { status: 403 }
      );
    }

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

    // Update avatar
    const updatedAvatar = await db.update(avatars)
      .set({
        measurements: JSON.stringify(measurements),
        photos: JSON.stringify(photos),
        updatedAt: new Date().toISOString()
      })
      .where(eq(avatars.id, parseInt(id)))
      .returning();

    // Return updated avatar with parsed JSON fields
    const responseAvatar = {
      id: updatedAvatar[0].id,
      userId: updatedAvatar[0].userId,
      measurements: typeof updatedAvatar[0].measurements === 'string' 
        ? JSON.parse(updatedAvatar[0].measurements) 
        : updatedAvatar[0].measurements,
      photos: typeof updatedAvatar[0].photos === 'string' 
        ? JSON.parse(updatedAvatar[0].photos) 
        : updatedAvatar[0].photos,
      createdAt: updatedAvatar[0].createdAt,
      updatedAt: updatedAvatar[0].updatedAt
    };

    return NextResponse.json(responseAvatar, { status: 200 });

  } catch (error) {
    console.error('PUT avatar error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + error,
        code: 'INTERNAL_SERVER_ERROR' 
      }, 
      { status: 500 }
    );
  }
}

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

    // Fetch avatar to verify ownership
    const avatar = await db.select()
      .from(avatars)
      .where(eq(avatars.id, parseInt(id)))
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

    // Authorization check
    if (avatar[0].userId !== session.user.id) {
      return NextResponse.json(
        { 
          error: 'Access denied - you do not own this avatar',
          code: 'ACCESS_DENIED' 
        }, 
        { status: 403 }
      );
    }

    // Delete avatar
    const deletedAvatar = await db.delete(avatars)
      .where(eq(avatars.id, parseInt(id)))
      .returning();

    return NextResponse.json({
      message: 'Avatar deleted successfully',
      deletedAvatar: {
        id: deletedAvatar[0].id,
        userId: deletedAvatar[0].userId,
        createdAt: deletedAvatar[0].createdAt
      }
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