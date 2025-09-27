"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useEffect } from "react";

export function NavBar() {
  const router = useRouter();
  const { data: session, isPending, refetch } = useSession();

  useEffect(() => {
    // Refetch on mount if token exists to handle hydration mismatches
    const token = localStorage.getItem("bearer_token");
    if (token && (!session || !isPending)) {
      refetch();
    } else if (token && isPending) {
      // Fallback refetch after pending resolves
      const timer = setTimeout(() => refetch(), 100);
      return () => clearTimeout(timer);
    }
  }, [session, isPending, refetch]);

  const handleLogout = async () => {
    const { error } = await authClient.signOut();
    if (error?.code) {
      toast.error(error.code);
    } else {
      localStorage.removeItem("bearer_token");
      router.push("/");
    }
  };

  if (isPending) {
    return <div className="text-sm">Loading...</div>;
  }

  return (
    <div className="flex items-center gap-1 sm:gap-2 lg:gap-4 whitespace-nowrap overflow-x-auto pb-1 sm:pb-0">
      <Link href="/avatar" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground px-1 py-0.5 sm:px-2">
        Avatar
      </Link>
      <Link href="/catalog" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground px-1 py-0.5 sm:px-2">
        Catalog
      </Link>
      <Link href="/preview" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground px-1 py-0.5 sm:px-2">
        Preview
      </Link>
      <Link href="/cart" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground px-1 py-0.5 sm:px-2">
        Cart
      </Link>
      {session ? (
        <div className="flex items-center gap-1 sm:gap-2 lg:gap-4">
          <Link href="/profile" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground px-1 py-0.5 truncate max-w-[120px] sm:max-w-none">
            Profile ({session.user.name || session.user.email})
          </Link>
          <Button variant="ghost" size="sm" className="h-7 sm:h-8 px-2 text-xs sm:text-sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      ) : (
        <>
          <Link href="/login" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground px-1 py-0.5 sm:px-2">
            Login
          </Link>
          <Link
            href="/register"
            className="text-xs sm:text-sm rounded-md bg-primary text-primary-foreground px-2 sm:px-3 py-1 sm:py-1.5 hover:bg-primary/90 whitespace-nowrap"
          >
            Register
          </Link>
        </>
      )}
    </div>
  );
}