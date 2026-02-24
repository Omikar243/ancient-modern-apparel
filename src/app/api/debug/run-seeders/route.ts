// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { garments, materials } from '@/db/schema';
import { sql } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    // Get counts before operations
    const initialGarmentsCount = await db.select({ count: sql<number>`count(*)` }).from(garments);
    const initialMaterialsCount = await db.select({ count: sql<number>`count(*)` }).from(materials);

    // Clear existing data
    await db.delete(garments);
    await db.delete(materials);

    // Insert garments one by one to avoid batch insert issues
    const garmentsData = [
      {
        name: 'Fusion Anarkali Dress',
        type: 'dress',
        description: 'Elegant fusion anarkali dress with contemporary cuts and traditional embroidery',
        imageUrl: '/api/placeholder/300/400?text=Fusion%20Anarkali%20Dress',
        price: 299.99,
        category: 'women',
        measurements: JSON.stringify({bust: 36, waist: 28, hips: 38, length: 50}),
        qualityRating: 9,
        history: 'The Anarkali dress originated from the Mughal era, named after the legendary courtesan Anarkali.',
        createdAt: new Date('2024-01-10').toISOString(),
        updatedAt: new Date('2024-01-10').toISOString(),
      },
      {
        name: 'Modern Kurta Set',
        type: 'set',
        description: 'Contemporary kurta set with slim-fit silhouette and minimalist design',
        imageUrl: '/api/placeholder/300/400?text=Modern%20Kurta%20Set',
        price: 189.99,
        category: 'men',
        measurements: JSON.stringify({chest: 40, waist: 32, length: 30, sleeve: 24}),
        qualityRating: 8,
        history: 'The kurta has been a cornerstone of South Asian menswear for over 500 years.',
        createdAt: new Date('2024-01-12').toISOString(),
        updatedAt: new Date('2024-01-12').toISOString(),
      },
      {
        name: 'Indo Western Gown',
        type: 'gown',
        description: 'Flowing indo-western gown with intricate beadwork and modern silhouette',
        imageUrl: '/api/placeholder/300/400?text=Indo%20Western%20Gown',
        price: 449.99,
        category: 'women',
        measurements: JSON.stringify({bust: 34, waist: 26, hips: 36, length: 58}),
        qualityRating: 10,
        history: 'Indo-western gowns emerged in the 1960s as a fusion response to globalization.',
        createdAt: new Date('2024-01-15').toISOString(),
        updatedAt: new Date('2024-01-15').toISOString(),
      }
    ];

    // Insert garments individually
    const insertedGarments = [];
    for (const garment of garmentsData) {
      const result = await db.insert(garments).values(garment).returning();
      insertedGarments.push(result[0]);
    }

    // Insert materials with corrected data types for stretch/drape (should be decimal between 0-1)
    const materialsData = [
      {
        name: 'Banarasi Silk',
        origin: 'Varanasi, Uttar Pradesh',
        gsm: 180,
        stretch: 0.02,
        drape: 0.85,
        colors: JSON.stringify(['#8B0000', '#FFD700', '#4B0082', '#228B22', '#FF6347', '#1E90FF']),
        textureUrl: '/textures/banarasi-silk.jpg',
        careInstructions: 'Dry clean only. Store in cool, dry place away from direct sunlight.',
        artisanOrigin: 'Master weavers of Varanasi using traditional pit looms with 2000+ years of heritage.',
        createdAt: new Date('2024-01-10').toISOString(),
        updatedAt: new Date('2024-01-10').toISOString(),
      },
      {
        name: 'Chanderi Cotton',
        origin: 'Chanderi, Madhya Pradesh',
        gsm: 120,
        stretch: 0.15,
        drape: 0.75,
        colors: JSON.stringify(['#F5DEB3', '#E6E6FA', '#F0F8FF', '#FFF8DC', '#F5F5DC', '#FFEFD5']),
        textureUrl: '/textures/chanderi-cotton.jpg',
        careInstructions: 'Hand wash in cold water with mild detergent. Air dry in shade.',
        artisanOrigin: 'Traditional handloom weavers of Chanderi with 700 years of expertise.',
        createdAt: new Date('2024-01-12').toISOString(),
        updatedAt: new Date('2024-01-12').toISOString(),
      },
      {
        name: 'Kanjeevaram Silk',
        origin: 'Kanchipuram, Tamil Nadu',
        gsm: 200,
        stretch: 0.01,
        drape: 0.90,
        colors: JSON.stringify(['#DC143C', '#8B008B', '#FF8C00', '#006400', '#4169E1', '#B8860B']),
        textureUrl: '/textures/kanjeevaram-silk.jpg',
        careInstructions: 'Professional dry cleaning recommended. Store flat with tissue paper.',
        artisanOrigin: 'UNESCO recognized master craftsmen of Kanchipuram using pure mulberry silk.',
        createdAt: new Date('2024-01-15').toISOString(),
        updatedAt: new Date('2024-01-15').toISOString(),
      }
    ];

    // Insert materials individually
    const insertedMaterials = [];
    for (const material of materialsData) {
      const result = await db.insert(materials).values(material).returning();
      insertedMaterials.push(result[0]);
    }

    // Get counts after operations
    const finalGarmentsCount = await db.select({ count: sql<number>`count(*)` }).from(garments);
    const finalMaterialsCount = await db.select({ count: sql<number>`count(*)` }).from(materials);

    return NextResponse.json({
      success: true,
      message: 'Debug seeding completed successfully',
      results: {
        counts: {
          garments: {
            before: initialGarmentsCount[0].count,
            after: finalGarmentsCount[0].count,
            inserted: insertedGarments.length
          },
          materials: {
            before: initialMaterialsCount[0].count,
            after: finalMaterialsCount[0].count,
            inserted: insertedMaterials.length
          }
        },
        insertedData: {
          garments: insertedGarments.map(g => ({
            id: g.id,
            name: g.name,
            type: g.type,
            category: g.category,
            price: g.price
          })),
          materials: insertedMaterials.map(m => ({
            id: m.id,
            name: m.name,
            origin: m.origin,
            gsm: m.gsm
          }))
        }
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Debug seeding error:', error);
    return NextResponse.json({ 
      error: 'Failed to execute debug seeding: ' + error,
      code: 'DEBUG_SEEDING_FAILED'
    }, { status: 500 });
  }
}