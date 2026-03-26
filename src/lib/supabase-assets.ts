const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");

function normalizePublicPath(path: string) {
  return path.replace(/^\/+/, "");
}

export function getSupabasePublicUrl(path: string) {
  if (!supabaseUrl) {
    return "";
  }

  return `${supabaseUrl}/storage/v1/object/public/${normalizePublicPath(path)}`;
}
