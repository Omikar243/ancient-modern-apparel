"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function NavBar({ className }: { className?: string }) {
  return (
    <nav className={cn("flex items-center space-x-6", className)}>
      <Link href="/avatar" className="text-foreground hover:text-primary transition-colors hover:underline underline-offset-4">
        Avatar
      </Link>
      <Link href="/catalog" className="text-foreground hover:text-primary transition-colors hover:underline underline-offset-4">
        Catalog
      </Link>
      <Link href="/preview" className="text-foreground hover:text-primary transition-colors hover:underline underline-offset-4">
        Preview
      </Link>
      <Button variant="ghost" size="sm" asChild className="text-foreground hover:text-primary hover:bg-transparent border-none">
        <Link href="/login">Login</Link>
      </Button>
    </nav>
  );
}