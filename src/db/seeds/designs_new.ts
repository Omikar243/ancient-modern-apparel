import { db } from '@/db';
import { designs } from '@/db/schema';

async function main() {
    const sampleDesigns = [
        {
            userId: 'user_01h4kxt2e8z9y3b1n7m6q5w8r4',
            templateId: 'saree-modern',
            materialId: 5,
            customDesignUrl: 'https://example.com/designs/custom-saree-1.jpg',
            colors: JSON.stringify({
                primary: '#8B4513',
                secondary: '#DAA520',
                accent: '#FF6347'
            }),
            status: 'draft',
            orderId: null,
            createdAt: new Date('2024-01-10').toISOString(),
            updatedAt: new Date('2024-01-10').toISOString(),
        },
        {
            userId: 'user_02h5lyu3f9a0z4c2o8n7r6x9s5',
            templateId: 'kurta-contemporary',
            materialId: 12,
            customDesignUrl: null,
            colors: JSON.stringify({
                primary: '#4B0082',
                secondary: '#9370DB',
                accent: '#FFD700',
                border: '#800080'
            }),
            status: 'ordered',
            orderId: 1001,
            createdAt: new Date('2024-01-15').toISOString(),
            updatedAt: new Date('2024-01-20').toISOString(),
        },
        {
            userId: 'user_04h7naw5h1c2b6e4q0p9t8z1u7',
            templateId: 'anarkali-fusion',
            materialId: 3,
            customDesignUrl: 'https://example.com/designs/custom-anarkali-2.jpg',
            colors: JSON.stringify({
                primary: '#DC143C',
                secondary: '#FFB6C1',
                accent: '#FFEFD5'
            }),
            status: 'draft',
            orderId: null,
            createdAt: new Date('2024-01-18').toISOString(),
            updatedAt: new Date('2024-01-18').toISOString(),
        },
        {
            userId: 'user_05h8obx6i2d3c7f5r1q0u9a2v8',
            templateId: 'lehenga-choli',
            materialId: 8,
            customDesignUrl: null,
            colors: JSON.stringify({
                primary: '#FF1493',
                secondary: '#FF69B4',
                accent: '#FFFACD',
                border: '#B22222'
            }),
            status: 'ordered',
            orderId: 1002,
            createdAt: new Date('2024-01-22').toISOString(),
            updatedAt: new Date('2024-01-25').toISOString(),
        },
        {
            userId: 'user_01h4kxt2e8z9y3b1n7m6q5w8r4',
            templateId: 'palazzo-set',
            materialId: 15,
            customDesignUrl: 'https://example.com/designs/custom-palazzo-1.jpg',
            colors: JSON.stringify({
                primary: '#2E8B57',
                secondary: '#98FB98',
                accent: '#F0E68C'
            }),
            status: 'draft',
            orderId: null,
            createdAt: new Date('2024-01-28').toISOString(),
            updatedAt: new Date('2024-01-28').toISOString(),
        },
        {
            userId: 'user_02h5lyu3f9a0z4c2o8n7r6x9s5',
            templateId: 'sharara-suit',
            materialId: 7,
            customDesignUrl: null,
            colors: JSON.stringify({
                primary: '#FF4500',
                secondary: '#FFA500',
                accent: '#FFFFE0',
                border: '#8B4513'
            }),
            status: 'draft',
            orderId: null,
            createdAt: new Date('2024-02-02').toISOString(),
            updatedAt: new Date('2024-02-02').toISOString(),
        },
        {
            userId: 'user_04h7naw5h1c2b6e4q0p9t8z1u7',
            templateId: 'cape-dress',
            materialId: 11,
            customDesignUrl: 'https://example.com/designs/custom-cape-dress-3.jpg',
            colors: JSON.stringify({
                primary: '#191970',
                secondary: '#6495ED',
                accent: '#F0F8FF'
            }),
            status: 'draft',
            orderId: null,
            createdAt: new Date('2024-02-05').toISOString(),
            updatedAt: new Date('2024-02-05').toISOString(),
        },
        {
            userId: 'user_05h8obx6i2d3c7f5r1q0u9a2v8',
            templateId: 'crop-top-skirt',
            materialId: 4,
            customDesignUrl: null,
            colors: JSON.stringify({
                primary: '#FF6347',
                secondary: '#FFA07A',
                accent: '#FFFAF0',
                border: '#CD5C5C'
            }),
            status: 'ordered',
            orderId: 1003,
            createdAt: new Date('2024-02-08').toISOString(),
            updatedAt: new Date('2024-02-12').toISOString(),
        },
        {
            userId: 'user_01h4kxt2e8z9y3b1n7m6q5w8r4',
            templateId: 'jacket-kurti',
            materialId: 18,
            customDesignUrl: 'https://example.com/designs/custom-jacket-kurti-2.jpg',
            colors: JSON.stringify({
                primary: '#800000',
                secondary: '#FA8072',
                accent: '#FAEBD7'
            }),
            status: 'draft',
            orderId: null,
            createdAt: new Date('2024-02-10').toISOString(),
            updatedAt: new Date('2024-02-10').toISOString(),
        },
        {
            userId: 'user_02h5lyu3f9a0z4c2o8n7r6x9s5',
            templateId: 'indo-western-gown',
            materialId: 9,
            customDesignUrl: null,
            colors: JSON.stringify({
                primary: '#4B0082',
                secondary: '#8A2BE2',
                accent: '#E6E6FA',
                border: '#483D8B'
            }),
            status: 'draft',
            orderId: null,
            createdAt: new Date('2024-02-15').toISOString(),
            updatedAt: new Date('2024-02-15').toISOString(),
        },
        {
            userId: 'user_04h7naw5h1c2b6e4q0p9t8z1u7',
            templateId: 'saree-modern',
            materialId: 20,
            customDesignUrl: 'https://example.com/designs/custom-saree-elegant.jpg',
            colors: JSON.stringify({
                primary: '#2F4F4F',
                secondary: '#708090',
                accent: '#F5F5DC'
            }),
            status: 'draft',
            orderId: null,
            createdAt: new Date('2024-02-18').toISOString(),
            updatedAt: new Date('2024-02-18').toISOString(),
        },
        {
            userId: 'user_05h8obx6i2d3c7f5r1q0u9a2v8',
            templateId: 'anarkali-fusion',
            materialId: 6,
            customDesignUrl: null,
            colors: JSON.stringify({
                primary: '#228B22',
                secondary: '#90EE90',
                accent: '#F0FFF0',
                border: '#006400'
            }),
            status: 'ordered',
            orderId: 1004,
            createdAt: new Date('2024-02-20').toISOString(),
            updatedAt: new Date('2024-02-23').toISOString(),
        }
    ];

    await db.insert(designs).values(sampleDesigns);
    
    console.log('✅ Designs seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});