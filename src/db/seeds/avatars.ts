import { db } from '@/db';
import { avatars } from '@/db/schema';

async function main() {
    const sampleAvatars = [
        {
            userId: 'user_02h5lyu3f9a0z4c2o8n7r6x9s5',
            measurements: JSON.stringify({
                height: 163,
                bust: 88,
                waist: 68,
                hips: 92,
                shoulders: 39,
                gender: 'female'
            }),
            photos: JSON.stringify([
                "/photos/avatar_1_front.jpg",
                "/photos/avatar_1_back.jpg", 
                "/photos/avatar_1_left.jpg",
                "/photos/avatar_1_right.jpg"
            ]),
            createdAt: new Date('2024-01-10').toISOString(),
            updatedAt: new Date('2024-01-10').toISOString(),
        },
        {
            userId: 'user_01h4kxt2e8z9y3b1n7m6q5w8r4',
            measurements: JSON.stringify({
                height: 175,
                chest: 98,
                waist: 82,
                hips: 95,
                shoulders: 44,
                gender: 'male'
            }),
            photos: JSON.stringify([
                "/photos/avatar_2_front.jpg",
                "/photos/avatar_2_back.jpg",
                "/photos/avatar_2_left.jpg"
            ]),
            createdAt: new Date('2024-01-15').toISOString(),
            updatedAt: new Date('2024-01-15').toISOString(),
        },
        {
            userId: 'user_04h7naw5h1c2b6e4q0p9t8z1u7',
            measurements: JSON.stringify({
                height: 158,
                bust: 85,
                waist: 65,
                hips: 89,
                shoulders: 37,
                gender: 'female'
            }),
            photos: JSON.stringify([
                "/photos/avatar_3_front.jpg",
                "/photos/avatar_3_back.jpg",
                "/photos/avatar_3_left.jpg",
                "/photos/avatar_3_right.jpg"
            ]),
            createdAt: new Date('2024-01-20').toISOString(),
            updatedAt: new Date('2024-01-20').toISOString(),
        }
    ];

    await db.insert(avatars).values(sampleAvatars);
    
    console.log('✅ Avatars seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});