import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Login | IndiFusion Wear",
};

// Add a small client-side redirect to avoid showing login when already authenticated
// without turning the whole page into a client component.
import { useSession } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

function RedirectIfAuthenticated() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const search = useSearchParams();

  useEffect(() => {
    if (isPending) return;
    if (session?.user) {
      const dest = search.get("redirect") || "/";
      router.replace(dest);
    }
  }, [session, isPending, router, search]);

  return null;
}

export default function LoginPage() {
  return (
    <main className="min-h-[calc(100vh-64px)] px-4 py-12">
      {/* client-side guard */}
      <RedirectIfAuthenticated />
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-semibold text-center mb-8">Welcome back</h1>
        <LoginForm />
      </div>
    </main>
  );
}