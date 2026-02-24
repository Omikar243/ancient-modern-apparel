// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';

export async function POST(request: NextRequest) {
  try {
    // Clear existing data first
    await db.run('DELETE FROM garments');
    
    // Insert garments one by one using simple SQL (only columns that exist)
    const garment1 = await db.run(`
      INSERT INTO garments (name, type, description, image_url, price, category, created_at, updated_at)
      VALUES ('Fusion Anarkali Dress', 'dress', 'Elegant fusion anarkali dress with contemporary cuts', '/api/placeholder/300/400?text=Anarkali', 299.99, 'women', '${new Date().toISOString()}', '${new Date().toISOString()}')
    `);
    
    const garment2 = await db.run(`
      INSERT INTO garments (name, type, description, image_url, price, category, created_at, updated_at)
      VALUES ('Modern Kurta Set', 'set', 'Contemporary kurta set with slim-fit silhouette', '/api/placeholder/300/400?text=Kurta', 189.99, 'men', '${new Date().toISOString()}', '${new Date().toISOString()}')
    `);
    
    const garment3 = await db.run(`
      INSERT INTO garments (name, type, description, image_url, price, category, created_at, updated_at)
      VALUES ('Indo Western Gown', 'gown', 'Flowing indo-western gown with intricate beadwork', '/api/placeholder/300/400?text=Gown', 449.99, 'women', '${new Date().toISOString()}', '${new Date().toISOString()}')
    `);

    const garment4 = await db.run(`
      INSERT INTO garments (name, type, description, image_url, price, category, created_at, updated_at)
      VALUES ('Contemporary Dhoti Pants', 'pants', 'Modern interpretation of traditional dhoti', '/api/placeholder/300/400?text=Dhoti', 129.99, 'unisex', '${new Date().toISOString()}', '${new Date().toISOString()}')
    `);

    const garment5 = await db.run(`
      INSERT INTO garments (name, type, description, image_url, price, category, created_at, updated_at)
      VALUES ('Nehru Blazer Jacket', 'jacket', 'Classic Nehru collar blazer with contemporary tailoring', '/api/placeholder/300/400?text=Nehru', 349.99, 'men', '${new Date().toISOString()}', '${new Date().toISOString()}')
    `);

    // Skip materials for now and focus on getting garments working
    
    // Verify insertions
    const garmentsCount = await db.get('SELECT COUNT(*) as count FROM garments');
    
    // Get sample data to verify
    const sampleGarments = await db.all('SELECT id, name, category, price FROM garments LIMIT 3');

    return NextResponse.json({ 
      success: true,
      message: 'Garments inserted successfully using direct SQL',
      summary: {
        garmentsInserted: garmentsCount.count,
        totalRecords: garmentsCount.count
      },
      sampleData: {
        garments: sampleGarments
      },
      operations: [
        'Cleared existing garments data',
        'Inserted 5 Indian fusion garments using direct SQL',
        'Verified insertions with count and sample queries'
      ]
    }, { status: 201 });

  } catch (error) {
    console.error('Minimal insert error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to insert garments: ' + error,
      details: error.message
    }, { status: 500 });
  }
}