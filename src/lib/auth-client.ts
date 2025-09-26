"use client"
import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'),
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