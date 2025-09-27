import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";
import { RedirectIfAuthenticated } from "@/components/auth/RedirectIfAuthenticated";

export const metadata: Metadata = {
  title: "Atelier Access | IndiFusion Wear",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/5 flex items-center justify-center py-12 px-4">
      <RedirectIfAuthenticated />
      <div className="w-full max-w-4xl mx-auto text-center mb-8">
        <h1 className="text-5xl font-serif font-bold text-foreground mb-4 leading-tight">The Eternal Return</h1>
        <LoginForm />
      </div>
    </main>
  );
}