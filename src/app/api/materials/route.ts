import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { materials } from '@/db/schema';
import { eq, like, and, or, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const material = await db.select()
        .from(materials)
        .where(eq(materials.id, parseInt(id)))
        .limit(1);

      if (material.length === 0) {
        return NextResponse.json({ error: 'Material not found' }, { status: 404 });
      }

      return NextResponse.json(material[0]);
    }

    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');

    let query = db.select().from(materials);

    if (search) {
      const searchCondition = or(
        like(materials.name, `%${search}%`),
        like(materials.origin, `%${search}%`),
        like(materials.description, `%${search}%`),
        like(materials.textureType, `%${search}%`)
      );
      query = query.where(searchCondition);
    }

    const results = await query
      .orderBy(desc(materials.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results);
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const requestBody = await request.json();
    const { name, origin, description, textureType, imageUrl, authenticityRating } = requestBody;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json({ 
        error: "Name is required and must be a non-empty string",
        code: "MISSING_NAME" 
      }, { status: 400 });
    }

    if (!origin || typeof origin !== 'string' || origin.trim() === '') {
      return NextResponse.json({ 
        error: "Origin is required and must be a non-empty string",
        code: "MISSING_ORIGIN" 
      }, { status: 400 });
    }

    if (!textureType || typeof textureType !== 'string' || textureType.trim() === '') {
      return NextResponse.json({ 
        error: "Texture type is required and must be a non-empty string",
        code: "MISSING_TEXTURE_TYPE" 
      }, { status: 400 });
    }

    if (authenticityRating === undefined || authenticityRating === null) {
      return NextResponse.json({ 
        error: "Authenticity rating is required",
        code: "MISSING_AUTHENTICITY_RATING" 
      }, { status: 400 });
    }

    if (!Number.isInteger(authenticityRating) || authenticityRating < 1 || authenticityRating > 10) {
      return NextResponse.json({ 
        error: "Authenticity rating must be an integer between 1 and 10 inclusive",
        code: "INVALID_AUTHENTICITY_RATING" 
      }, { status: 400 });
    }

    // Validate optional fields
    if (description !== undefined && typeof description !== 'string') {
      return NextResponse.json({ 
        error: "Description must be a string",
        code: "INVALID_DESCRIPTION" 
      }, { status: 400 });
    }

    if (imageUrl !== undefined && typeof imageUrl !== 'string') {
      return NextResponse.json({ 
        error: "Image URL must be a string",
        code: "INVALID_IMAGE_URL" 
      }, { status: 400 });
    }

    const insertData = {
      name: name.trim(),
      origin: origin.trim(),
      description: description?.trim() || null,
      textureType: textureType.trim(),
      imageUrl: imageUrl?.trim() || null,
      authenticityRating,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newMaterial = await db.insert(materials)
      .values(insertData)
      .returning();

    return NextResponse.json(newMaterial[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const requestBody = await request.json();
    const { name, origin, description, textureType, imageUrl, authenticityRating } = requestBody;

    // Check if material exists
    const existingMaterial = await db.select()
      .from(materials)
      .where(eq(materials.id, parseInt(id)))
      .limit(1);

    if (existingMaterial.length === 0) {
      return NextResponse.json({ error: 'Material not found' }, { status: 404 });
    }

    const updates: any = {
      updatedAt: new Date().toISOString()
    };

    // Validate and add fields to update
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim() === '') {
        return NextResponse.json({ 
          error: "Name must be a non-empty string",
          code: "INVALID_NAME" 
        }, { status: 400 });
      }
      updates.name = name.trim();
    }

    if (origin !== undefined) {
      if (typeof origin !== 'string' || origin.trim() === '') {
        return NextResponse.json({ 
          error: "Origin must be a non-empty string",
          code: "INVALID_ORIGIN" 
        }, { status: 400 });
      }
      updates.origin = origin.trim();
    }

    if (textureType !== undefined) {
      if (typeof textureType !== 'string' || textureType.trim() === '') {
        return NextResponse.json({ 
          error: "Texture type must be a non-empty string",
          code: "INVALID_TEXTURE_TYPE" 
        }, { status: 400 });
      }
      updates.textureType = textureType.trim();
    }

    if (authenticityRating !== undefined) {
      if (!Number.isInteger(authenticityRating) || authenticityRating < 1 || authenticityRating > 10) {
        return NextResponse.json({ 
          error: "Authenticity rating must be an integer between 1 and 10 inclusive",
          code: "INVALID_AUTHENTICITY_RATING" 
        }, { status: 400 });
      }
      updates.authenticityRating = authenticityRating;
    }

    if (description !== undefined) {
      if (typeof description !== 'string') {
        return NextResponse.json({ 
          error: "Description must be a string",
          code: "INVALID_DESCRIPTION" 
        }, { status: 400 });
      }
      updates.description = description.trim() || null;
    }

    if (imageUrl !== undefined) {
      if (typeof imageUrl !== 'string') {
        return NextResponse.json({ 
          error: "Image URL must be a string",
          code: "INVALID_IMAGE_URL" 
        }, { status: 400 });
      }
      updates.imageUrl = imageUrl.trim() || null;
    }

    const updated = await db.update(materials)
      .set(updates)
      .where(eq(materials.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if material exists
    const existingMaterial = await db.select()
      .from(materials)
      .where(eq(materials.id, parseInt(id)))
      .limit(1);

    if (existingMaterial.length === 0) {
      return NextResponse.json({ error: 'Material not found' }, { status: 404 });
    }

    const deleted = await db.delete(materials)
      .where(eq(materials.id, parseInt(id)))
      .returning();

    return NextResponse.json({ 
      message: 'Material deleted successfully',
      deletedMaterial: deleted[0]
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}