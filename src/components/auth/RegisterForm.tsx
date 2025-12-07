"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import Link from "next/link";
import { toast } from "sonner";

export const RegisterForm = () => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirm) {
      toast.error("Please fill in all fields");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await authClient.signUp.email({
        email,
        name,
        password,
      });
      console.log("Registration response:", { data, error });
      if (error?.code) {
        const errorMap: Record<string, string> = {
          USER_ALREADY_EXISTS: "Email already registered",
          USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "Email already registered. Please use another email.",
          INVALID_EMAIL: "Please enter a valid email address",
          INVALID_PASSWORD: "Password must meet security requirements"
        };
        toast.error(errorMap[error.code] || "Registration failed");
        setLoading(false);
        return;
      }
      toast.success("Account created! Please check your email for verification, then log in.");
      router.push("/login?registered=true");
    } catch (err) {
      console.error("Registration error:", err);
      toast.error("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto font-serif">
      {/* OPAQUE/TRANSPARENT CARD: Merriweather Font Applied with Bold 700 Weight */}
      <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-md rounded-2xl relative overflow-hidden">
        {/* Decorative top gold strip */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gold-muted" />

        <CardHeader className="text-center space-y-3 pt-12 pb-6">
          <h1 className="text-3xl font-bold text-neutral-900">
            Create Account
          </h1>
          <p className="text-neutral-700 text-sm italic font-bold">
            Join the exclusive circle
          </p>
        </CardHeader>

        <form onSubmit={onSubmit}>
          <CardContent className="space-y-5 px-8 sm:px-12">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-neutral-800">
                Full Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
                className="h-11 rounded-lg border-neutral-300/50 bg-white/50 px-3 text-neutral-900 placeholder:text-neutral-500/70 focus:border-gold-muted focus-visible:ring-0 transition-all font-serif font-medium"
                placeholder="Enter your full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-neutral-800">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="h-11 rounded-lg border-neutral-300/50 bg-white/50 px-3 text-neutral-900 placeholder:text-neutral-500/70 focus:border-gold-muted focus-visible:ring-0 transition-all font-serif font-medium"
                placeholder="Enter your email address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-neutral-800">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="h-11 rounded-lg border-neutral-300/50 bg-white/50 px-3 text-neutral-900 placeholder:text-neutral-500/70 focus:border-gold-muted focus-visible:ring-0 transition-all font-serif font-medium"
                placeholder="Create a password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm" className="text-sm font-medium text-neutral-800">
                Confirm Password
              </Label>
              <Input
                id="confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                autoComplete="new-password"
                className="h-11 rounded-lg border-neutral-300/50 bg-white/50 px-3 text-neutral-900 placeholder:text-neutral-500/70 focus:border-gold-muted focus-visible:ring-0 transition-all font-serif font-medium"
                placeholder="Confirm your password"
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-6 pt-6 pb-12 px-8 sm:px-12">
            <Button
              type="submit"
              className="w-full h-12 rounded-full bg-gold-muted text-white hover:bg-gold-hover text-sm font-bold shadow-md hover:shadow-lg transition-all duration-300 font-serif"
              disabled={loading}
            >
              {loading ? "Registering..." : "Register"}
            </Button>
            <p className="text-center text-xs text-neutral-600 font-bold">
              Already a member?{" "}
              <Link className="text-gold-muted hover:text-gold-hover hover:underline transition-colors ml-1" href="/login">
                Sign In
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default RegisterForm;
