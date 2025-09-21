import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Login | IndiFusion Wear",
};

export default function LoginPage() {
  return (
    <main className="min-h-[calc(100vh-64px)] px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-semibold text-center mb-8">Welcome back</h1>
        <LoginForm />
      </div>
    </main>
  );
}