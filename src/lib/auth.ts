import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { NextRequest } from 'next/server';
import { db } from "@/db";
import { bearer } from "better-auth/plugins";
import { Headers } from 'next/server'

let _auth: ReturnType<typeof betterAuth> | null = null;

function getAuth() {
  if (!_auth) {
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
      baseURL: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
      trustedOrigins: ["http://localhost:3000"],
      plugins: [bearer()],
    });
  }
  return _auth;
}

// Export the auth instance directly - no proxy needed
export const auth = getAuth();

export async function getCurrentUser(headers: Headers) {
  const session = await auth.api.getSession({ headers });
  return session?.user || null;
}