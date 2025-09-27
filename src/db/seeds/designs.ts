import { db } from '@/db';
import { designs } from '@/db/schema';

async function main() {
    const sampleDesigns = [
        {
            userId: 'user_01h4kxt2e8z9y3b1n7m6q5w8r4',
            avatarMeasurements: JSON.stringify({
                bust: 86,
                waist: 68,
                hips: 92,
                height: 165,
                shoulderWidth: 38,
                armLength: 58
            }),
            photoUrls: JSON.stringify([
                'https://example.com/photos/user1_front.jpg',
                'https://example.com/photos/user1_side.jpg'
            ]),
            designData: JSON.stringify({
                templateId: 'saree-modern',
                materialId: 5,
                colors: {
                    primary: '#D946EF',
                    secondary: '#F97316',
                    accent: '#FBBF24',
                    border: '#DC2626'
                },
                customDesignUrl: 'https://example.com/designs/modern-saree-001.jpg',
                status: 'draft',
                notes: 'Contemporary saree with modern blouse design'
            }),
            createdAt: new Date('2024-01-05').toISOString(),
            updatedAt: new Date('2024-01-05').toISOString(),
        },
        {
            userId: 'user_02h5lyu3f9a0z4c2o8n7r6x9s5',
            avatarMeasurements: JSON.stringify({
                bust: 92,
                waist: 72,
                hips: 98,
                height: 170,
                shoulderWidth: 40,
                armLength: 60
            }),
            photoUrls: JSON.stringify([
                'https://example.com/photos/user2_front.jpg',
                'https://example.com/photos/user2_side.jpg',
                'https://example.com/photos/user2_back.jpg'
            ]),
            designData: JSON.stringify({
                templateId: 'kurta-contemporary',
                materialId: 12,
                colors: {
                    primary: '#059669',
                    secondary: '#FBBF24',
                    accent: '#DC2626'
                },
                status: 'ordered',
                orderDate: '2024-01-20',
                notes: 'Straight kurta with palazzo pants'
            }),
            createdAt: new Date('2024-01-10').toISOString(),
            updatedAt: new Date('2024-01-20').toISOString(),
        },
        {
            userId: 'user_04h7naw5h1c2b6e4q0p9t8z1u7',
            avatarMeasurements: JSON.stringify({
                bust: 88,
                waist: 70,
                hips: 94,
                height: 162,
                shoulderWidth: 36,
                armLength: 56
            }),
            photoUrls: JSON.stringify([
                'https://example.com/photos/user3_front.jpg'
            ]),
            designData: JSON.stringify({
                templateId: 'anarkali-fusion',
                materialId: 8,
                colors: {
                    primary: '#7C3AED',
                    secondary: '#EC4899',
                    accent: '#FBBF24'
                },
                customDesignUrl: 'https://example.com/designs/anarkali-fusion-002.jpg',
                status: 'draft',
                notes: 'Floor-length anarkali with contemporary neckline'
            }),
            createdAt: new Date('2024-01-12').toISOString(),
            updatedAt: new Date('2024-01-12').toISOString(),
        },
        {
            userId: 'user_05h8obx6i2d3c7f5r1q0u9a2v8',
            avatarMeasurements: JSON.stringify({
                bust: 84,
                waist: 66,
                hips: 90,
                height: 168,
                shoulderWidth: 37,
                armLength: 59
            }),
            photoUrls: JSON.stringify([
                'https://example.com/photos/user4_front.jpg',
                'https://example.com/photos/user4_side.jpg'
            ]),
            designData: JSON.stringify({
                templateId: 'lehenga-choli',
                materialId: 3,
                colors: {
                    primary: '#DC2626',
                    secondary: '#FBBF24',
                    accent: '#059669',
                    border: '#7C3AED'
                },
                status: 'ordered',
                orderDate: '2024-01-25',
                notes: 'Traditional lehenga with modern choli cut'
            }),
            createdAt: new Date('2024-01-15').toISOString(),
            updatedAt: new Date('2024-01-25').toISOString(),
        },
        {
            userId: 'user_01h4kxt2e8z9y3b1n7m6q5w8r4',
            avatarMeasurements: JSON.stringify({
                bust: 86,
                waist: 68,
                hips: 92,
                height: 165,
                shoulderWidth: 38,
                armLength: 58
            }),
            photoUrls: JSON.stringify([
                'https://example.com/photos/user1_front_2.jpg'
            ]),
            designData: JSON.stringify({
                templateId: 'palazzo-set',
                materialId: 15,
                colors: {
                    primary: '#059669',
                    secondary: '#FBBF24',
                    accent: '#EC4899'
                },
                status: 'draft',
                notes: 'Printed palazzo with matching dupatta'
            }),
            createdAt: new Date('2024-01-18').toISOString(),
            updatedAt: new Date('2024-01-18').toISOString(),
        },
        {
            userId: 'user_02h5lyu3f9a0z4c2o8n7r6x9s5',
            avatarMeasurements: JSON.stringify({
                bust: 92,
                waist: 72,
                hips: 98,
                height: 170,
                shoulderWidth: 40,
                armLength: 60
            }),
            photoUrls: JSON.stringify([
                'https://example.com/photos/user2_formal.jpg'
            ]),
            designData: JSON.stringify({
                templateId: 'sharara-suit',
                materialId: 7,
                colors: {
                    primary: '#7C3AED',
                    secondary: '#FBBF24',
                    accent: '#DC2626'
                },
                customDesignUrl: 'https://example.com/designs/sharara-elegance-003.jpg',
                status: 'draft',
                notes: 'Heavy embroidered sharara for special occasions'
            }),
            createdAt: new Date('2024-01-22').toISOString(),
            updatedAt: new Date('2024-01-22').toISOString(),
        },
        {
            userId: 'user_04h7naw5h1c2b6e4q0p9t8z1u7',
            avatarMeasurements: JSON.stringify({
                bust: 88,
                waist: 70,
                hips: 94,
                height: 162,
                shoulderWidth: 36,
                armLength: 56
            }),
            photoUrls: JSON.stringify([
                'https://example.com/photos/user3_casual.jpg',
                'https://example.com/photos/user3_back.jpg'
            ]),
            designData: JSON.stringify({
                templateId: 'cape-dress',
                materialId: 11,
                colors: {
                    primary: '#EC4899',
                    secondary: '#7C3AED',
                    accent: '#FBBF24'
                },
                status: 'draft',
                notes: 'Indo-western cape dress with attached dupatta'
            }),
            createdAt: new Date('2024-01-25').toISOString(),
            updatedAt: new Date('2024-01-25').toISOString(),
        },
        {
            userId: 'user_05h8obx6i2d3c7f5r1q0u9a2v8',
            avatarMeasurements: JSON.stringify({
                bust: 84,
                waist: 66,
                hips: 90,
                height: 168,
                shoulderWidth: 37,
                armLength: 59
            }),
            photoUrls: JSON.stringify([
                'https://example.com/photos/user4_party.jpg'
            ]),
            designData: JSON.stringify({
                templateId: 'crop-top-skirt',
                materialId: 18,
                colors: {
                    primary: '#FBBF24',
                    secondary: '#DC2626',
                    accent: '#059669'
                },
                status: 'ordered',
                orderDate: '2024-01-28',
                notes: 'Modern crop top with flowing skirt'
            }),
            createdAt: new Date('2024-01-26').toISOString(),
            updatedAt: new Date('2024-01-28').toISOString(),
        },
        {
            userId: 'user_01h4kxt2e8z9y3b1n7m6q5w8r4',
            avatarMeasurements: JSON.stringify({
                bust: 86,
                waist: 68,
                hips: 92,
                height: 165,
                shoulderWidth: 38,
                armLength: 58
            }),
            photoUrls: JSON.stringify([
                'https://example.com/photos/user1_office.jpg',
                'https://example.com/photos/user1_side_2.jpg'
            ]),
            designData: JSON.stringify({
                templateId: 'jacket-kurti',
                materialId: 4,
                colors: {
                    primary: '#059669',
                    secondary: '#7C3AED',
                    accent: '#EC4899'
                },
                customDesignUrl: 'https://example.com/designs/jacket-kurti-004.jpg',
                status: 'draft',
                notes: 'Professional jacket kurti with straight pants'
            }),
            createdAt: new Date('2024-01-28').toISOString(),
            updatedAt: new Date('2024-01-28').toISOString(),
        },
        {
            userId: 'user_02h5lyu3f9a0z4c2o8n7r6x9s5',
            avatarMeasurements: JSON.stringify({
                bust: 92,
                waist: 72,
                hips: 98,
                height: 170,
                shoulderWidth: 40,
                armLength: 60
            }),
            photoUrls: JSON.stringify([
                'https://example.com/photos/user2_evening.jpg'
            ]),
            designData: JSON.stringify({
                templateId: 'indo-western-gown',
                materialId: 20,
                colors: {
                    primary: '#7C3AED',
                    secondary: '#DC2626',
                    accent: '#FBBF24',
                    border: '#059669'
                },
                status: 'draft',
                notes: 'Elegant indo-western gown for evening events'
            }),
            createdAt: new Date('2024-01-30').toISOString(),
            updatedAt: new Date('2024-01-30').toISOString(),
        },
        {
            userId: 'user_04h7naw5h1c2b6e4q0p9t8z1u7',
            avatarMeasurements: JSON.stringify({
                bust: 88,
                waist: 70,
                hips: 94,
                height: 162,
                shoulderWidth: 36,
                armLength: 56
            }),
            photoUrls: JSON.stringify([
                'https://example.com/photos/user3_wedding.jpg',
                'https://example.com/photos/user3_detail.jpg'
            ]),
            designData: JSON.stringify({
                templateId: 'saree-modern',
                materialId: 9,
                colors: {
                    primary: '#DC2626',
                    secondary: '#FBBF24',
                    accent: '#7C3AED'
                },
                customDesignUrl: 'https://example.com/designs/wedding-saree-005.jpg',
                status: 'draft',
                notes: 'Wedding saree with contemporary draping style'
            }),
            createdAt: new Date('2024-02-01').toISOString(),
            updatedAt: new Date('2024-02-01').toISOString(),
        },
        {
            userId: 'user_05h8obx6i2d3c7f5r1q0u9a2v8',
            avatarMeasurements: JSON.stringify({
                bust: 84,
                waist: 66,
                hips: 90,
                height: 168,
                shoulderWidth: 37,
                armLength: 59
            }),
            photoUrls: JSON.stringify([
                'https://example.com/photos/user4_festive.jpg'
            ]),
            designData: JSON.stringify({
                templateId: 'kurta-contemporary',
                materialId: 16,
                colors: {
                    primary: '#EC4899',
                    secondary: '#059669',
                    accent: '#FBBF24'
                },
                status: 'draft',
                notes: 'Festive kurta with embroidered details'
            }),
            createdAt: new Date('2024-02-03').toISOString(),
            updatedAt: new Date('2024-02-03').toISOString(),
        }
    ];

    await db.insert(designs).values(sampleDesigns);
    
    console.log('✅ Designs seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});