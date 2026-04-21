"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useAuthSession } from "@/lib/useAuthSession";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ThemeToggle";

export function NavBar({ className }: { className?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useAuthSession();

  const handleSignOut = async () => {
    try {
      const { error } = await authClient.signOut();
      if (error?.code) {
        toast.error(error.code);
        return;
      }
      localStorage.removeItem("bearer_token");
      toast.success("Logged out successfully");
      router.push("/");
      router.refresh(); // Refresh to update session
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  const isActive = (path: string) => pathname === path ? "text-primary font-semibold underline underline-offset-4" : "text-foreground hover:text-primary transition-colors hover:underline underline-offset-4";

  if (isPending) {
    return (
      <nav className={cn("flex items-center space-x-6", className)}>
        {/* Simplified loading nav */}
        <div className="animate-pulse bg-muted rounded px-4 py-2">Loading...</div>
      </nav>
    );
  }

  return (
    <nav className={cn("flex items-center space-x-6", className)}>
      <ThemeToggle />
      <Link href="/" className={isActive("/")}>
        Home
      </Link>
      <Link href="/avatar" className={isActive("/avatar")}>
        Avatar
      </Link>
      <Link href="/catalog" className={isActive("/catalog")}>
        Catalog
      </Link>
      <Link href="/preview" className={isActive("/preview")}>
        Preview
      </Link>
      <Link href="/cart" className={isActive("/cart")}>
        Cart
      </Link>

      {/* Conditional auth UI */}
      {session?.user ? (
        // Authenticated user
        <>
          <Link href="/profile" className={isActive("/profile")}>
            Profile
          </Link>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleSignOut}
            className="text-foreground hover:text-destructive hover:bg-transparent border-none"
          >
            Logout
          </Button>
        </>
      ) : (
        // Unauthenticated
        <>
          <Button variant="ghost" size="sm" asChild className="text-foreground hover:text-primary hover:bg-transparent border-none">
            <Link href={`/login?redirect=${encodeURIComponent(pathname)}`}>Login</Link>
          </Button>
          <Button variant="outline" size="sm" asChild className="border-primary text-primary hover:bg-primary">
            <Link href="/register">Register</Link>
          </Button>
        </>
      )}
    </nav>
  );
}
