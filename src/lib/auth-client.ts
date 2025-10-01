"use client"
import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  baseURL: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
  fetch: (url?: string, options?: RequestInit) => {
    const baseURL = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const fullUrl = url ? new URL(url, baseURL).toString() : '';
    const isAuthEndpoint = fullUrl.startsWith(`${baseURL}/api/auth`);
    
    const token = typeof window !== 'undefined' ? localStorage.getItem("bearer_token") : null;
    const headers = new Headers(options?.headers);
    if (options?.headers) {
      headers.forEach((value, key) => {
        if (key.toLowerCase() !== 'authorization') {
          headers.set(key, value);
        }
      });
    }
    headers.set("Content-Type", "application/json");
    
    if (token && (!isAuthEndpoint || fullUrl.endsWith('/api/auth/session'))) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    
    return {
      ...options,
      credentials: 'include',
      headers,
    };
  }
});

// Export the built-in useSession from better-auth
export const { useSession } = authClient;