import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import { bearer } from "better-auth/plugins";
import {
  safeDeleteUserFromSupabaseAuth,
  safeSyncUserToSupabaseAuth,
} from "@/lib/supabase-user-sync";

function getConfiguredSiteUrl() {
  if (process.env.BETTER_AUTH_URL) {
    return process.env.BETTER_AUTH_URL;
  }

  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}

function normalizeOrigin(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  try {
    return new URL(trimmed).origin;
  } catch {
    return null;
  }
}

function parseTrustedOriginsFromEnv() {
  const raw = process.env.BETTER_AUTH_TRUSTED_ORIGINS;
  if (!raw) {
    return [];
  }

  return raw
    .split(",")
    .map((item) => normalizeOrigin(item))
    .filter((value): value is string => Boolean(value));
}

function getTrustedOrigins(siteUrl: string) {
  if (process.env.NODE_ENV === "development") {
    return ["*"];
  }

  const autoOrigins = [
    siteUrl,
    process.env.BETTER_AUTH_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : null,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  ]
    .map((value) => normalizeOrigin(value))
    .filter((value): value is string => Boolean(value));

  return Array.from(
    new Set(
      [...autoOrigins, ...parseTrustedOriginsFromEnv()]
    )
  );
}

const siteUrl = getConfiguredSiteUrl();
const trustedOrigins = getTrustedOrigins(siteUrl);

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update every 24 hours
  },
  baseURL: siteUrl,
  trustedOrigins,
  plugins: [bearer()],
  telemetry: {
    enabled: false,
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await safeSyncUserToSupabaseAuth(user);
        },
      },
      update: {
        after: async (user) => {
          await safeSyncUserToSupabaseAuth(user);
        },
      },
      delete: {
        after: async (user) => {
          await safeDeleteUserFromSupabaseAuth(user);
        },
      },
    },
  },
});

export async function getCurrentUser(headers: Headers) {
  const session = await auth.api.getSession({ headers });
  return session?.user || null;
}
