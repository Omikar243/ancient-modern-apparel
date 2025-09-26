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
    <div className="flex items-center gap-6">
      <Link href="/avatar" className="text-sm text-muted-foreground hover:text-foreground">
        Avatar
      </Link>
      <Link href="/catalog" className="text-sm text-muted-foreground hover:text-foreground">
        Catalog
      </Link>
      <Link href="/preview" className="text-sm text-muted-foreground hover:text-foreground">
        Preview
      </Link>
      <Link href="/cart" className="text-sm text-muted-foreground hover:text-foreground">
        Cart
      </Link>
      {session ? (
        <div className="flex items-center gap-4">
          <Link href="/profile" className="text-sm text-muted-foreground hover:text-foreground">
            Profile ({session.user.name || session.user.email})
          </Link>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      ) : (
        <>
          <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">
            Login
          </Link>
          <Link
            href="/register"
            className="text-sm rounded-md bg-primary text-primary-foreground px-3 py-1.5 hover:bg-primary/90"
          >
            Register
          </Link>
        </>
      )}
    </div>
  );
}