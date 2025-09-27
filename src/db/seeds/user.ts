import { db } from '@/db';
import { user } from '@/db/schema';

async function main() {
    const sampleUsers = [
        {
            id: 'user_01h4kxt2e8z9y3b1n7m6q5w8r4',
            name: 'John Martinez',
            email: 'john.martinez@techcorp.com',
            emailVerified: true,
            image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
            createdAt: new Date('2024-01-15T10:30:00Z'),
            updatedAt: new Date('2024-01-15T10:30:00Z'),
        },
        {
            id: 'user_02h5lyu3f9a0z4c2o8n7r6x9s5',
            name: 'Sarah Chen',
            email: 'sarah.chen@university.edu',
            emailVerified: true,
            image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
            createdAt: new Date('2024-02-03T14:22:00Z'),
            updatedAt: new Date('2024-02-03T14:22:00Z'),
        },
        {
            id: 'user_03h6mzv4g0b1a5d3p9o8s7y0t6',
            name: 'David Thompson',
            email: 'david.thompson@nonprofit.org',
            emailVerified: true,
            image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david',
            createdAt: new Date('2024-02-18T09:45:00Z'),
            updatedAt: new Date('2024-02-18T09:45:00Z'),
        },
        {
            id: 'user_04h7naw5h1c2b6e4q0p9t8z1u7',
            name: 'Emily Rodriguez',
            email: 'emily.rodriguez@designstudio.net',
            emailVerified: true,
            image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emily',
            createdAt: new Date('2024-03-05T16:12:00Z'),
            updatedAt: new Date('2024-03-05T16:12:00Z'),
        },
        {
            id: 'user_05h8obx6i2d3c7f5r1q0u9a2v8',
            name: 'Michael Kim',
            email: 'michael.kim@startup.com',
            emailVerified: true,
            image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=michael',
            createdAt: new Date('2024-03-12T11:33:00Z'),
            updatedAt: new Date('2024-03-12T11:33:00Z'),
        },
        {
            id: 'user_06h9pcy7j3e4d8g6s2r1v0b3w9',
            name: 'Alexandra Petrov',
            email: 'alexandra.petrov@consulting.com',
            emailVerified: false,
            image: null,
            createdAt: new Date('2024-03-20T13:18:00Z'),
            updatedAt: new Date('2024-03-20T13:18:00Z'),
        },
        {
            id: 'user_07h0qdz8k4f5e9h7t3s2w1c4x0',
            name: 'James Wilson',
            email: 'james.wilson@freelance.net',
            emailVerified: false,
            image: null,
            createdAt: new Date('2024-03-25T08:44:00Z'),
            updatedAt: new Date('2024-03-25T08:44:00Z'),
        },
        {
            id: 'user_08h1rea9l5g6f0i8u4t3x2d5y1',
            name: 'Maria Garcia',
            email: 'maria.garcia@research.edu',
            emailVerified: false,
            image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maria',
            createdAt: new Date('2024-03-28T15:07:00Z'),
            updatedAt: new Date('2024-03-28T15:07:00Z'),
        }
    ];

    await db.insert(user).values(sampleUsers);
    
    console.log('✅ Users seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});