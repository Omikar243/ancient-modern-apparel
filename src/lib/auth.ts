import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import { bearer } from "better-auth/plugins";
import {
  safeDeleteUserFromSupabaseAuth,
  safeSyncUserToSupabaseAuth,
} from "@/lib/supabase-user-sync";

type AuthInstance = ReturnType<typeof betterAuth>;

let _auth: AuthInstance | null = null;

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

function getTrustedOrigins(siteUrl: string) {
  if (process.env.NODE_ENV === "development") {
    return ["*"];
  }

  return Array.from(
    new Set(
      [
        siteUrl,
        process.env.BETTER_AUTH_URL,
        process.env.NEXT_PUBLIC_SITE_URL,
        process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
      ].filter((value): value is string => Boolean(value))
    )
  );
}

function getAuth() {
  if (!_auth) {
    const siteUrl = getConfiguredSiteUrl();

    _auth = betterAuth({
      database: drizzleAdapter(db, {
        provider: "sqlite",
      }),
      emailAndPassword: {    
        enabled: true,
        requireEmailVerification: false
      },
      session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24, // Update every 24 hours
      },
      baseURL: siteUrl,
      trustedOrigins: getTrustedOrigins(siteUrl),
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
  }
  return _auth;
}

export const auth = new Proxy({} as AuthInstance, {
  get(_, prop) {
    const instance = getAuth();
    const value = instance[prop as keyof AuthInstance];

    if (typeof value === "function") {
      return value.bind(instance);
    }

    return value;
  },
}) as AuthInstance;

export async function getCurrentUser(headers: Headers) {
  const session = await getAuth().api.getSession({ headers });
  return session?.user || null;
}
