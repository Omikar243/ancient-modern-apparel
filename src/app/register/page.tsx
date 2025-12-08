import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";
import LuxuryRegisterBackground from "@/components/layout/LuxuryRegisterBackground";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Create Account | IndiFusion Wear",
};

export default function RegisterPage() {
  return (
    <main className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      <LuxuryRegisterBackground />
      <div className="w-full px-4 z-10">
        <Suspense fallback={<div className="text-center text-[#C5A059]">Loading...</div>}>
          <RegisterForm />
        </Suspense>
      </div>
    </main>
  );
}