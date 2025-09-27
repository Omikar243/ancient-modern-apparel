import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { designs, materials } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get designs for authenticated user only
    const results = await db.select()
      .from(designs)
      .where(eq(designs.userId, session.user.id))
      .orderBy(desc(designs.createdAt))
      .limit(limit)
      .offset(offset);

    // Parse JSON fields for response
    const parsedResults = results.map(design => ({
      ...design,
      colors: typeof design.colors === 'string' ? JSON.parse(design.colors) : design.colors
    }));

    return NextResponse.json(parsedResults);
  } catch (error) {
    console.error('GET designs error:', error);
    return NextResponse.json({ error: 'Internal server error: ' + error }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { templateId, materialId, customDesignUrl, colors, status, orderId } = body;

    // Validate required fields
    if (!templateId || typeof templateId !== 'string' || templateId.trim() === '') {
      return NextResponse.json({ 
        error: 'templateId is required and must be a non-empty string',
        code: 'MISSING_TEMPLATE_ID'
      }, { status: 400 });
    }

    if (materialId === undefined || materialId === null || !Number.isInteger(materialId) || materialId <= 0) {
      return NextResponse.json({ 
        error: 'materialId is required and must be a positive integer',
        code: 'INVALID_MATERIAL_ID'
      }, { status: 400 });
    }

    if (!colors || typeof colors !== 'object' || Array.isArray(colors)) {
      return NextResponse.json({ 
        error: 'colors is required and must be an object',
        code: 'INVALID_COLORS'
      }, { status: 400 });
    }

    // Validate material exists
    const materialExists = await db.select({ id: materials.id })
      .from(materials)
      .where(eq(materials.id, materialId))
      .limit(1);

    if (materialExists.length === 0) {
      return NextResponse.json({ 
        error: 'Material not found',
        code: 'MATERIAL_NOT_FOUND'
      }, { status: 404 });
    }

    // Validate optional fields
    if (customDesignUrl && (typeof customDesignUrl !== 'string' || customDesignUrl.trim() === '')) {
      return NextResponse.json({ 
        error: 'customDesignUrl must be a non-empty string if provided',
        code: 'INVALID_CUSTOM_DESIGN_URL'
      }, { status: 400 });
    }

    if (status && !['draft', 'ordered'].includes(status)) {
      return NextResponse.json({ 
        error: 'status must be either "draft" or "ordered"',
        code: 'INVALID_STATUS'
      }, { status: 400 });
    }

    if (orderId !== undefined && orderId !== null && (!Number.isInteger(orderId) || orderId <= 0)) {
      return NextResponse.json({ 
        error: 'orderId must be a positive integer if provided',
        code: 'INVALID_ORDER_ID'
      }, { status: 400 });
    }

    // Prepare insert data
    const now = new Date().toISOString();
    const insertData = {
      userId: session.user.id,
      templateId: templateId.trim(),
      materialId,
      customDesignUrl: customDesignUrl?.trim() || null,
      colors,
      status: status || 'draft',
      orderId: orderId || null,
      createdAt: now,
      updatedAt: now
    };

    const newDesign = await db.insert(designs)
      .values(insertData)
      .returning();

    // Parse JSON fields for response
    const responseDesign = {
      ...newDesign[0],
      colors: typeof newDesign[0].colors === 'string' ? JSON.parse(newDesign[0].colors) : newDesign[0].colors
    };

    return NextResponse.json(responseDesign, { status: 201 });
  } catch (error) {
    console.error('POST designs error:', error);
    return NextResponse.json({ error: 'Internal server error: ' + error }, { status: 500 });
  }
}