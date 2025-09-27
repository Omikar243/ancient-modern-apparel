import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { garments } from '@/db/schema';
import { eq, like, or, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // No authentication required for GET requests - catalog data is public
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: 'Valid ID is required',
          code: 'INVALID_ID' 
        }, { status: 400 });
      }

      const garment = await db.select()
        .from(garments)
        .where(eq(garments.id, parseInt(id)))
        .limit(1);

      if (garment.length === 0) {
        return NextResponse.json({ error: 'Garment not found' }, { status: 404 });
      }

      // Return garment with existing structure - no measurements parsing needed for now
      const responseGarment = {
        id: garment[0].id,
        name: garment[0].name,
        type: garment[0].type,
        description: garment[0].description,
        imageUrl: garment[0].imageUrl,
        price: garment[0].price,
        category: garment[0].category,
        measurements: null, // Field doesn't exist in current schema
        qualityRating: null, // Field doesn't exist in current schema  
        history: null, // Field doesn't exist in current schema
        createdAt: garment[0].createdAt,
        updatedAt: garment[0].updatedAt
      };

      return NextResponse.json(responseGarment);
    }

    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const sortField = searchParams.get('sort') || 'createdAt';
    const sortOrder = searchParams.get('order') || 'desc';

    let query = db.select().from(garments);

    if (search) {
      const searchCondition = or(
        like(garments.name, `%${search}%`),
        like(garments.type, `%${search}%`),
        like(garments.description, `%${search}%`)
      );
      query = query.where(searchCondition);
    }

    if (sortOrder === 'desc') {
      query = query.orderBy(desc(garments[sortField as keyof typeof garments] || garments.createdAt));
    } else {
      query = query.orderBy(garments[sortField as keyof typeof garments] || garments.createdAt);
    }

    const results = await query.limit(limit).offset(offset);

    // Parse results with safe structure mapping
    const parsedResults = results.map(garment => ({
      id: garment.id,
      name: garment.name,
      type: garment.type,
      description: garment.description,
      imageUrl: garment.imageUrl,
      price: garment.price,
      category: garment.category,
      measurements: null, // Field doesn't exist in current schema
      qualityRating: null, // Field doesn't exist in current schema
      history: null, // Field doesn't exist in current schema
      createdAt: garment.createdAt,
      updatedAt: garment.updatedAt
    }));

    return NextResponse.json(parsedResults);
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
    const { name, type, description, imageUrl, price, category, measurements, qualityRating, history } = requestBody;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json({ 
        error: 'Name is required and must be a non-empty string',
        code: 'MISSING_REQUIRED_FIELD' 
      }, { status: 400 });
    }

    if (!type || typeof type !== 'string' || type.trim() === '') {
      return NextResponse.json({ 
        error: 'Type is required and must be a non-empty string',
        code: 'MISSING_REQUIRED_FIELD' 
      }, { status: 400 });
    }

    if (price === undefined || price === null || typeof price !== 'number' || price <= 0) {
      return NextResponse.json({ 
        error: 'Price is required and must be a positive number',
        code: 'MISSING_REQUIRED_FIELD' 
      }, { status: 400 });
    }

    if (!category || typeof category !== 'string' || category.trim() === '') {
      return NextResponse.json({ 
        error: 'Category is required and must be a non-empty string',
        code: 'MISSING_REQUIRED_FIELD' 
      }, { status: 400 });
    }

    // Validate measurements if provided
    if (measurements !== undefined && measurements !== null) {
      if (typeof measurements !== 'object' || Array.isArray(measurements)) {
        return NextResponse.json({ 
          error: 'Measurements must be an object',
          code: 'INVALID_MEASUREMENTS' 
        }, { status: 400 });
      }
    }

    // Validate quality rating if provided
    if (qualityRating !== undefined && qualityRating !== null) {
      if (!Number.isInteger(qualityRating) || qualityRating < 1 || qualityRating > 10) {
        return NextResponse.json({ 
          error: 'Quality rating must be an integer between 1 and 10',
          code: 'INVALID_QUALITY_RATING' 
        }, { status: 400 });
      }
    }

    const insertData = {
      name: name.trim(),
      type: type.trim(),
      description: description ? description.trim() : null,
      imageUrl: imageUrl ? imageUrl.trim() : null,
      price,
      category: category.trim(),
      measurements: measurements || null,
      qualityRating: qualityRating || null,
      history: history ? history.trim() : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newGarment = await db.insert(garments)
      .values(insertData)
      .returning();

    // Parse JSON fields for response
    const responseGarment = {
      ...newGarment[0],
      measurements: typeof newGarment[0].measurements === 'string' 
        ? JSON.parse(newGarment[0].measurements) 
        : newGarment[0].measurements
    };

    return NextResponse.json(responseGarment, { status: 201 });
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
        error: 'Valid ID is required',
        code: 'INVALID_ID' 
      }, { status: 400 });
    }

    const requestBody = await request.json();
    const { name, type, description, imageUrl, price, category, measurements, qualityRating, history } = requestBody;

    const existingGarment = await db.select()
      .from(garments)
      .where(eq(garments.id, parseInt(id)))
      .limit(1);

    if (existingGarment.length === 0) {
      return NextResponse.json({ error: 'Garment not found' }, { status: 404 });
    }

    const updates: any = {
      updatedAt: new Date().toISOString()
    };

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim() === '') {
        return NextResponse.json({ 
          error: 'Name must be a non-empty string',
          code: 'INVALID_FIELD' 
        }, { status: 400 });
      }
      updates.name = name.trim();
    }

    if (type !== undefined) {
      if (typeof type !== 'string' || type.trim() === '') {
        return NextResponse.json({ 
          error: 'Type must be a non-empty string',
          code: 'INVALID_FIELD' 
        }, { status: 400 });
      }
      updates.type = type.trim();
    }

    if (price !== undefined) {
      if (typeof price !== 'number' || price <= 0) {
        return NextResponse.json({ 
          error: 'Price must be a positive number',
          code: 'INVALID_FIELD' 
        }, { status: 400 });
      }
      updates.price = price;
    }

    if (category !== undefined) {
      if (typeof category !== 'string' || category.trim() === '') {
        return NextResponse.json({ 
          error: 'Category must be a non-empty string',
          code: 'INVALID_FIELD' 
        }, { status: 400 });
      }
      updates.category = category.trim();
    }

    if (measurements !== undefined) {
      if (measurements !== null && (typeof measurements !== 'object' || Array.isArray(measurements))) {
        return NextResponse.json({ 
          error: 'Measurements must be an object',
          code: 'INVALID_MEASUREMENTS' 
        }, { status: 400 });
      }
      updates.measurements = measurements;
    }

    if (qualityRating !== undefined) {
      if (qualityRating !== null && (!Number.isInteger(qualityRating) || qualityRating < 1 || qualityRating > 10)) {
        return NextResponse.json({ 
          error: 'Quality rating must be an integer between 1 and 10',
          code: 'INVALID_QUALITY_RATING' 
        }, { status: 400 });
      }
      updates.qualityRating = qualityRating;
    }

    if (description !== undefined) {
      updates.description = description ? description.trim() : null;
    }

    if (imageUrl !== undefined) {
      updates.imageUrl = imageUrl ? imageUrl.trim() : null;
    }

    if (history !== undefined) {
      updates.history = history ? history.trim() : null;
    }

    const updated = await db.update(garments)
      .set(updates)
      .where(eq(garments.id, parseInt(id)))
      .returning();

    // Parse JSON fields for response
    const responseGarment = {
      ...updated[0],
      measurements: typeof updated[0].measurements === 'string' 
        ? JSON.parse(updated[0].measurements) 
        : updated[0].measurements
    };

    return NextResponse.json(responseGarment);
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
        error: 'Valid ID is required',
        code: 'INVALID_ID' 
      }, { status: 400 });
    }

    const existingGarment = await db.select()
      .from(garments)
      .where(eq(garments.id, parseInt(id)))
      .limit(1);

    if (existingGarment.length === 0) {
      return NextResponse.json({ error: 'Garment not found' }, { status: 404 });
    }

    const deleted = await db.delete(garments)
      .where(eq(garments.id, parseInt(id)))
      .returning();

    // Parse JSON fields for response
    const responseGarment = {
      ...deleted[0],
      measurements: typeof deleted[0].measurements === 'string' 
        ? JSON.parse(deleted[0].measurements) 
        : deleted[0].measurements
    };

    return NextResponse.json({
      message: 'Garment deleted successfully',
      deletedGarment: responseGarment
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}