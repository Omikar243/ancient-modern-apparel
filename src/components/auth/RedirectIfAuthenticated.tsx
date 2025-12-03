"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/lib/auth-client";

export const RedirectIfAuthenticated = () => {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const search = useSearchParams();

  useEffect(() => {
    // Only redirect if we have a confirmed session
    if (isPending) return;
    if (session?.user) {
      const dest = search.get("redirect") || "/";
      // Use replace to avoid back button issues
      router.replace(dest);
    }
  }, [session, isPending, router, search]);

  // Don't render anything to avoid flash
  return null;
};