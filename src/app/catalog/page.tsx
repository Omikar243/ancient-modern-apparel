"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { toast } from "sonner";
import { Search, Filter, Palette } from "lucide-react";

// Types
interface Garment {
  id: number;
  name: string;
  type: string;
  description: string;
  imageUrl: string;
  price: number;
  category: string;
}

interface Material {
  id: number;
  name: string;
  origin: string;
  description: string;
  textureType: string;
  imageUrl?: string;
  authenticityRating: number;
}

export default function Catalog() {
  const [garments, setGarments] = useState<Garment[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [filteredGarments, setFilteredGarments] = useState<Garment[]>([]);

  // Material modal
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);

  const session = useSession();
  const router = useRouter();

  const token = typeof window !== "undefined" ? localStorage.getItem("bearer_token") : null;

  useEffect(() => {
    if (!session?.user && !session?.isPending) {
      router.push("/login?redirect=/catalog");
      return;
    }

    fetchGarments();
    fetchMaterials();
  }, [session, router]);

  const fetchGarments = async () => {
    if (!token) {
      setError("Authentication required");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/garments", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Session expired. Please log in again.");
          router.push("/login");
          return;
        }
        throw new Error("Failed to fetch garments");
      }

      const data = await response.json();
      setGarments(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      toast.error("Error loading catalog");
    } finally {
      setLoading(false);
    }
  };

  const fetchMaterials = async () => {
    if (!token) return;

    try {
      const response = await fetch("/api/materials", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch materials");
      }

      const data = await response.json();
      setMaterials(data);
    } catch (err) {
      console.error("Error fetching materials:", err);
    }
  };

  useEffect(() => {
    let filtered = garments.filter((garment) => {
      const matchesSearch = garment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            garment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            garment.type.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || garment.category === selectedCategory;
      const matchesPrice = garment.price >= priceRange[0] && garment.price <= priceRange[1];
      return matchesSearch && matchesCategory && matchesPrice;
    });

    setFilteredGarments(filtered);
  }, [garments, searchTerm, selectedCategory, priceRange]);

  if (session?.isPending || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-lg">Loading catalog...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchGarments}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Garment Catalog</h1>
          <p className="text-xl text-muted-foreground mb-6">
            Browse traditional Indian garments and authentic materials. Select and customize your design.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Garment Grid */}
          <div className="flex-1">
            {/* Filters */}
            <Card className="mb-6">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-3 gap-4 p-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search garments..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="women">Women</SelectItem>
                      <SelectItem value="men">Men</SelectItem>
                      <SelectItem value="kids">Kids</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Price Range</label>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={500}
                    step={10}
                    className="w-full"
                  />
                  <div className="text-xs text-muted-foreground">
                    ${priceRange[0]} - ${priceRange[1]}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Garment Grid */}
            {loading ? (
              <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-48 bg-muted rounded-t-lg"></div>
                    <CardContent className="p-4 space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                      <div className="h-4 bg-muted rounded w-1/4"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredGarments.length > 0 ? (
                  filteredGarments.map((garment) => (
                    <Card key={garment.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="relative h-48">
                        <Image
                          src={garment.imageUrl || "/placeholder.svg"}
                          alt={garment.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <CardContent className="p-4">
                        <CardTitle className="font-semibold mb-1">{garment.name}</CardTitle>
                        <CardDescription className="mb-2">{garment.description.substring(0, 100)}...</CardDescription>
                        <div className="flex justify-between items-center mb-2">
                          <Badge variant="secondary">{garment.category}</Badge>
                          <span className="text-lg font-bold">${garment.price}</span>
                        </div>
                        <Button
                          asChild
                          className="w-full"
                          onClick={() => {
                            // Stub: Add to cart (in production, use real cart state)
                            const cartItem = {
                              id: garment.id,
                              name: garment.name,
                              price: garment.price,
                              imageUrl: garment.imageUrl || '/placeholder.svg'
                            };
                            let cart = JSON.parse(localStorage.getItem('cart') || '[]');
                            if (!cart.find((item: any) => item.id === garment.id)) {
                              cart.push(cartItem);
                              localStorage.setItem('cart', JSON.stringify(cart));
                              toast.success(`${garment.name} added to cart`);
                            } else {
                              toast.info('Item already in cart');
                            }
                            router.push(`/preview?garmentId=${garment.id}`);
                          }}
                        >
                          <span>Add to Cart & Customize</span>
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="col-span-full text-center text-muted-foreground py-8">
                    No garments found matching your filters.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Materials Sidebar */}
          <Card className="w-full lg:w-80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Materials
              </CardTitle>
              <CardDescription>Click to learn about authentic Indian textiles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {materials.map((material) => (
                <Dialog key={material.id}>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start space-x-2 p-2"
                      onClick={() => setSelectedMaterial(material)}
                    >
                      <div
                        className="w-8 h-8 rounded"
                        style={{
                          backgroundColor: material.textureType.includes("silk") ? "#D4AF37" : "#F5F5DC", // Gold for silk, beige for others
                        }}
                      />
                      <span className="font-medium">{material.name}</span>
                      <Badge className="ml-auto">{material.authenticityRating}/10</Badge>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{material.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-12 h-12 rounded"
                          style={{
                            backgroundColor: material.textureType.includes("silk") ? "#D4AF37" : "#F5F5DC",
                          }}
                        />
                        <Badge>{material.textureType}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <strong>Origin:</strong> {material.origin}
                      </p>
                      <p className="text-sm">{material.description}</p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Authenticity:</strong> {material.authenticityRating}/10
                      </p>
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}