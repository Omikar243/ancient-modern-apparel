import { supabaseAdmin } from "@/lib/supabase-admin";

const AVATAR_BUCKET = "avatars";

function ensureSupabaseConfigured() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase storage is not configured");
  }
}

export function getAvatarBucketName() {
  return AVATAR_BUCKET;
}

export async function ensureAvatarBucket() {
  ensureSupabaseConfigured();

  const { error } = await supabaseAdmin.storage.createBucket(AVATAR_BUCKET, {
    public: false,
  });

  const bucketExists =
    error &&
    (
      (error as { code?: string }).code === "already_exists" ||
      (error as { statusCode?: string }).statusCode === "409" ||
      /already exists|resource already exists/i.test((error as { message?: string }).message || "")
    );

  if (error && !bucketExists) {
    throw error;
  }
}

export async function uploadAvatarAsset(params: {
  path: string;
  buffer: ArrayBuffer;
  contentType: string;
}) {
  ensureSupabaseConfigured();
  await ensureAvatarBucket();

  const { error } = await supabaseAdmin.storage
    .from(AVATAR_BUCKET)
    .upload(params.path, params.buffer, {
      contentType: params.contentType,
      upsert: true,
    });

  if (error) {
    throw error;
  }

  return params.path;
}

export async function createAvatarSignedUrl(path: string, expiresIn = 60 * 60) {
  ensureSupabaseConfigured();

  const { data, error } = await supabaseAdmin.storage
    .from(AVATAR_BUCKET)
    .createSignedUrl(path, expiresIn);

  if (error) {
    throw error;
  }

  return data.signedUrl;
}
