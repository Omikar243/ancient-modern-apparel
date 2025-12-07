import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";
import LuxuryRegisterBackground from "@/components/layout/LuxuryRegisterBackground";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Initiation | IndiFusion Wear",
};

export default function RegisterPage() {
  return (
    <main className="relative min-h-screen flex items-center justify-center py-12 px-4 overflow-hidden">
      <LuxuryRegisterBackground />
      <div className="w-full max-w-4xl mx-auto text-center relative z-10">
        <Suspense fallback={<div className="flex items-center justify-center text-primary">Loading...</div>}>
          <RegisterForm />
        </Suspense>
      </div>
    </main>
  );
}