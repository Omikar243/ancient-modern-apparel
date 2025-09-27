"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ShoppingCart, Trash2 } from "lucide-react";

interface CartItem {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
}

// Simple cart stub - in production, use localStorage/session or database
export default function Cart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session?.user && !session?.isPending) {
      router.push("/login?redirect=/cart");
      return;
    }

    // Stub: Load from localStorage (simulate adding from catalog)
    const storedCart = localStorage.getItem("cart") || "[]";
    setCartItems(JSON.parse(storedCart));

    if (session?.isPending) {
      router.push("/login?redirect=/cart");
    }
  }, [session, router]);

  const removeFromCart = (id: number) => {
    const updated = cartItems.filter(item => item.id !== id);
    setCartItems(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
    toast.success("Item removed from cart");
  };

  const total = cartItems.reduce((sum, item) => sum + item.price, 0);

  if (session?.isPending) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center gap-2 mb-8">
          <ShoppingCart className="w-6 h-6" />
          <h1 className="text-3xl font-bold">Your Cart</h1>
        </div>

        {cartItems.length === 0 ? (
          <Card className="text-center py-12">
            <CardTitle>Your cart is empty</CardTitle>
            <CardDescription>
              Add garments from the <Link href="/catalog" className="text-primary hover:underline">catalog</Link>.
            </CardDescription>
            <Button asChild className="mt-4">
              <Link href="/catalog">Continue Shopping</Link>
            </Button>
          </Card>
        ) : (
          <>
            <div className="space-y-4 mb-8">
              {cartItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-16 h-16 relative">
                      <img src={item.imageUrl || "/placeholder.svg"} alt={item.name} className="object-cover rounded" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">One-time purchase</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-lg font-bold">${item.price}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="mb-8">
              <CardContent className="pt-6">
                <div className="text-right">
                  <div className="text-lg font-bold">Total: ${total.toFixed(2)}</div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4 justify-end">
              <Button variant="outline" asChild>
                <Link href="/catalog">Continue Shopping</Link>
              </Button>
              <Button
                onClick={() => {
                  if (cartItems.length > 0) {
                    toast.info("Proceeding to preview and export");
                    router.push(`/preview?cart=${encodeURIComponent(JSON.stringify(cartItems))}`);
                  }
                }}
                disabled={cartItems.length === 0}
              >
                Preview & Export Designs
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}