"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";

export const LoginForm = () => {
  const router = useRouter();
  const search = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const { refetch } = useSession();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter your email and password");
      return;
    }
    setLoading(true);
    try {
      const callbackURL = search.get("redirect") || "/";
      await authClient.signIn.email({
        email,
        password,
        rememberMe,
        callbackURL,
      }, {
        onSuccess: (ctx) => {
          const authToken = ctx.response?.headers?.get("set-auth-token");
          if (authToken) {
            localStorage.setItem("bearer_token", authToken);
          }
          refetch();
          toast.success("Logged in successfully!");
          window.location.href = callbackURL;
        },
        onError: (ctx) => {
          console.error("Auth error code:", ctx.error.code);
          let errorMessage = "Login failed. Please try again.";
          if (ctx.error.code === "BAD_EMAIL_PASSWORD") {
            errorMessage = "Invalid email or password. Please make sure you have already registered an account and try again.";
          }
          toast.error(errorMessage);
        }
      });
    } catch (err) {
      console.error("Detailed login error:", err);
      toast.error("Login failed - check console for details");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {search.get("registered") === "true" && (
        <div className="mb-4 text-sm text-green-600">Account created! Please log in.</div>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Log in</CardTitle>
          <CardDescription>Welcome back. Enter your credentials to continue.</CardDescription>
        </CardHeader>
        <form onSubmit={onSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="off" />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="remember" checked={rememberMe} onCheckedChange={(v) => setRememberMe(!!v)} />
              <Label htmlFor="remember" className="text-sm text-muted-foreground">Remember me</Label>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Log in"}
            </Button>
            <p className="text-sm text-muted-foreground">
              Don't have an account? <Link className="underline" href="/register">Register</Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};