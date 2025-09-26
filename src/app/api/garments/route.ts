import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { garments } from '@/db/schema';
import { eq, like, or, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
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

      return NextResponse.json(garment[0]);
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
    const { name, type, description, imageUrl, price, category } = requestBody;

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

    const insertData = {
      name: name.trim(),
      type: type.trim(),
      description: description ? description.trim() : null,
      imageUrl: imageUrl ? imageUrl.trim() : null,
      price,
      category: category.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newGarment = await db.insert(garments)
      .values(insertData)
      .returning();

    return NextResponse.json(newGarment[0], { status: 201 });
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
    const { name, type, description, imageUrl, price, category } = requestBody;

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

    if (description !== undefined) {
      updates.description = description ? description.trim() : null;
    }

    if (imageUrl !== undefined) {
      updates.imageUrl = imageUrl ? imageUrl.trim() : null;
    }

    const updated = await db.update(garments)
      .set(updates)
      .where(eq(garments.id, parseInt(id)))
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

    return NextResponse.json({
      message: 'Garment deleted successfully',
      deletedGarment: deleted[0]
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}