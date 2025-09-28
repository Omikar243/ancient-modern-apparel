"use client";

import { NavBar } from "./NavBar";
import { Footer } from "./Footer";
import { Toaster } from "@/components/ui/sonner";
import type { ReactNode } from "react";

interface ClientLayoutProps {
  children: ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <>
      <NavBar />
      {children}
      <Footer />
      <Toaster />
    </>
  );
}