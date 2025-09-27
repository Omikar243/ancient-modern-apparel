import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { garments, materials } from '@/db/schema';

export async function POST(request: NextRequest) {
  try {
    // Clear existing data first
    await db.delete(garments);
    await db.delete(materials);
    
    // Insert one garment at a time to identify any field issues
    const garment1 = await db.insert(garments).values({
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
    }).returning();

    const garment2 = await db.insert(garments).values({
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
    }).returning();

    const garment3 = await db.insert(garments).values({
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
    }).returning();

    // Insert one material at a time
    const material1 = await db.insert(materials).values({
      name: 'Banarasi Silk',
      origin: 'Varanasi, Uttar Pradesh',
      gsm: 180,
      stretch: 0.02,
      drape: 0.85,
      colors: JSON.stringify(['#8B0000', '#FFD700', '#4B0082', '#228B22']),
      textureUrl: '/textures/banarasi-silk.jpg',
      careInstructions: 'Dry clean only. Store in cool, dry place.',
      artisanOrigin: 'Master weavers of Varanasi with traditional techniques.',
      createdAt: new Date('2024-01-10').toISOString(),
      updatedAt: new Date('2024-01-10').toISOString(),
    }).returning();

    const material2 = await db.insert(materials).values({
      name: 'Chanderi Cotton',
      origin: 'Chanderi, Madhya Pradesh',
      gsm: 120,
      stretch: 0.15,
      drape: 0.75,
      colors: JSON.stringify(['#F5DEB3', '#E6E6FA', '#F0F8FF', '#FFF8DC']),
      textureUrl: '/textures/chanderi-cotton.jpg',
      careInstructions: 'Hand wash in cold water with mild detergent.',
      artisanOrigin: 'Traditional handloom weavers of Chanderi.',
      createdAt: new Date('2024-01-12').toISOString(),
      updatedAt: new Date('2024-01-12').toISOString(),
    }).returning();

    return NextResponse.json({
      success: true,
      message: 'Sample data inserted successfully',
      results: {
        garmentsInserted: 3,
        materialsInserted: 2,
        garments: [garment1[0], garment2[0], garment3[0]],
        materials: [material1[0], material2[0]]
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Direct insert error:', error);
    return NextResponse.json({ 
      error: 'Failed to insert data: ' + error,
      details: error.toString()
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get counts and sample data
    const garmentsData = await db.select().from(garments);
    const materialsData = await db.select().from(materials);

    return NextResponse.json({
      garments: {
        count: garmentsData.length,
        sample: garmentsData.slice(0, 3)
      },
      materials: {
        count: materialsData.length,
        sample: materialsData.slice(0, 2)
      }
    });

  } catch (error) {
    console.error('Direct get error:', error);
    return NextResponse.json({ 
      error: 'Failed to get data: ' + error 
    }, { status: 500 });
  }
}