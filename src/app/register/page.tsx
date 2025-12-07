import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { Suspense } from "react";
import LuxuryRegisterBackground from "@/components/layout/LuxuryRegisterBackground";

export const metadata: Metadata = {
  title: "Initiation | IndiFusion Wear",
};

export default function RegisterPage() {
  return (
    <main className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      <LuxuryRegisterBackground />
      <div className="w-full max-w-md z-10">
        <Suspense fallback={<div className="flex items-center justify-center text-gold-muted">Loading...</div>}>
          <RegisterForm />
        </Suspense>
      </div>
    </main>
  );
}
