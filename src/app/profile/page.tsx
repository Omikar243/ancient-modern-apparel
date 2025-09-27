"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function ProfilePage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login?redirect=/profile");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/5 flex items-center justify-center py-32">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-6"></div>
          <p className="text-xl text-muted-foreground font-serif">Awakening Your Sanctum...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const user = session.user;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/5 py-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Elegant Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-serif font-bold text-foreground mb-4 leading-tight">Your Eternal Sanctum</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">A bastion of your creations and essence.</p>
        </div>

        <Card className="border-0 shadow-2xl backdrop-blur-sm bg-background/60">
          <CardHeader className="text-center space-y-4">
            <CardTitle className="text-4xl font-serif font-bold text-foreground">Artisan {user.name || "of Legacy"}</CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
              {user.email} - Guardian of Timeless Forms
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 pt-0">
            <div className="grid md:grid-cols-2 gap-8 p-8 bg-muted/20 rounded-3xl">
              <div className="text-center space-y-4">
                <div className="p-6 bg-card/50 rounded-2xl">
                  <p className="text-sm text-muted-foreground uppercase tracking-wide mb-2">Moniker</p>
                  <p className="text-2xl font-serif font-bold text-foreground">{user.name || "N/A"}</p>
                </div>
                <div className="p-6 bg-card/50 rounded-2xl">
                  <p className="text-sm text-muted-foreground uppercase tracking-wide mb-2">Epistle</p>
                  <p className="text-xl font-serif text-foreground">{user.email}</p>
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-center text-lg text-muted-foreground">Navigate Your Realms</p>
                <div className="space-y-3">
                  <Button asChild className="w-full h-14 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 font-serif text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                    <Link href="/avatar">Refine Your Silhouette</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full h-14 rounded-full border-foreground/20 hover:border-primary font-serif text-lg transition-all duration-300">
                    <Link href="/catalog">Explore the Codex</Link>
                  </Button>
                  <Button asChild variant="ghost" className="w-full h-14 hover:bg-accent/10 font-serif text-lg transition-all duration-300">
                    <Link href="/preview">Unveil Masterpieces</Link>
                  </Button>
                  <Button asChild variant="destructive" className="w-full h-14 rounded-full font-serif text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                    <Link href="/logout">Relinquish the Sanctum</Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center space-y-4 mt-16">
          <p className="text-sm text-muted-foreground italic font-serif max-w-2xl mx-auto">
            Your legacy endures in every thread. The atelier awaits your command.
          </p>
        </div>
      </div>
    </div>
  );
}