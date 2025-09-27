import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { garments, materials } from '@/db/schema';

export async function POST(request: NextRequest) {
  try {
    console.log('Starting simple database seeding...');

    // Clear existing data first
    await db.delete(garments);
    await db.delete(materials);
    console.log('Cleared existing data');

    // Sample garments data using only existing columns (no JSON parsing issues)
    const sampleGarments = [
      {
        name: 'Fusion Anarkali Dress',
        type: 'dress',
        description: 'Elegant fusion anarkali dress with contemporary cuts and traditional embroidery. Perfect for special occasions.',
        imageUrl: '/api/placeholder/300/400?text=Fusion%20Anarkali',
        price: 299.99,
        category: 'women',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        name: 'Modern Kurta Set',
        type: 'set',
        description: 'Contemporary kurta set with slim-fit silhouette and minimalist design. Ideal for office and casual wear.',
        imageUrl: '/api/placeholder/300/400?text=Modern%20Kurta',
        price: 189.99,
        category: 'men',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        name: 'Indo Western Gown',
        type: 'gown',
        description: 'Flowing indo-western gown with intricate beadwork and modern silhouette. Elegant and sophisticated.',
        imageUrl: '/api/placeholder/300/400?text=Indo%20Western%20Gown',
        price: 449.99,
        category: 'women',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        name: 'Contemporary Dhoti Pants',
        type: 'pants',
        description: 'Modern interpretation of traditional dhoti with comfortable elastic waistband. Versatile and stylish.',
        imageUrl: '/api/placeholder/300/400?text=Dhoti%20Pants',
        price: 129.99,
        category: 'unisex',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        name: 'Nehru Blazer Jacket',
        type: 'jacket',
        description: 'Classic Nehru collar blazer with contemporary tailoring and subtle detailing. Perfect for formal occasions.',
        imageUrl: '/api/placeholder/300/400?text=Nehru%20Blazer',
        price: 349.99,
        category: 'men',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];

    // Sample materials data using existing columns (check schema first)
    const sampleMaterials = [
      {
        name: 'Handwoven Cotton',
        origin: 'Gujarat, India',
        gsm: 180,
        stretch: 0.05,
        drape: 0.7,
        colors: ['#FFFFFF', '#F5F5DC', '#E6E6FA'],
        textureUrl: '/api/placeholder/200/200?text=Cotton%20Texture',
        careInstructions: 'Machine wash cold, tumble dry low, iron medium heat',
        artisanOrigin: 'Khadi artisans from Ahmedabad with traditional spinning techniques',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        name: 'Silk Brocade',
        origin: 'Varanasi, India',
        gsm: 250,
        stretch: 0.02,
        drape: 0.9,
        colors: ['#FFD700', '#8B0000', '#4B0082'],
        textureUrl: '/api/placeholder/200/200?text=Silk%20Brocade',
        careInstructions: 'Dry clean only, store flat, avoid direct sunlight',
        artisanOrigin: 'Traditional weavers of Varanasi using ancient techniques passed down for generations',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        name: 'Organic Linen',
        origin: 'Kerala, India',
        gsm: 160,
        stretch: 0.03,
        drape: 0.6,
        colors: ['#F0E68C', '#98FB98', '#FFE4B5'],
        textureUrl: '/api/placeholder/200/200?text=Linen%20Texture',
        careInstructions: 'Machine wash gentle cycle, air dry, iron while damp',
        artisanOrigin: 'Sustainable linen producers from Kochi using eco-friendly methods',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];

    // Insert garments using Drizzle ORM
    const insertedGarments = await db.insert(garments)
      .values(sampleGarments)
      .returning();

    console.log(`✅ Inserted ${insertedGarments.length} garments`);

    // Insert materials using Drizzle ORM
    const insertedMaterials = await db.insert(materials)
      .values(sampleMaterials)
      .returning();

    console.log(`✅ Inserted ${insertedMaterials.length} materials`);

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully using Drizzle ORM',
      summary: {
        garmentsInserted: insertedGarments.length,
        materialsInserted: insertedMaterials.length,
        totalRecords: insertedGarments.length + insertedMaterials.length
      },
      sampleData: {
        garments: insertedGarments.map(g => ({ id: g.id, name: g.name, category: g.category, price: g.price })),
        materials: insertedMaterials.map(m => ({ id: m.id, name: m.name, origin: m.origin, gsm: m.gsm }))
      },
      operations: [
        'Cleared existing data using Drizzle ORM',
        'Inserted 5 sample garments with complete data',
        'Inserted 3 sample materials with authentic Indian textile information',
        'All fields properly formatted for existing schema structure'
      ]
    }, { status: 201 });

  } catch (error) {
    console.error('Seeding error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to seed database: ' + error,
      code: 'SEEDING_ERROR',
      details: error.message
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check current database status
    const garmentsCount = await db.select().from(garments);
    const materialsCount = await db.select().from(materials);

    return NextResponse.json({
      status: 'Database status check',
      data: {
        garments: garmentsCount.length,
        materials: materialsCount.length,
        sampleGarments: garmentsCount.slice(0, 3).map(g => ({ 
          id: g.id, 
          name: g.name, 
          category: g.category,
          price: g.price 
        })),
        sampleMaterials: materialsCount.slice(0, 3).map(m => ({ 
          id: m.id, 
          name: m.name, 
          origin: m.origin,
          gsm: m.gsm 
        }))
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Database check error:', error);
    return NextResponse.json({ 
      error: 'Failed to check database status: ' + error,
      code: 'DATABASE_CHECK_ERROR'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Clear existing seed data for fresh seeding
    const deletedGarments = await db.delete(garments).returning();
    const deletedMaterials = await db.delete(materials).returning();

    return NextResponse.json({
      message: 'Database cleared successfully',
      data: {
        deletedGarments: deletedGarments.length,
        deletedMaterials: deletedMaterials.length
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Database clear error:', error);
    return NextResponse.json({ 
      error: 'Failed to clear database: ' + error,
      code: 'DATABASE_CLEAR_ERROR'
    }, { status: 500 });
  }
}