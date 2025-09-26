"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/lib/auth-client";

export const RedirectIfAuthenticated = () => {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const search = useSearchParams();

  useEffect(() => {
    if (isPending) return;
    if (session?.user) {
      const dest = search.get("redirect") || "/";
      router.replace(dest);
    }
  }, [session, isPending, router, search]);

  return null;
};