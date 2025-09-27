import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userAvatars } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { supabaseAdmin } from '@/lib/supabase-admin';

// Enhanced validation helper function
function validateMeasurements(measurements: any) {
  const errors: string[] = [];

  // Check if measurements object exists
  if (!measurements || typeof measurements !== 'object') {
    return { isValid: false, errors: ['Measurements object is required'] };
  }

  // Required fields with their validation rules
  const requiredFields = {
    height: { min: 100, max: 250, unit: 'cm' },
    bust: { min: 60, max: 150, unit: 'cm' },
    waist: { min: 50, max: 120, unit: 'cm' },
    hips: { min: 60, max: 150, unit: 'cm' },
    shoulders: { min: 30, max: 70, unit: 'cm' }
  };

  // Validate each required field
  for (const [field, rules] of Object.entries(requiredFields)) {
    const value = measurements[field];

    // Check if field exists
    if (value === undefined || value === null) {
      errors.push(`${field} is required`);
      continue;
    }

    // Check if field is numeric
    if (typeof value !== 'number' || isNaN(value)) {
      errors.push(`${field} must be a valid number`);
      continue;
    }

    // Check if value is positive
    if (value <= 0) {
      errors.push(`${field} must be a positive number`);
      continue;
    }

    // Check if value is within valid range
    if (value < rules.min || value > rules.max) {
      errors.push(`${field} must be between ${rules.min} and ${rules.max} ${rules.unit}`);
      continue;
    }
  }

  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

// Helper function to generate GLB from measurements
async function generateAvatarGLB(measurements: any): Promise<ArrayBuffer> {
  try {
    const scene = new THREE.Scene();
    
    // Create torso (cylinder scaled by measurements)
    const torsoGeometry = new THREE.CylinderGeometry(
      measurements.waist / 200, // top radius
      measurements.hips / 200,  // bottom radius  
      measurements.height / 100, // height
      16 // segments
    );
    const torsoMaterial = new THREE.MeshBasicMaterial({ color: 0x8B7355 });
    const torso = new THREE.Mesh(torsoGeometry, torsoMaterial);
    torso.position.y = measurements.height / 200;
    scene.add(torso);
    
    // Create head (sphere scaled by height)
    const headRadius = measurements.height / 400;
    const headGeometry = new THREE.SphereGeometry(headRadius, 16, 12);
    const headMaterial = new THREE.MeshBasicMaterial({ color: 0xFFDBB6 });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = measurements.height / 100 + headRadius;
    scene.add(head);
    
    // Create shoulders (box scaled by shoulder measurement)
    const shoulderGeometry = new THREE.BoxGeometry(
      measurements.shoulders / 100,
      measurements.height / 200,
      measurements.bust / 300
    );
    const shoulderMaterial = new THREE.MeshBasicMaterial({ color: 0x8B7355 });
    const shoulders = new THREE.Mesh(shoulderGeometry, shoulderMaterial);
    shoulders.position.y = measurements.height / 120;
    scene.add(shoulders);
    
    // Export to GLB
    const exporter = new GLTFExporter();
    
    return new Promise((resolve, reject) => {
      exporter.parse(
        scene,
        (gltf) => {
          if (gltf instanceof ArrayBuffer) {
            resolve(gltf);
          } else {
            // Convert JSON to binary GLB
            const jsonString = JSON.stringify(gltf);
            const buffer = new TextEncoder().encode(jsonString);
            resolve(buffer);
          }
        },
        (error) => reject(error),
        { binary: true }
      );
    });
  } catch (error) {
    throw new Error(`GLB generation failed: ${error}`);
  }
}

// Helper function to upload GLB to Supabase
async function uploadGLBToSupabase(userId: string, avatarId: number, glbBuffer: ArrayBuffer): Promise<string> {
  try {
    const fileName = `users/${userId}/avatars/${avatarId}.glb`;
    
    const { data, error } = await supabaseAdmin.storage
      .from('avatars')
      .upload(fileName, glbBuffer, {
        contentType: 'model/gltf-binary',
        upsert: true
      });

    if (error) {
      throw new Error(`Supabase upload failed: ${error.message}`);
    }

    // Generate signed URL (7 days expiry)
    const { data: signedUrlData, error: urlError } = await supabaseAdmin.storage
      .from('avatars')
      .createSignedUrl(fileName, 7 * 24 * 60 * 60); // 7 days in seconds

    if (urlError) {
      throw new Error(`Signed URL generation failed: ${urlError.message}`);
    }

    return signedUrlData.signedUrl;
  } catch (error) {
    throw new Error(`File upload failed: ${error}`);
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get avatars for authenticated user only - using existing userAvatars table
    const userAvatarData = await db.select()
      .from(userAvatars)
      .where(eq(userAvatars.userId, session.user.id))
      .orderBy(desc(userAvatars.updatedAt))
      .limit(limit)
      .offset(offset);

    // Parse JSON fields for response and map to expected format
    const parsedAvatars = userAvatarData.map(avatar => ({
      id: avatar.id,
      userId: avatar.userId,
      measurements: typeof avatar.measurements === 'string' ? JSON.parse(avatar.measurements) : avatar.measurements,
      fittedModelUrl: null, // userAvatars doesn't have this field yet
      createdAt: avatar.updatedAt // using updatedAt as createdAt
    }));

    return NextResponse.json(parsedAvatars);
  } catch (error) {
    console.error('GET avatars error:', error);
    return NextResponse.json({ error: 'Internal server error: ' + error }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { measurements } = body;

    // Enhanced validation
    const validation = validateMeasurements(measurements);
    if (!validation.isValid) {
      return NextResponse.json({ 
        error: 'Invalid measurements provided',
        code: 'INVALID_MEASUREMENTS',
        validationErrors: validation.errors
      }, { status: 400 });
    }

    const now = new Date().toISOString();

    // Check if user already has avatar data - update or create
    const existingAvatar = await db.select()
      .from(userAvatars)
      .where(eq(userAvatars.userId, session.user.id))
      .limit(1);

    let avatarId: number;
    let avatarResult: any[];

    if (existingAvatar.length > 0) {
      // Update existing avatar
      avatarResult = await db.update(userAvatars)
        .set({
          measurements: JSON.stringify(measurements),
          photos: JSON.stringify([]), // Initialize empty photos array
          updatedAt: now
        })
        .where(eq(userAvatars.userId, session.user.id))
        .returning();
      avatarId = avatarResult[0].id;
    } else {
      // Create new avatar
      avatarResult = await db.insert(userAvatars)
        .values({
          userId: session.user.id,
          measurements: JSON.stringify(measurements),
          photos: JSON.stringify([]), // Initialize empty photos array
          unitPreference: 'cm',
          updatedAt: now
        })
        .returning();
      avatarId = avatarResult[0].id;
    }

    try {
      // Generate GLB model
      console.log('Generating GLB for avatar:', avatarId);
      const glbBuffer = await generateAvatarGLB(measurements);
      
      // Upload to Supabase
      console.log('Uploading GLB to Supabase...');
      const signedUrl = await uploadGLBToSupabase(session.user.id, avatarId, glbBuffer);
      
      // Return avatar data with GLB URL
      const responseAvatar = {
        id: avatarResult[0].id,
        userId: avatarResult[0].userId,
        measurements: typeof avatarResult[0].measurements === 'string' 
          ? JSON.parse(avatarResult[0].measurements) 
          : avatarResult[0].measurements,
        fittedModelUrl: signedUrl,
        createdAt: avatarResult[0].updatedAt
      };

      return NextResponse.json(responseAvatar, { status: 201 });

    } catch (glbError) {
      console.error('GLB generation/upload error:', glbError);
      
      // Return avatar data without GLB URL if generation failed
      const responseAvatar = {
        id: avatarResult[0].id,
        userId: avatarResult[0].userId,
        measurements: typeof avatarResult[0].measurements === 'string' 
          ? JSON.parse(avatarResult[0].measurements) 
          : avatarResult[0].measurements,
        fittedModelUrl: null,
        createdAt: avatarResult[0].updatedAt,
        glbError: 'GLB generation failed but avatar data saved'
      };

      return NextResponse.json(responseAvatar, { status: 201 });
    }

  } catch (error) {
    console.error('POST avatars error:', error);
    return NextResponse.json({ error: 'Internal server error: ' + error }, { status: 500 });
  }
}