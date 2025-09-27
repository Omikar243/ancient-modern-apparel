import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { materials } from '@/db/schema';
import { eq, like, or, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
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

      // Safe JSON parsing for response
      let parsedColors;
      try {
        parsedColors = typeof material[0].colors === 'string' 
          ? JSON.parse(material[0].colors) 
          : material[0].colors;
      } catch (error) {
        console.error('JSON parse error for colors:', error);
        parsedColors = [];
      }

      const parsedMaterial = {
        ...material[0],
        colors: parsedColors
      };

      return NextResponse.json(parsedMaterial);
    }

    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');

    let query = db.select().from(materials);

    if (search) {
      const searchCondition = or(
        like(materials.name, `%${search}%`),
        like(materials.origin, `%${search}%`),
        like(materials.artisanOrigin, `%${search}%`)
      );
      query = query.where(searchCondition);
    }

    const results = await query
      .orderBy(desc(materials.createdAt))
      .limit(limit)
      .offset(offset);

    // Safe JSON parsing for all results
    const parsedResults = results.map(material => {
      let parsedColors;
      try {
        parsedColors = typeof material.colors === 'string' 
          ? JSON.parse(material.colors) 
          : material.colors;
      } catch (error) {
        console.error('JSON parse error for material', material.id, ':', error);
        parsedColors = [];
      }

      return {
        ...material,
        colors: parsedColors
      };
    });

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
    const { name, origin, gsm, stretch, drape, colors, textureUrl, careInstructions, artisanOrigin } = requestBody;

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

    if (gsm === undefined || gsm === null || !Number.isInteger(gsm) || gsm <= 0) {
      return NextResponse.json({ 
        error: "GSM is required and must be a positive integer",
        code: "INVALID_GSM" 
      }, { status: 400 });
    }

    if (stretch === undefined || stretch === null || typeof stretch !== 'number' || stretch < 0 || stretch > 1) {
      return NextResponse.json({ 
        error: "Stretch is required and must be a number between 0 and 1",
        code: "INVALID_STRETCH" 
      }, { status: 400 });
    }

    if (drape === undefined || drape === null || typeof drape !== 'number' || drape < 0 || drape > 1) {
      return NextResponse.json({ 
        error: "Drape is required and must be a number between 0 and 1",
        code: "INVALID_DRAPE" 
      }, { status: 400 });
    }

    if (!colors || !Array.isArray(colors) || colors.length === 0) {
      return NextResponse.json({ 
        error: "Colors is required and must be a non-empty array",
        code: "MISSING_COLORS" 
      }, { status: 400 });
    }

    // Validate hex colors
    const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
    for (const color of colors) {
      if (typeof color !== 'string' || !hexColorRegex.test(color)) {
        return NextResponse.json({ 
          error: "All colors must be valid hex color strings (e.g., #FF0000)",
          code: "INVALID_COLOR_FORMAT" 
        }, { status: 400 });
      }
    }

    if (!textureUrl || typeof textureUrl !== 'string' || textureUrl.trim() === '') {
      return NextResponse.json({ 
        error: "Texture URL is required and must be a non-empty string",
        code: "MISSING_TEXTURE_URL" 
      }, { status: 400 });
    }

    if (!careInstructions || typeof careInstructions !== 'string' || careInstructions.trim() === '') {
      return NextResponse.json({ 
        error: "Care instructions are required and must be a non-empty string",
        code: "MISSING_CARE_INSTRUCTIONS" 
      }, { status: 400 });
    }

    if (!artisanOrigin || typeof artisanOrigin !== 'string' || artisanOrigin.trim() === '') {
      return NextResponse.json({ 
        error: "Artisan origin is required and must be a non-empty string",
        code: "MISSING_ARTISAN_ORIGIN" 
      }, { status: 400 });
    }

    const insertData = {
      name: name.trim(),
      origin: origin.trim(),
      gsm,
      stretch,
      drape,
      colors,
      textureUrl: textureUrl.trim(),
      careInstructions: careInstructions.trim(),
      artisanOrigin: artisanOrigin.trim(),
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
    const { name, origin, gsm, stretch, drape, colors, textureUrl, careInstructions, artisanOrigin } = requestBody;

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

    if (gsm !== undefined) {
      if (!Number.isInteger(gsm) || gsm <= 0) {
        return NextResponse.json({ 
          error: "GSM must be a positive integer",
          code: "INVALID_GSM" 
        }, { status: 400 });
      }
      updates.gsm = gsm;
    }

    if (stretch !== undefined) {
      if (typeof stretch !== 'number' || stretch < 0 || stretch > 1) {
        return NextResponse.json({ 
          error: "Stretch must be a number between 0 and 1",
          code: "INVALID_STRETCH" 
        }, { status: 400 });
      }
      updates.stretch = stretch;
    }

    if (drape !== undefined) {
      if (typeof drape !== 'number' || drape < 0 || drape > 1) {
        return NextResponse.json({ 
          error: "Drape must be a number between 0 and 1",
          code: "INVALID_DRAPE" 
        }, { status: 400 });
      }
      updates.drape = drape;
    }

    if (colors !== undefined) {
      if (!Array.isArray(colors) || colors.length === 0) {
        return NextResponse.json({ 
          error: "Colors must be a non-empty array",
          code: "INVALID_COLORS" 
        }, { status: 400 });
      }
      
      const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
      for (const color of colors) {
        if (typeof color !== 'string' || !hexColorRegex.test(color)) {
          return NextResponse.json({ 
            error: "All colors must be valid hex color strings (e.g., #FF0000)",
            code: "INVALID_COLOR_FORMAT" 
          }, { status: 400 });
        }
      }
      updates.colors = colors;
    }

    if (textureUrl !== undefined) {
      if (typeof textureUrl !== 'string' || textureUrl.trim() === '') {
        return NextResponse.json({ 
          error: "Texture URL must be a non-empty string",
          code: "INVALID_TEXTURE_URL" 
        }, { status: 400 });
      }
      updates.textureUrl = textureUrl.trim();
    }

    if (careInstructions !== undefined) {
      if (typeof careInstructions !== 'string' || careInstructions.trim() === '') {
        return NextResponse.json({ 
          error: "Care instructions must be a non-empty string",
          code: "INVALID_CARE_INSTRUCTIONS" 
        }, { status: 400 });
      }
      updates.careInstructions = careInstructions.trim();
    }

    if (artisanOrigin !== undefined) {
      if (typeof artisanOrigin !== 'string' || artisanOrigin.trim() === '') {
        return NextResponse.json({ 
          error: "Artisan origin must be a non-empty string",
          code: "INVALID_ARTISAN_ORIGIN" 
        }, { status: 400 });
      }
      updates.artisanOrigin = artisanOrigin.trim();
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