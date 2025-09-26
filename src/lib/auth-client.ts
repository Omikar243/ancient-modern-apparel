"use client"
import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
   baseURL: typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL,
  fetchOptions: () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem("bearer_token") : null;
    const headers = new Headers();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    headers.set("Content-Type", "application/json");
    return {
      credentials: 'include',
      headers,
    };
  }
});

// Export the built-in useSession from better-auth
export const { useSession } = authClient;