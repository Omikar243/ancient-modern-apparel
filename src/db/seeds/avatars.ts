import { db } from '@/db';
import { avatars } from '@/db/schema';

async function main() {
    // Clear existing data
    await db.delete(avatars);

    const sampleAvatars = [
        {
            userId: 'user_01h4kxt2e8z9y3b1n7m6q5w8r4',
            measurements: {"height": 160, "bust": 80, "waist": 65, "hips": 85, "shoulders": 36},
            fittedModelUrl: '/mock-glb-1.glb',
            createdAt: new Date('2024-01-10').toISOString(),
        },
        {
            userId: 'user_01h4kxt2e8z9y3b1n7m6q5w8r4',
            measurements: {"height": 175, "bust": 92, "waist": 72, "hips": 98, "shoulders": 42},
            fittedModelUrl: '/mock-glb-2.glb',
            createdAt: new Date('2024-01-15').toISOString(),
        },
        {
            userId: 'user_01h4kxt2e8z9y3b1n7m6q5w8r4',
            measurements: {"height": 185, "bust": 95, "waist": 75, "hips": 100, "shoulders": 45},
            fittedModelUrl: '/mock-glb-3.glb',
            createdAt: new Date('2024-01-20').toISOString(),
        }
    ];

    await db.insert(avatars).values(sampleAvatars);
    
    console.log('✅ Avatars seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});