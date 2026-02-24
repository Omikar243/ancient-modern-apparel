import { supabaseAdmin } from '@/lib/supabase-admin';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const { data, error } = await supabaseAdmin.storage.createBucket('photos', {
      public: false
    });

    if (error && (error as any).code !== 'already_exists') {
      console.error('Error creating bucket:', error);
      return NextResponse.json({ error: (error as any).message || String(error) }, { status: 500 });
    }

    return NextResponse.json({ success: true, bucket: 'photos' });
  } catch (error) {
    console.error('Storage initialization error:', error);
    return NextResponse.json({ error: 'Failed to initialize storage' }, { status: 500 });
  }
}