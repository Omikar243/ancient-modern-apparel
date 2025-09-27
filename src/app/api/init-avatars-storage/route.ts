import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    // Create 'avatars' bucket in Supabase storage
    const { data, error } = await supabaseAdmin.storage.createBucket('avatars', {
      public: false
    });

    // Handle 'already_exists' error gracefully (not an error)
    if (error && error.code === 'already_exists') {
      console.log('Avatars bucket already exists, proceeding...');
      return NextResponse.json({
        success: true,
        bucket: 'avatars',
        message: 'Bucket already exists'
      }, { status: 200 });
    }

    // Handle other errors
    if (error) {
      console.error('Failed to create avatars bucket:', error);
      return NextResponse.json({
        error: 'Failed to initialize avatars storage: ' + error.message
      }, { status: 500 });
    }

    console.log('Avatars bucket created successfully:', data);
    return NextResponse.json({
      success: true,
      bucket: 'avatars'
    }, { status: 200 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({
      error: 'Failed to initialize avatars storage: ' + error
    }, { status: 500 });
  }
}