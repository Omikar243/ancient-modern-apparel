// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { account } from '@/db/schema';
import bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';

export async function POST(request: NextRequest) {
  try {
    // Delete all existing account records
    await db.delete(account);

    // User mappings with exact IDs and emails
    const userMappings = [
      { userId: 'user_01h4kxt2e8z9y3b1n7m6q5w8r4', email: 'john.martinez@techcorp.com' },
      { userId: 'user_02h5lyu3f9a0z4c2o8n7r6x9s5', email: 'sarah.chen@university.edu' },
      { userId: 'user_03h6mzv4g0b1a5d3p9o8s7y0t6', email: 'david.thompson@nonprofit.org' },
      { userId: 'user_04h7naw5h1c2b6e4q0p9t8z1u7', email: 'emily.rodriguez@designstudio.net' },
      { userId: 'user_05h8obx6i2d3c7f5r1q0u9a2v8', email: 'michael.kim@startup.com' },
      { userId: 'user_06h9pcy7j3e4d8g6s2r1v0b3w9', email: 'alexandra.petrov@consulting.com' },
      { userId: 'user_07h0qdz8k4f5e9h7t3s2w1c4x0', email: 'james.wilson@freelance.net' },
      { userId: 'user_08h1rea9l5g6f0i8u4t3x2d5y1', email: 'maria.garcia@research.edu' }
    ];

    // Hash password once for all users
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    // Create account records for all seeded users with proper timestamp format
    const accountsData = userMappings.map((user, index) => ({
      id: nanoid(),
      accountId: user.email, // Use email as accountId for credential provider
      providerId: 'credential',
      userId: user.userId,
      accessToken: null,
      refreshToken: null,
      idToken: null,
      accessTokenExpiresAt: null,
      refreshTokenExpiresAt: null,
      scope: null,
      password: hashedPassword,
      createdAt: new Date(2024, 0, 15 + index), // Use proper Date objects, not integers
      updatedAt: new Date(2024, 0, 15 + index)
    }));

    // Insert all account records
    await db.insert(account).values(accountsData);

    return NextResponse.json({
      success: true,
      message: 'Accounts reset successfully',
      accountsCreated: accountsData.length
    }, { status: 200 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error
    }, { status: 500 });
  }
}