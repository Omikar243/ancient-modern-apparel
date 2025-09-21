import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Register | IndiFusion Wear",
};

export default function RegisterPage() {
  return (
    <main className="min-h-[calc(100vh-64px)] px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-semibold text-center mb-8">Create your account</h1>
        <RegisterForm />
      </div>
    </main>
  );
}