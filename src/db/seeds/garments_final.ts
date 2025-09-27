import { db } from '@/db';
import { garments } from '@/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
    // Delete all existing garments data
    await db.delete(garments);
    console.log('🗑️ Cleared existing garments data');

    const sampleGarments = [
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

    // Insert all garments
    await db.insert(garments).values(sampleGarments);

    // Verification: Select all inserted records
    const insertedGarments = await db.select().from(garments);
    
    console.log('📦 Inserted Garments:');
    insertedGarments.forEach((garment, index) => {
        console.log(`${index + 1}. ID: ${garment.id} - ${garment.name} ($${garment.price})`);
    });

    // Count verification
    const totalCount = insertedGarments.length;
    console.log(`\n📊 Total garments inserted: ${totalCount}`);
    
    if (totalCount === 10) {
        console.log('✅ Garments seeder completed successfully - All 10 Indian fusion garments inserted with exact specifications');
    } else {
        console.error(`❌ Expected 10 garments but inserted ${totalCount}`);
    }
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});