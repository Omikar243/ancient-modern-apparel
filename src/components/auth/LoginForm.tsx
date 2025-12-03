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
      // Get the intended redirect destination
      const redirectTo = search.get("redirect") || "/";
      
      // Sign in WITHOUT callbackURL to avoid better-auth's internal redirect
      const { data, error } = await authClient.signIn.email({
        email,
        password,
        rememberMe,
      });
      
      if (error?.code) {
        let errorMessage = "Login failed. Please try again.";
        if (error.code === "BAD_EMAIL_PASSWORD") {
          errorMessage = "Invalid email or password. Please make sure you have already registered an account and try again.";
        }
        toast.error(errorMessage);
        setLoading(false);
        return;
      }
      
      // After successful login, fetch the bearer token using better-auth's bearer plugin
      try {
        const tokenResponse = await fetch("/api/auth/get-bearer", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });
        
        if (tokenResponse.ok) {
          const tokenData = await tokenResponse.json();
          const token = tokenData.token;
          
          if (token) {
            // Store token in both localStorage and cookie
            localStorage.setItem("bearer_token", token);
            document.cookie = `bearer_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
          }
        }
      } catch (tokenError) {
        console.error("Failed to fetch bearer token:", tokenError);
        // Continue anyway - session cookie might still work
      }
      
      // Refresh session state
      await refetch();
      
      toast.success("Logged in successfully!");
      
      // Force a full page reload to ensure middleware processes the authentication
      window.location.href = redirectTo;
      
    } catch (err) {
      console.error("Detailed login error:", err);
      toast.error("Login failed - check console for details");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Subtle background */}
      <div className="relative bg-gradient-to-br from-background to-muted/30 rounded-3xl p-8 border border-border/20 shadow-xl backdrop-blur-sm">
        {search.get("registered") === "true" && (
          <div className="mb-6 p-4 bg-accent/10 rounded-2xl text-sm text-accent-foreground">
            Account created successfully! Please log in to continue.
          </div>
        )}
        <Card className="border-0 bg-transparent">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-4xl font-serif font-bold text-foreground">Welcome Back</CardTitle>
            <CardDescription className="text-lg text-muted-foreground leading-relaxed">
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <form onSubmit={onSubmit} className="space-y-6">
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-base font-medium text-foreground">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  autoComplete="email" 
                  className="h-12 rounded-xl text-lg bg-card/50 border-border/50 focus:border-primary focus:ring-primary/20"
                  placeholder="Enter your email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-base font-medium text-foreground">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  autoComplete="off" 
                  className="h-12 rounded-xl text-lg bg-card/50 border-border/50 focus:border-primary focus:ring-primary/20"
                  placeholder="Enter your password"
                />
              </div>
              <div className="flex items-center gap-3 p-4 bg-muted/20 rounded-xl">
                <Checkbox id="remember" checked={rememberMe} onCheckedChange={(v) => setRememberMe(!!v)} className="border-foreground/30" />
                <Label htmlFor="remember" className="text-sm text-muted-foreground font-medium leading-relaxed">
                  Remember me
                </Label>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 pt-0">
              <Button 
                type="submit" 
                className="w-full h-14 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 text-lg font-serif font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground mr-2"></div>
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Don't have an account? <Link className="text-primary hover:underline font-medium transition-colors" href="/register">Sign up</Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};