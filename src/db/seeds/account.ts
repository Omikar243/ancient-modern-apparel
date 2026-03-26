import { db } from '@/db';
import { account } from '@/db/schema';
import bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';

async function main() {
    // Delete existing account records first
    await db.delete(account);

    const hashedPassword = await bcrypt.hash('password123', 10);

    const sampleAccounts = [
        {
            id: nanoid(),
            accountId: 'john.martinez@techcorp.com',
            providerId: 'credential',
            userId: 'user_01h4kxt2e8z9y3b1n7m6q5w8r4',
            accessToken: null,
            refreshToken: null,
            idToken: null,
            accessTokenExpiresAt: null,
            refreshTokenExpiresAt: null,
            scope: null,
            password: hashedPassword,
            createdAt: new Date('2024-01-15'),
            updatedAt: new Date('2024-01-15'),
        },
        {
            id: nanoid(),
            accountId: 'sarah.chen@university.edu',
            providerId: 'credential',
            userId: 'user_02h5lyu3f9a0z4c2o8n7r6x9s5',
            accessToken: null,
            refreshToken: null,
            idToken: null,
            accessTokenExpiresAt: null,
            refreshTokenExpiresAt: null,
            scope: null,
            password: hashedPassword,
            createdAt: new Date('2024-01-16'),
            updatedAt: new Date('2024-01-16'),
        },
        {
            id: nanoid(),
            accountId: 'david.thompson@nonprofit.org',
            providerId: 'credential',
            userId: 'user_03h6mzv4g0b1a5d3p9o8s7y0t6',
            accessToken: null,
            refreshToken: null,
            idToken: null,
            accessTokenExpiresAt: null,
            refreshTokenExpiresAt: null,
            scope: null,
            password: hashedPassword,
            createdAt: new Date('2024-01-17'),
            updatedAt: new Date('2024-01-17'),
        },
        {
            id: nanoid(),
            accountId: 'emily.rodriguez@designstudio.net',
            providerId: 'credential',
            userId: 'user_04h7naw5h1c2b6e4q0p9t8z1u7',
            accessToken: null,
            refreshToken: null,
            idToken: null,
            accessTokenExpiresAt: null,
            refreshTokenExpiresAt: null,
            scope: null,
            password: hashedPassword,
            createdAt: new Date('2024-01-18'),
            updatedAt: new Date('2024-01-18'),
        },
        {
            id: nanoid(),
            accountId: 'michael.kim@startup.com',
            providerId: 'credential',
            userId: 'user_05h8obx6i2d3c7f5r1q0u9a2v8',
            accessToken: null,
            refreshToken: null,
            idToken: null,
            accessTokenExpiresAt: null,
            refreshTokenExpiresAt: null,
            scope: null,
            password: hashedPassword,
            createdAt: new Date('2024-01-19'),
            updatedAt: new Date('2024-01-19'),
        },
        {
            id: nanoid(),
            accountId: 'alexandra.petrov@consulting.com',
            providerId: 'credential',
            userId: 'user_06h9pcy7j3e4d8g6s2r1v0b3w9',
            accessToken: null,
            refreshToken: null,
            idToken: null,
            accessTokenExpiresAt: null,
            refreshTokenExpiresAt: null,
            scope: null,
            password: hashedPassword,
            createdAt: new Date('2024-01-20'),
            updatedAt: new Date('2024-01-20'),
        },
        {
            id: nanoid(),
            accountId: 'james.wilson@freelance.net',
            providerId: 'credential',
            userId: 'user_07h0qdz8k4f5e9h7t3s2w1c4x0',
            accessToken: null,
            refreshToken: null,
            idToken: null,
            accessTokenExpiresAt: null,
            refreshTokenExpiresAt: null,
            scope: null,
            password: hashedPassword,
            createdAt: new Date('2024-01-21'),
            updatedAt: new Date('2024-01-21'),
        },
        {
            id: nanoid(),
            accountId: 'maria.garcia@research.edu',
            providerId: 'credential',
            userId: 'user_08h1rea9l5g6f0i8u4t3x2d5y1',
            accessToken: null,
            refreshToken: null,
            idToken: null,
            accessTokenExpiresAt: null,
            refreshTokenExpiresAt: null,
            scope: null,
            password: hashedPassword,
            createdAt: new Date('2024-01-22'),
            updatedAt: new Date('2024-01-22'),
        },
    ];

    await db.insert(account).values(sampleAccounts);
    
    console.log('✅ Accounts seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});