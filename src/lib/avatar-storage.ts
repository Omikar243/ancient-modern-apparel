import { supabaseAdmin } from "@/lib/supabase-admin";

const AVATAR_BUCKET = "avatars";

function ensureSupabaseConfigured() {
  const hasSupabaseUrl = Boolean(
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  );
  const hasServiceKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

  if (!hasSupabaseUrl || !hasServiceKey) {
    const missing = [
      !hasSupabaseUrl ? "SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL" : null,
      !hasServiceKey ? "SUPABASE_SERVICE_ROLE_KEY" : null,
    ].filter(Boolean);

    throw new Error(
      `Supabase storage is not configured. Missing: ${missing.join(", ")}.`
    );
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

function resolveAvatarStoragePath(path: string) {
  if (!path || path.startsWith("data:") || !/^(https?:)?\/\//i.test(path)) {
    return path;
  }

  const signedMatch = path.match(/\/storage\/v1\/object\/sign\/[^/]+\/(.+?)(?:\?|$)/i);
  if (signedMatch?.[1]) {
    return decodeURIComponent(signedMatch[1]);
  }

  const publicMatch = path.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+?)(?:\?|$)/i);
  if (publicMatch?.[1]) {
    return decodeURIComponent(publicMatch[1]);
  }

  return path;
}

export async function createAvatarSignedUrl(path: string, expiresIn = 60 * 60) {
  if (!path) {
    throw new Error("Avatar asset path is required to create a signed URL.");
  }

  const storagePath = resolveAvatarStoragePath(path);
  if (/^(https?:)?\/\//i.test(storagePath) || storagePath.startsWith("data:")) {
    return storagePath;
  }

  ensureSupabaseConfigured();

  const { data, error } = await supabaseAdmin.storage
    .from(AVATAR_BUCKET)
    .createSignedUrl(storagePath, expiresIn);

  if (error) {
    throw error;
  }

  return data.signedUrl;
}
