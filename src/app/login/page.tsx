import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";
import { RedirectIfAuthenticated } from "@/components/auth/RedirectIfAuthenticated";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Login | IndiFusion Wear",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/5 flex items-center justify-center py-12 px-4">
      <Suspense fallback={<div className="flex items-center justify-center text-primary">Loading...</div>}>
        <RedirectIfAuthenticated />
        <LoginForm />
      </Suspense>
    </main>
  );
}