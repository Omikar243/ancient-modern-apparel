"use client"
import { createAuthClient } from "better-auth/react"
import { useState, useEffect, useCallback } from "react"

const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return 'http://localhost:3000';
};

function persistBearerToken(token: string | null | undefined) {
  if (typeof window === "undefined" || !token) {
    return;
  }

  localStorage.setItem("bearer_token", token);
  document.cookie = `bearer_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
  fetchOptions: {
    credentials: 'include' as RequestCredentials,
    onRequest: (ctx) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem("bearer_token") : null;
      if (token) {
        ctx.headers.set("Authorization", `Bearer ${token}`);
      }
    },
    onSuccess: async (ctx) => {
      try {
        const data = ctx.data as any;
        const responseToken = ctx.response.headers.get("set-auth-token");
        const dataToken = data?.session?.token || data?.token || data?.sessionToken;
        persistBearerToken(responseToken || dataToken);
      } catch (e) {
        // Ignore parsing errors
      }
    }
  }
});

export function clearClientAuthState() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem("bearer_token");
  document.cookie = "bearer_token=; path=/; max-age=0; SameSite=Lax";
  document.cookie = "bearer_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
}

export async function hydrateBearerTokenFromServer() {
  const response = await fetch("/api/auth/get-bearer", {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as { token?: string };
  persistBearerToken(data.token);
  return data.token ?? null;
}

// Custom session hook that properly handles bearer tokens in iframe environments
export const useSession = () => {
  const [session, setSession] = useState<any>(null);
  const [isPending, setIsPending] = useState(true);

  const fetchSession = useCallback(async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("bearer_token") : null;
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/auth/get-session', {
        method: 'GET',
        headers,
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        const normalized = data?.user
          ? {
              user: {
                id: data.user.id,
                email: data.user.email,
                name: data.user.name,
              },
              expires: data.session?.expiresAt ?? null,
            }
          : { user: null, expires: null };

        setSession(normalized);
        return normalized;
      } else {
        setSession(null);
        return null;
      }
    } catch (error) {
      console.error("Session fetch error:", error);
      setSession(null);
      return null;
    } finally {
      setIsPending(false);
    }
  }, []);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  const refetch = useCallback(() => {
    setIsPending(true);
    return fetchSession();
  }, [fetchSession]);

  return {
    data: session,
    isPending,
    refetch,
  };
};
