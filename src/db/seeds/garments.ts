import { db } from '@/db';
import { garments } from '@/db/schema';

async function main() {
    // Clear existing data
    await db.delete(garments);

    const sampleGarments = [
        {
            name: 'Classic White Cotton Shirt',
            type: 'shirt',
            description: 'Timeless white cotton shirt with mother-of-pearl buttons',
            imageUrl: 'https://example.com/images/white-cotton-shirt.jpg',
            price: 89.99,
            category: 'men',
            measurements: { chest: 42, waist: 36, length: 30, sleeve: 34 },
            qualityRating: 9,
            history: 'Handcrafted by artisans in Portugal using traditional techniques passed down through generations.',
            createdAt: new Date('2024-01-15').toISOString(),
            updatedAt: new Date('2024-01-15').toISOString(),
        },
        {
            name: 'Elegant Silk Evening Dress',
            type: 'dress',
            description: 'Luxurious silk dress perfect for special occasions',
            imageUrl: 'https://example.com/images/silk-evening-dress.jpg',
            price: 245.00,
            category: 'women',
            measurements: { bust: 36, waist: 28, hips: 38, length: 42 },
            qualityRating: 10,
            history: 'Created using premium mulberry silk sourced from sustainable farms in rural Italy.',
            createdAt: new Date('2024-01-20').toISOString(),
            updatedAt: new Date('2024-01-20').toISOString(),
        },
        {
            name: 'Comfortable Denim Jeans',
            type: 'pants',
            description: 'Premium stretch denim with perfect fit and comfort',
            imageUrl: 'https://example.com/images/denim-jeans.jpg',
            price: 125.50,
            category: 'women',
            measurements: { waist: 30, hips: 40, inseam: 32, rise: 9 },
            qualityRating: 8,
            history: 'Made from organic cotton denim in a family-owned mill in North Carolina.',
            createdAt: new Date('2024-02-01').toISOString(),
            updatedAt: new Date('2024-02-01').toISOString(),
        },
        {
            name: 'Cozy Wool Sweater',
            type: 'sweater',
            description: 'Soft merino wool sweater for chilly days',
            imageUrl: 'https://example.com/images/wool-sweater.jpg',
            price: 159.99,
            category: 'men',
            measurements: { chest: 44, waist: 42, length: 26, sleeve: 25 },
            qualityRating: 9,
            history: 'Knitted from ethically sourced merino wool by skilled craftspeople in Scotland.',
            createdAt: new Date('2024-02-05').toISOString(),
            updatedAt: new Date('2024-02-05').toISOString(),
        },
        {
            name: 'Playful Rainbow T-Shirt',
            type: 'shirt',
            description: 'Fun and colorful t-shirt made from organic cotton',
            imageUrl: 'https://example.com/images/rainbow-tshirt.jpg',
            price: 32.99,
            category: 'kids',
            measurements: { chest: 26, waist: 24, length: 18, sleeve: 12 },
            qualityRating: 8,
            history: 'Screen printed with non-toxic dyes on certified organic cotton fabric.',
            createdAt: new Date('2024-02-10').toISOString(),
            updatedAt: new Date('2024-02-10').toISOString(),
        },
        {
            name: 'Summer Linen Blazer',
            type: 'blazer',
            description: 'Lightweight linen blazer perfect for warm weather',
            imageUrl: 'https://example.com/images/linen-blazer.jpg',
            price: 189.00,
            category: 'women',
            measurements: { bust: 38, waist: 32, length: 24, sleeve: 24 },
            qualityRating: 9,
            history: 'Tailored from Belgian linen using traditional European tailoring methods.',
            createdAt: new Date('2024-02-15').toISOString(),
            updatedAt: new Date('2024-02-15').toISOString(),
        }
    ];

    await db.insert(garments).values(sampleGarments);
    
    console.log('✅ Garments seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});