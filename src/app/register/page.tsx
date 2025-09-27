import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Initiation | IndiFusion Wear",
};

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/5 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-4xl mx-auto text-center">
        <h1 className="text-5xl font-serif font-bold text-foreground mb-4 leading-tight">The Genesis</h1>
        <RegisterForm />
      </div>
    </main>
  );
}