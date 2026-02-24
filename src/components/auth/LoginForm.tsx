"use client";

import { useState, useEffect } from "react";
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
  const [loginSuccess, setLoginSuccess] = useState(false);
  const { data: session, refetch } = useSession();
  
  const redirectTo = search.get("redirect") || "/";

  // Watch for session to become available after login
  useEffect(() => {
    if (loginSuccess && session?.user) {
      toast.success("Logged in successfully!");
      router.push(redirectTo);
    }
  }, [loginSuccess, session, redirectTo, router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter your email and password");
      return;
    }
    setLoading(true);
    try {
      // Sign in
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
      
      // Extract session token from response
      const sessionToken = (data as any)?.session?.token || (data as any)?.token || (data as any)?.sessionToken;
      
      if (sessionToken) {
        // Store token for API requests
        localStorage.setItem("bearer_token", sessionToken);
        
        // Also set as cookie for any server-side needs
        document.cookie = `bearer_token=${sessionToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
      }
      
      // Mark login as successful and trigger session refresh
      setLoginSuccess(true);
      await refetch();
      
      // If session is already available, the useEffect will handle redirect
      // Otherwise fall back to direct navigation after a delay
      setTimeout(() => {
        if (!session?.user) {
          router.push(redirectTo);
        }
      }, 500);
      
    } catch (err) {
      console.error("Login error:", err);
      toast.error("Login failed. Please try again.");
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
                disabled={loading || loginSuccess}
              >
                {loading || loginSuccess ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground mr-2"></div>
                    {loginSuccess ? "Redirecting..." : "Signing in..."}
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