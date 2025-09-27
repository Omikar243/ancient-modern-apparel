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
    <div className="w-full max-w-lg mx-auto">
      {/* Subtle background */}
      <div className="relative bg-gradient-to-br from-background to-muted/30 rounded-3xl p-8 border border-border/20 shadow-xl backdrop-blur-sm">
        <Card className="border-0 bg-transparent">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-4xl font-serif font-bold text-foreground">Initiate the Legacy</CardTitle>
            <CardDescription className="text-lg text-muted-foreground leading-relaxed">
              Forge your place among the artisans. Begin the eternal weave.
            </CardDescription>
          </CardHeader>
          <form onSubmit={onSubmit} className="space-y-6">
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base font-medium text-foreground">Moniker</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                  autoComplete="name" 
                  className="h-12 rounded-xl text-lg bg-card/50 border-border/50 focus:border-primary focus:ring-primary/20"
                  placeholder="Your timeless name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-base font-medium text-foreground">Epistle</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  autoComplete="email" 
                  className="h-12 rounded-xl text-lg bg-card/50 border-border/50 focus:border-primary focus:ring-primary/20"
                  placeholder="Your sacred address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-base font-medium text-foreground">Cipher</Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  autoComplete="off" 
                  className="h-12 rounded-xl text-lg bg-card/50 border-border/50 focus:border-primary focus:ring-primary/20"
                  placeholder="Craft your passage (min 8)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm" className="text-base font-medium text-foreground">Affirmation</Label>
                <Input 
                  id="confirm" 
                  type="password" 
                  value={confirm} 
                  onChange={(e) => setConfirm(e.target.value)} 
                  required 
                  autoComplete="off" 
                  className="h-12 rounded-xl text-lg bg-card/50 border-border/50 focus:border-primary focus:ring-primary/20"
                  placeholder="Echo the cipher"
                />
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
                    Weaving Your Essence...
                  </>
                ) : (
                  "Eternalize Your Form"
                )}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Acolyte already? <Link className="text-primary hover:underline font-medium transition-colors" href="/login">Cross the Threshold</Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default RegisterForm;