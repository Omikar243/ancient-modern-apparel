import { db } from '@/db';
import { userAvatars } from '@/db/schema';

async function main() {
    const sampleUserAvatars = [
        {
            userId: 'user_01h4kxt2e8z9y3b1n7m6q5w8r4',
            measurements: {
                height: 178,
                bust: 102,
                waist: 84,
                hips: 98,
                shoulder: 44,
                armLength: 62
            },
            photos: [
                '/photos/avatars/user_01h4kxt2e8z9y3b1n7m6q5w8r4/front.jpg',
                '/photos/avatars/user_01h4kxt2e8z9y3b1n7m6q5w8r4/side.jpg',
                '/photos/avatars/user_01h4kxt2e8z9y3b1n7m6q5w8r4/back.jpg'
            ],
            unitPreference: 'cm',
            updatedAt: new Date('2024-01-15').toISOString(),
        },
        {
            userId: 'user_02h5lyu3f9a0z4c2o8n7r6x9s5',
            measurements: {
                height: 163,
                bust: 88,
                waist: 68,
                hips: 92,
                shoulder: 39,
                armLength: 57
            },
            photos: [
                '/photos/avatars/user_02h5lyu3f9a0z4c2o8n7r6x9s5/front.jpg',
                '/photos/avatars/user_02h5lyu3f9a0z4c2o8n7r6x9s5/side.jpg',
                '/photos/avatars/user_02h5lyu3f9a0z4c2o8n7r6x9s5/back.jpg',
                '/photos/avatars/user_02h5lyu3f9a0z4c2o8n7r6x9s5/profile.jpg'
            ],
            unitPreference: 'inch',
            updatedAt: new Date('2024-01-18').toISOString(),
        },
        {
            userId: 'user_03h6mzv4g0b1a5d3p9o8s7y0t6',
            measurements: {
                height: 185,
                bust: 108,
                waist: 91,
                hips: 102,
                shoulder: 47,
                armLength: 65
            },
            photos: [
                '/photos/avatars/user_03h6mzv4g0b1a5d3p9o8s7y0t6/front.jpg',
                '/photos/avatars/user_03h6mzv4g0b1a5d3p9o8s7y0t6/side.jpg'
            ],
            unitPreference: 'cm',
            updatedAt: new Date('2024-01-22').toISOString(),
        },
        {
            userId: 'user_04h7naw5h1c2b6e4q0p9t8z1u7',
            measurements: {
                height: 156,
                bust: 84,
                waist: 65,
                hips: 88,
                shoulder: 38,
                armLength: 55
            },
            photos: [
                '/photos/avatars/user_04h7naw5h1c2b6e4q0p9t8z1u7/front.jpg',
                '/photos/avatars/user_04h7naw5h1c2b6e4q0p9t8z1u7/side.jpg',
                '/photos/avatars/user_04h7naw5h1c2b6e4q0p9t8z1u7/back.jpg',
                '/photos/avatars/user_04h7naw5h1c2b6e4q0p9t8z1u7/angle.jpg'
            ],
            unitPreference: 'inch',
            updatedAt: new Date('2024-01-25').toISOString(),
        },
        {
            userId: 'user_05h8obx6i2d3c7f5r1q0u9a2v8',
            measurements: {
                height: 171,
                bust: 96,
                waist: 78,
                hips: 94,
                shoulder: 42,
                armLength: 59
            },
            photos: [
                '/photos/avatars/user_05h8obx6i2d3c7f5r1q0u9a2v8/front.jpg',
                '/photos/avatars/user_05h8obx6i2d3c7f5r1q0u9a2v8/side.jpg',
                '/photos/avatars/user_05h8obx6i2d3c7f5r1q0u9a2v8/back.jpg'
            ],
            unitPreference: 'cm',
            updatedAt: new Date('2024-01-28').toISOString(),
        }
    ];

    await db.insert(userAvatars).values(sampleUserAvatars);
    
    console.log('✅ User avatars seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});