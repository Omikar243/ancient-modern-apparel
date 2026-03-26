"use client";

import { NavBar } from "./NavBar";
import { Footer } from "./Footer";
import { Toaster } from "@/components/ui/sonner";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

interface ClientLayoutProps {
  children: ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  return (
    <>
      {!isHomePage && <NavBar />}
      {children}
      {!isHomePage && <Footer />}
      <Toaster />
    </>
  );
}