import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';

export async function POST(request: NextRequest) {
  try {
    // Clear existing data
    await db.run('DELETE FROM garments');
    await db.run('DELETE FROM materials');

    // Reset auto-increment counters
    await db.run('DELETE FROM sqlite_sequence WHERE name IN ("garments", "materials")');

    // Insert garments data using raw SQL with parameterized queries
    const garmentInserts = [
      {
        name: 'Fusion Anarkali Dress',
        type: 'dress',
        description: 'Elegant fusion anarkali dress with contemporary cuts and traditional embroidery',
        imageUrl: '/api/placeholder/300/400?text=Fusion%20Anarkali%20Dress',
        price: 299.99,
        category: 'women',
        measurements: JSON.stringify({"bust":36,"waist":28,"hips":38,"length":50}),
        qualityRating: 9,
        history: 'The Anarkali dress originated from the Mughal era, named after the legendary courtesan Anarkali. This fusion version combines traditional silhouettes with modern fabric technology and contemporary cuts. The flowing design was favored by Mughal nobility and has evolved through centuries to become a staple in Indo-western fashion. Our version features hand-embroidered motifs inspired by Mughal architecture.',
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
        measurements: JSON.stringify({"chest":40,"waist":32,"length":30,"sleeve":24}),
        qualityRating: 8,
        history: 'The kurta has been a cornerstone of South Asian menswear for over 500 years. Originally loose-fitting garments worn by both men and women, modern kurtas have evolved to include tailored fits and contemporary styling. This set represents the fusion of traditional comfort with modern aesthetics, featuring clean lines and geometric patterns that reflect urban sensibilities while maintaining cultural authenticity.',
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
        measurements: JSON.stringify({"bust":34,"waist":26,"hips":36,"length":58}),
        qualityRating: 10,
        history: 'Indo-western gowns emerged in the 1960s as a fusion response to globalization and cultural exchange. This style combines the elegance of Western evening gowns with traditional Indian embellishments and draping techniques. The design philosophy draws from both Parisian haute couture and Indian craftsmanship, creating garments that celebrate cultural fusion while maintaining sophistication and grace.',
        createdAt: new Date('2024-01-15').toISOString(),
        updatedAt: new Date('2024-01-15').toISOString(),
      },
      {
        name: 'Contemporary Dhoti Pants',
        type: 'pants',
        description: 'Modern interpretation of traditional dhoti with comfortable elastic waistband',
        imageUrl: '/api/placeholder/300/400?text=Contemporary%20Dhoti%20Pants',
        price: 129.99,
        category: 'unisex',
        measurements: JSON.stringify({"waist":30,"hips":34,"length":38,"inseam":28}),
        qualityRating: 7,
        history: 'The dhoti, one of the oldest garments in human history, dates back over 5000 years to the Indus Valley Civilization. Traditionally an unstitched garment, the contemporary dhoti pant adapts this ancient draping style into a modern, practical format. This evolution represents the successful translation of cultural heritage into contemporary fashion, maintaining the comfort and breathability of traditional dhoti while adding modern functionality.',
        createdAt: new Date('2024-01-18').toISOString(),
        updatedAt: new Date('2024-01-18').toISOString(),
      },
      {
        name: 'Nehru Blazer Jacket',
        type: 'jacket',
        description: 'Classic Nehru collar blazer with contemporary tailoring and subtle detailing',
        imageUrl: '/api/placeholder/300/400?text=Nehru%20Blazer%20Jacket',
        price: 349.99,
        category: 'men',
        measurements: JSON.stringify({"chest":42,"waist":36,"length":28,"sleeve":25}),
        qualityRating: 9,
        history: 'The Nehru jacket gained international recognition in the 1960s when Prime Minister Jawaharlal Nehru popularized this style on the global stage. Originally inspired by the achkan and sherwani, this collarless jacket represents the perfect blend of Eastern aesthetics with Western tailoring techniques. The jacket became a symbol of modern India and continues to be a sophisticated choice for formal and semi-formal occasions.',
        createdAt: new Date('2024-01-20').toISOString(),
        updatedAt: new Date('2024-01-20').toISOString(),
      },
      {
        name: 'Designer Cape Lehenga',
        type: 'set',
        description: 'Royal cape lehenga with hand-embroidered details and flowing silhouette',
        imageUrl: '/api/placeholder/300/400?text=Designer%20Cape%20Lehenga',
        price: 599.99,
        category: 'women',
        measurements: JSON.stringify({"bust":32,"waist":24,"hips":38,"length":46}),
        qualityRating: 10,
        history: 'The lehenga traces its origins to the Mughal courts of the 16th century, where it was worn by royal women. The addition of a cape represents a modern interpretation that adds drama and elegance to the traditional three-piece ensemble. This design innovation combines the grandeur of historical royal wear with contemporary fashion sensibilities, creating a garment that commands attention while honoring cultural heritage.',
        createdAt: new Date('2024-01-22').toISOString(),
        updatedAt: new Date('2024-01-22').toISOString(),
      },
      {
        name: 'Royal Bandhgala Suit',
        type: 'suit',
        description: 'Luxurious bandhgala suit with gold thread work and royal styling',
        imageUrl: '/api/placeholder/300/400?text=Royal%20Bandhgala%20Suit',
        price: 899.99,
        category: 'men',
        measurements: JSON.stringify({"chest":44,"waist":38,"length":32,"sleeve":26}),
        qualityRating: 10,
        history: 'The bandhgala suit evolved from the British colonial period when Indian royalty adapted Western formal wear to include traditional Indian elements. Originally popularized by the Maharajas of Rajasthan, this closed-neck jacket style became synonymous with Indian formal wear. The royal bandhgala represents the pinnacle of Indian formal fashion, combining regal aesthetics with impeccable tailoring standards.',
        createdAt: new Date('2024-01-25').toISOString(),
        updatedAt: new Date('2024-01-25').toISOString(),
      },
      {
        name: 'Saree Style Wrap Dress',
        type: 'dress',
        description: 'Innovative wrap dress inspired by saree draping with modern functionality',
        imageUrl: '/api/placeholder/300/400?text=Saree%20Style%20Wrap%20Dress',
        price: 249.99,
        category: 'women',
        measurements: JSON.stringify({"bust":34,"waist":28,"hips":36,"length":44}),
        qualityRating: 8,
        history: 'The saree, with its 5000-year history, is one of the worlds oldest surviving garments. This wrap dress interpretation captures the essence of saree draping while providing the convenience of Western wear. The design philosophy respects the fluid, graceful lines of traditional saree draping while incorporating modern construction techniques that make it accessible to contemporary lifestyles.',
        createdAt: new Date('2024-01-28').toISOString(),
        updatedAt: new Date('2024-01-28').toISOString(),
      },
      {
        name: 'Fusion Churidar Joggers',
        type: 'pants',
        description: 'Comfortable fusion of traditional churidar with modern jogger styling',
        imageUrl: '/api/placeholder/300/400?text=Fusion%20Churidar%20Joggers',
        price: 159.99,
        category: 'unisex',
        measurements: JSON.stringify({"waist":32,"hips":36,"length":40,"ankle":8}),
        qualityRating: 7,
        history: 'Churidar pants, characterized by their close-fitting style that gathers at the ankles, originated in Central Asia and were adopted into Indian fashion during the medieval period. This fusion with jogger styling represents the evolution of traditional garments to meet modern lifestyle needs. The design maintains the distinctive churidar silhouette while incorporating contemporary comfort features like elastic waistbands and breathable fabrics.',
        createdAt: new Date('2024-02-01').toISOString(),
        updatedAt: new Date('2024-02-01').toISOString(),
      },
      {
        name: 'Elegant Sharara Jumpsuit',
        type: 'jumpsuit',
        description: 'Contemporary jumpsuit with traditional sharara-inspired wide leg design',
        imageUrl: '/api/placeholder/300/400?text=Elegant%20Sharara%20Jumpsuit',
        price: 389.99,
        category: 'women',
        measurements: JSON.stringify({"bust":36,"waist":30,"hips":40,"length":56}),
        qualityRating: 9,
        history: 'The sharara originated in the Lucknow courts during the Nawabi era, characterized by its flared, palazzo-style pants that create a skirt-like silhouette. This jumpsuit adaptation transforms the traditional two-piece sharara into a contemporary one-piece garment. The design celebrates the dramatic flair of traditional sharara while offering the convenience and modern appeal of jumpsuit styling, perfect for the contemporary woman who values both heritage and practicality.',
        createdAt: new Date('2024-02-05').toISOString(),
        updatedAt: new Date('2024-02-05').toISOString(),
      }
    ];

    // Insert garments using parameterized queries
    const garmentInsertSQL = `
      INSERT INTO garments (name, type, description, image_url, price, category, measurements, quality_rating, history, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    for (const garment of garmentInserts) {
      await db.run(garmentInsertSQL, [
        garment.name,
        garment.type,
        garment.description,
        garment.imageUrl,
        garment.price,
        garment.category,
        garment.measurements,
        garment.qualityRating,
        garment.history,
        garment.createdAt,
        garment.updatedAt
      ]);
    }

    // Insert materials data using raw SQL with parameterized queries
    const materialInserts = [
      {
        name: 'Banarasi Silk',
        origin: 'Varanasi',
        gsm: 180,
        stretch: 5.0,
        drape: 9.5,
        colors: JSON.stringify(['deep-red', 'gold', 'royal-blue', 'emerald-green', 'ivory']),
        textureUrl: '/api/placeholder/200/200?text=Banarasi%20Silk%20Texture',
        careInstructions: 'Dry clean only. Store in breathable cotton bags. Avoid direct sunlight and moisture. Iron on low heat with protective cloth.',
        artisanOrigin: 'Traditional weavers of Varanasi, descendants of Mughal court artisans who have preserved this craft for over 600 years',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        name: 'Chanderi Cotton',
        origin: 'Madhya Pradesh',
        gsm: 120,
        stretch: 8.0,
        drape: 7.5,
        colors: JSON.stringify(['soft-pink', 'mint-green', 'cream', 'lavender', 'peach']),
        textureUrl: '/api/placeholder/200/200?text=Chanderi%20Cotton%20Texture',
        careInstructions: 'Hand wash in cold water with mild detergent. Air dry in shade. Iron on medium heat while slightly damp.',
        artisanOrigin: 'Chanderi weavers of Madhya Pradesh, known for their delicate weaving techniques passed down through 13 generations',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        name: 'Kanjeevaram Silk',
        origin: 'Tamil Nadu',
        gsm: 200,
        stretch: 3.0,
        drape: 9.8,
        colors: JSON.stringify(['temple-red', 'peacock-blue', 'mustard-yellow', 'bottle-green', 'maroon']),
        textureUrl: '/api/placeholder/200/200?text=Kanjeevaram%20Silk%20Texture',
        careInstructions: 'Professional dry cleaning recommended. Store flat or rolled. Keep away from perfumes and deodorants. Steam iron on silk setting.',
        artisanOrigin: 'Master weavers of Kanchipuram, hereditary craftsmen who have maintained the purity of this art form for over 400 years',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        name: 'Khadi Cotton',
        origin: 'Gujarat',
        gsm: 140,
        stretch: 12.0,
        drape: 6.5,
        colors: JSON.stringify(['natural-white', 'earthy-brown', 'sage-green', 'terracotta', 'indigo-blue']),
        textureUrl: '/api/placeholder/200/200?text=Khadi%20Cotton%20Texture',
        careInstructions: 'Machine wash gentle cycle in cold water. Use natural detergents. Air dry in shade. Iron while damp for best results.',
        artisanOrigin: 'Village artisans across Gujarat, spinning wheels operated by self-help groups continuing Gandhis vision of self-reliance',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        name: 'Paithani Silk',
        origin: 'Maharashtra',
        gsm: 190,
        stretch: 4.0,
        drape: 9.2,
        colors: JSON.stringify(['royal-purple', 'golden-yellow', 'deep-magenta', 'emerald', 'navy-blue']),
        textureUrl: '/api/placeholder/200/200?text=Paithani%20Silk%20Texture',
        careInstructions: 'Dry clean only with specialized silk care. Store in muslin cloth. Avoid folding; roll for storage. Keep away from moisture.',
        artisanOrigin: 'Paithani weavers of Paithan, Maharashtra, custodians of this 2000-year-old weaving tradition that adorned Maratha royalty',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        name: 'Muga Silk',
        origin: 'Assam',
        gsm: 160,
        stretch: 6.0,
        drape: 8.5,
        colors: JSON.stringify(['natural-golden', 'deep-amber', 'honey-bronze', 'antique-gold', 'champagne']),
        textureUrl: '/api/placeholder/200/200?text=Muga%20Silk%20Texture',
        careInstructions: 'Gentle hand wash in lukewarm water with silk-specific detergent. Air dry away from direct sunlight. Steam iron on low heat.',
        artisanOrigin: 'Traditional sericulturists of Assam, the only producers of golden Muga silk worldwide, preserving techniques from the Ahom dynasty',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        name: 'Bandhani Cotton',
        origin: 'Gujarat',
        gsm: 130,
        stretch: 10.0,
        drape: 7.0,
        colors: JSON.stringify(['vibrant-red', 'sunshine-yellow', 'electric-blue', 'hot-pink', 'lime-green']),
        textureUrl: '/api/placeholder/200/200?text=Bandhani%20Cotton%20Texture',
        careInstructions: 'Cold water hand wash separately for first few washes. Use color-safe detergent. Air dry in shade. Iron on medium heat.',
        artisanOrigin: 'Bandhani artists of Kutch and Saurashtra, master tie-dye craftspeople whose intricate dot patterns have been perfected over 5000 years',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        name: 'Tussar Silk',
        origin: 'Jharkhand',
        gsm: 150,
        stretch: 7.0,
        drape: 8.0,
        colors: JSON.stringify(['natural-beige', 'rust-orange', 'forest-green', 'warm-grey', 'dusty-pink']),
        textureUrl: '/api/placeholder/200/200?text=Tussar%20Silk%20Texture',
        careInstructions: 'Dry clean preferred. If hand washing, use cold water and mild silk detergent. Avoid wringing. Iron on low heat with press cloth.',
        artisanOrigin: 'Tribal silk farmers and weavers of Jharkhand and Bihar, sustainable producers of wild silk maintaining eco-friendly traditions for centuries',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];

    // Insert materials using parameterized queries
    const materialInsertSQL = `
      INSERT INTO materials (name, origin, gsm, stretch, drape, colors, texture_url, care_instructions, artisan_origin, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    for (const material of materialInserts) {
      await db.run(materialInsertSQL, [
        material.name,
        material.origin,
        material.gsm,
        material.stretch,
        material.drape,
        material.colors,
        material.textureUrl,
        material.careInstructions,
        material.artisanOrigin,
        material.createdAt,
        material.updatedAt
      ]);
    }

    // Verify insertions with count queries
    const garmentCount = await db.get('SELECT COUNT(*) as count FROM garments');
    const materialCount = await db.get('SELECT COUNT(*) as count FROM materials');

    // Get sample data for verification
    const sampleGarments = await db.all('SELECT id, name, category, price FROM garments LIMIT 3');
    const sampleMaterials = await db.all('SELECT id, name, origin, gsm FROM materials LIMIT 3');

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully with Indian fusion garments and authentic materials',
      summary: {
        garmentsInserted: garmentCount.count,
        materialsInserted: materialCount.count,
        totalRecords: garmentCount.count + materialCount.count
      },
      sampleData: {
        garments: sampleGarments,
        materials: sampleMaterials
      },
      operations: [
        'Cleared existing garments and materials data',
        'Reset auto-increment counters',
        'Inserted 10 Indian fusion garments with detailed measurements and history',
        'Inserted 8 authentic Indian materials with care instructions and artisan origins',
        'Verified data insertion with count queries',
        'All JSON fields properly formatted and inserted'
      ]
    }, { status: 201 });

  } catch (error) {
    console.error('Seeder error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to seed database: ' + error,
      code: 'SEEDER_ERROR'
    }, { status: 500 });
  }
}