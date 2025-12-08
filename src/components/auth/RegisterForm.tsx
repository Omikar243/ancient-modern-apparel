"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
    <div className="w-full max-w-[480px] mx-auto z-10 relative">
      <Card className="border-0 bg-white/10 backdrop-blur-md shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-2xl overflow-hidden">
        <CardHeader className="text-center space-y-4 pt-10 pb-2">
          <CardTitle className="text-4xl font-serif font-light text-[#1a1a1a] tracking-wide">
            Create Account
          </CardTitle>
          <CardDescription className="text-base text-[#666666] font-light tracking-wider uppercase text-xs">
            Join the exclusive circle.
          </CardDescription>
        </CardHeader>
        <form onSubmit={onSubmit} className="space-y-6 p-8 pt-4">
          <CardContent className="space-y-5 p-0">
            <div className="space-y-2">
              <Label htmlFor="name" className="sr-only">Full Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
                className="h-12 border-0 border-b border-[#E5E5E5] rounded-none bg-transparent px-0 text-base placeholder:text-[#999999] focus-visible:ring-0 focus-visible:border-[#C5A059] transition-colors"
                placeholder="Full Name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="sr-only">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="h-12 border-0 border-b border-[#E5E5E5] rounded-none bg-transparent px-0 text-base placeholder:text-[#999999] focus-visible:ring-0 focus-visible:border-[#C5A059] transition-colors"
                placeholder="Email Address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="sr-only">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="h-12 border-0 border-b border-[#E5E5E5] rounded-none bg-transparent px-0 text-base placeholder:text-[#999999] focus-visible:ring-0 focus-visible:border-[#C5A059] transition-colors"
                placeholder="Password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm" className="sr-only">Confirm Password</Label>
              <Input
                id="confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                autoComplete="new-password"
                className="h-12 border-0 border-b border-[#E5E5E5] rounded-none bg-transparent px-0 text-base placeholder:text-[#999999] focus-visible:ring-0 focus-visible:border-[#C5A059] transition-colors"
                placeholder="Confirm Password"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-6 p-0 pt-4">
            <Button
              type="submit"
              className={cn(
                "w-full h-12 rounded-none bg-[#C5A059] text-white text-sm font-medium tracking-widest uppercase hover:bg-[#B08D4C] transition-all duration-300 shadow-sm",
                loading && "opacity-80 cursor-not-allowed"
              )}
              disabled={loading}
            >
              {loading ? "Registering..." : "Register"}
            </Button>
            <p className="text-center text-xs text-[#888888] font-light">
              Already a member?{" "}
              <Link className="text-[#1a1a1a] border-b border-[#1a1a1a] pb-0.5 hover:text-[#C5A059] hover:border-[#C5A059] transition-colors" href="/login">
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
