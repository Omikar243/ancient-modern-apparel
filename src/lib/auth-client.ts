"use client"
import { createAuthClient } from "better-auth/react"
import { useState, useEffect, useCallback } from "react"

const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return 'http://localhost:3000';
};

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
  fetchOptions: {
    credentials: 'include' as RequestCredentials,
    onRequest: (ctx) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem("bearer_token") : null;
      if (token && ctx.options) {
        ctx.options.headers = {
          ...(ctx.options.headers || {}),
          Authorization: `Bearer ${token}`,
        };
      }
    },
    onSuccess: async (ctx) => {
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

// Custom session hook that properly handles bearer tokens in iframe environments
export const useSession = () => {
  const [session, setSession] = useState<any>(null);
  const [isPending, setIsPending] = useState(true);

  const fetchSession = useCallback(async () => {
    try {
      const token = localStorage.getItem("bearer_token");
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${getBaseURL()}/api/auth/get-session`, {
        method: 'GET',
        headers,
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setSession(data);
      } else {
        setSession(null);
      }
    } catch (error) {
      console.error("Session fetch error:", error);
      setSession(null);
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