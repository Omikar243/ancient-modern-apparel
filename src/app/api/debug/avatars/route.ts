import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userAvatars } from '@/db/schema';
import { desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    console.log('Debug: Fetching all avatars data from userAvatars table');
    
    // Fetch all avatars from userAvatars table
    const allAvatars = await db.select()
      .from(userAvatars)
      .orderBy(desc(userAvatars.updatedAt));

    console.log(`Debug: Found ${allAvatars.length} avatars in userAvatars table`);
    
    // Parse measurements JSON for each avatar and map to expected format
    const parsedAvatars = allAvatars.map(avatar => {
      let parsedMeasurements;
      try {
        parsedMeasurements = typeof avatar.measurements === 'string' 
          ? JSON.parse(avatar.measurements) 
          : avatar.measurements;
      } catch (error) {
        console.error(`Debug: Failed to parse measurements for avatar ${avatar.id}:`, error);
        parsedMeasurements = null;
      }

      return {
        id: avatar.id,
        userId: avatar.userId,
        measurements: parsedMeasurements,
        photos: typeof avatar.photos === 'string' ? JSON.parse(avatar.photos) : avatar.photos,
        unitPreference: avatar.unitPreference,
        fittedModelUrl: null, // userAvatars doesn't have this field
        createdAt: avatar.updatedAt, // using updatedAt as createdAt
        updatedAt: avatar.updatedAt
      };
    });

    console.log('Debug: Parsed avatars data:', JSON.stringify(parsedAvatars, null, 2));

    // Create response with debug headers
    const response = NextResponse.json({
      avatars: parsedAvatars,
      count: allAvatars.length,
      debug: {
        timestamp: new Date().toISOString(),
        endpoint: 'debug/avatars',
        message: 'Debug endpoint - authentication bypassed',
        table: 'userAvatars'
      }
    }, { status: 200 });

    // Add debug warning headers
    response.headers.set('X-Debug-Endpoint', 'true');
    response.headers.set('X-Debug-Warning', 'This endpoint bypasses authentication - for debugging only');
    response.headers.set('X-Debug-Timestamp', new Date().toISOString());
    response.headers.set('X-Avatar-Count', allAvatars.length.toString());

    return response;

  } catch (error) {
    console.error('Debug avatars GET error:', error);
    
    const errorResponse = NextResponse.json({ 
      error: 'Failed to fetch avatars debug data',
      code: 'DEBUG_FETCH_ERROR',
      details: error instanceof Error ? error.message : 'Unknown error',
      debug: {
        timestamp: new Date().toISOString(),
        endpoint: 'debug/avatars',
        table: 'userAvatars'
      }
    }, { status: 500 });

    // Add debug headers to error response
    errorResponse.headers.set('X-Debug-Endpoint', 'true');
    errorResponse.headers.set('X-Debug-Error', 'true');
    errorResponse.headers.set('X-Debug-Warning', 'This endpoint bypasses authentication - for debugging only');

    return errorResponse;
  }
}