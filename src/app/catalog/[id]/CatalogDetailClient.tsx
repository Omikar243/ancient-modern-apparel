"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, ArrowLeft, Ruler, Award, BookOpen } from "lucide-react";
import { toast } from "sonner";

interface GarmentDetail {
  id: number;
  name: string;
  type: string;
  description: string;
  imageUrl: string;
  price: number;
  category: string;
  measurements?: Record<string, number>;
  qualityRating?: number;
  history?: string;
}

export default function CatalogDetailClient({ params }: { params: { id: string } }) {
  const [garment, setGarment] = useState<GarmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const id = params.id;

  useEffect(() => {
    const fetchGarment = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/garments?id=${id}`, { credentials: "include" });
        if (!response.ok) throw new Error("Failed to fetch garment details");
        const data = await response.json();
        setGarment(data);
        setError(null);
      } catch (err: any) {
        setError(err.message);
        toast.error("Error loading garment details");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchGarment();
  }, [id]);

  const handleAddToCart = () => {
    if (!session?.user) {
      toast.error("Please log in to add to cart.");
      router.push("/login?redirect=/catalog");
      return;
    }
    if (!garment) return;
    const cartItem = {
      id: garment.id,
      name: garment.name,
      price: garment.price,
      imageUrl: garment.imageUrl || "/placeholder.svg",
    };
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    if (!cart.find((item: any) => item.id === garment.id)) {
      cart.push(cartItem);
      localStorage.setItem("cart", JSON.stringify(cart));
      toast.success(`${garment.name} added to cart`);
    } else {
      toast.info("Item already in cart");
    }
    router.push("/cart");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading details...</p>
        </div>
      </div>
    );
  }

  if (error || !garment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Garment Not Found</h2>
          <p className="text-muted-foreground mb-4">{error || "Garment details unavailable"}</p>
          <Button onClick={() => router.push("/catalog")}>Back to Catalog</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Catalog
        </Button>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="relative h-96 rounded-lg overflow-hidden">
            <Image
              src={garment.imageUrl || "/placeholder.svg"}
              alt={garment.name}
              fill
              className="object-cover"
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-3xl font-bold">{garment.name}</CardTitle>
                <CardDescription className="text-2xl font-semibold text-primary mt-2">${garment.price}</CardDescription>
              </div>
              <Badge variant="secondary" className="text-lg">{garment.category.toUpperCase()}</Badge>
            </div>

            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < (garment.qualityRating || 0) ? "fill-primary text-primary" : "text-muted-foreground"
                  }`}
                />
              ))}
              <span className="ml-2 text-sm font-medium">
                {garment.qualityRating || 0}/10 Quality Rating
              </span>
            </div>

            <div className="space-y-2">
              <p className="text-muted-foreground">{garment.description}</p>
              <Button onClick={handleAddToCart} className="w-full">
                Add to Cart
              </Button>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Measurements */}
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <Ruler className="w-4 h-4" />
              <CardTitle className="text-lg">Measurements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {garment.measurements ? (
                Object.entries(garment.measurements).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <span>{value}"</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Measurements not specified</p>
              )}
            </CardContent>
          </Card>

          {/* Quality */}
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <Award className="w-4 h-4" />
              <CardTitle className="text-lg">Quality Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 fill-primary text-primary" />
                  <span>Rating: {garment.qualityRating || "N/A"}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Assessed based on material integrity, craftsmanship, and durability standards.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* History */}
          <Card className="md:col-span-3">
            <CardHeader className="flex flex-row items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <CardTitle className="text-lg">Cultural History</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p className="text-sm leading-relaxed">{garment.history || "History not available for this garment."}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}