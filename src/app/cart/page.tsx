"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ShoppingCart, Trash2 } from "lucide-react";

interface CartItem {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
}

export default function Cart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { data: session, isPending } = useSession();
  const router = useRouter();

  // Auth check effect - separate from cart loading
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login?redirect=/cart");
    }
  }, [isPending, session?.user, router]);

  // Cart loading effect - only runs once on mount
  useEffect(() => {
    const storedCart = localStorage.getItem("cart") || "[]";
    try {
      setCartItems(JSON.parse(storedCart));
    } catch {
      setCartItems([]);
    }
    setIsLoaded(true);
  }, []);

  const removeFromCart = (id: number) => {
    const updated = cartItems.filter(item => item.id !== id);
    setCartItems(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
    toast.success("Essence removed from sanctum");
  };

  const total = cartItems.reduce((sum, item) => sum + item.price, 0);

  // Show loading while checking auth
  if (isPending || !isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/5 flex items-center justify-center py-32">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-6"></div>
          <p className="text-xl text-muted-foreground font-serif">Gathering Your Selections...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!session?.user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/5 flex items-center justify-center py-32">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-6"></div>
          <p className="text-xl text-muted-foreground font-serif">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/5 py-20 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Elegant Header */}
        <div className="text-center mb-16 flex items-center justify-center gap-3">
          <ShoppingCart className="w-8 h-8 text-primary" />
          <h1 className="text-5xl font-serif font-bold text-foreground leading-tight">The Sanctum of Selections</h1>
        </div>

        {cartItems.length === 0 ? (
          <Card className="border-0 shadow-2xl backdrop-blur-sm bg-background/60 text-center py-20 rounded-3xl">
            <CardHeader className="space-y-2">
              <CardTitle className="text-3xl font-serif font-bold text-foreground">The Sanctum Stands Empty</CardTitle>
              <CardDescription className="text-lg text-muted-foreground">
                No essences await refinement. Seek in the codex.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="rounded-full px-12 py-4 bg-primary text-primary-foreground font-serif text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <Link href="/catalog">Seek Eternal Threads</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Selections Grid */}
            <div className="space-y-6 mb-12">
              {cartItems.map((item) => (
                <Card key={item.id} className="border-0 shadow-xl backdrop-blur-sm bg-background/60 group hover:shadow-2xl transition-all duration-500 rounded-3xl overflow-hidden">
                  <CardContent className="p-0 flex items-center gap-6 pt-6 pb-6">
                    <div className="relative w-32 h-32 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <img 
                        src={item.imageUrl || "/placeholder.svg"} 
                        alt={item.name} 
                        className="object-cover rounded-2xl w-full h-full shadow-lg group-hover:shadow-2xl" 
                      />
                    </div>
                    <div className="flex-1 space-y-3">
                      <div>
                        <h3 className="text-xl font-serif font-bold text-foreground leading-tight">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">One-time rite of possession</p>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-serif font-bold text-primary">${item.price}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.id)}
                          className="hover:bg-destructive/10 text-destructive hover:text-destructive-foreground rounded-full p-2 transition-all duration-300 hover:scale-110"
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* The Reckoning */}
            <Card className="border-0 shadow-2xl backdrop-blur-sm bg-background/60 mb-12">
              <CardContent className="pt-8 pb-8">
                <div className="text-right space-y-2">
                  <div className="text-2xl font-serif font-bold text-foreground">The Reckoning: ${total.toFixed(2)}</div>
                  <p className="text-sm text-muted-foreground">Essences for eternal possession</p>
                </div>
              </CardContent>
            </Card>

            {/* Path Forward */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button asChild variant="outline" className="rounded-full px-12 py-4 font-serif border-foreground/20 hover:border-primary text-lg transition-all duration-300 flex-1 max-w-md">
                <Link href="/catalog">Seek Further Essences</Link>
              </Button>
              <Button
                onClick={() => {
                  if (cartItems.length > 0) {
                    toast.success("Proceeding to the unveiling");
                    router.push(`/preview?cart=${encodeURIComponent(JSON.stringify(cartItems))}`);
                  }
                }}
                disabled={cartItems.length === 0}
                className="rounded-full px-12 py-4 bg-primary text-primary-foreground font-serif text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 flex-1 max-w-md"
              >
                Unveil & Eternalize
              </Button>
            </div>

            <div className="text-center space-y-4 mt-16">
              <p className="text-sm text-muted-foreground italic font-serif max-w-2xl mx-auto">
                Prototype rite; the grand commerce awaits unveiling.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}