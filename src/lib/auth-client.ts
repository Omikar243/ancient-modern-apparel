"use client"
import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  baseURL: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
  fetchOptions: {
    credentials: 'include' as RequestCredentials,
    onRequest: (ctx) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem("bearer_token") : null;
      if (token) {
        ctx.options.headers = {
          ...ctx.options.headers,
          Authorization: `Bearer ${token}`,
        };
      }
    },
    onSuccess: async (ctx) => {
      // Store bearer token from response if available
      try {
        const data = ctx.data as any;
        const token = data?.session?.token || data?.token;
        if (token && typeof window !== 'undefined') {
          localStorage.setItem("bearer_token", token);
          document.cookie = `bearer_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
        }
      } catch (e) {
        // Ignore parsing errors
      }
    }
  }
});

// Export the built-in useSession from better-auth
export const { useSession } = authClient;