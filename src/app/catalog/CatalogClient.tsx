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
import Link from "next/link";

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

export default function CatalogClient() {
  const [garments, setGarments] = useState<Garment[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userAvatar, setUserAvatar] = useState<any>(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarError, setAvatarError] = useState<any>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [filteredGarments, setFilteredGarments] = useState<Garment[]>([]);

  // Material modal
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);

  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    // Public access - always load catalog
    fetchGarments();
    fetchMaterials();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchGarments = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/garments", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch garments");
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
    try {
      const response = await fetch("/api/materials", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch materials");
      const data = await response.json();
      setMaterials(data);
    } catch (err) {
      console.error("Error fetching materials:", err);
    }
  };

  // Load user avatar only if logged in
  useEffect(() => {
    const fetchUserAvatar = async () => {
      // @ts-expect-error session typing comes from better-auth client hook
      if (!session?.user?.id) {
        setUserAvatar(null);
        setAvatarLoading(false);
        return;
      }
      try {
        setAvatarLoading(true);
        // @ts-expect-error session typing
        const response = await fetch("/api/avatars/by-user/" + session.user.id);
        if (response.ok) {
          const avatarsData = await response.json();
          const latestAvatar = avatarsData.length > 0 ? avatarsData[0] : null;
          setUserAvatar(latestAvatar);
        } else {
          setAvatarError("No avatar found, using defaults");
        }
      } catch (err: any) {
        console.error("Avatar fetch error:", err);
        setAvatarError(err.message);
      } finally {
        setAvatarLoading(false);
      }
    };
    fetchUserAvatar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [/* session changes trigger internally */]);

  useEffect(() => {
    const filtered = garments.filter((garment) => {
      const matchesSearch =
        garment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        garment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        garment.type.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || garment.category === selectedCategory;
      const matchesPrice = garment.price >= priceRange[0] && garment.price <= priceRange[1];
      return matchesSearch && matchesCategory && matchesPrice;
    });
    setFilteredGarments(filtered);
  }, [garments, searchTerm, selectedCategory, priceRange]);

  const handleAddToCart = (garment: Garment) => {
    // @ts-expect-error session typing
    if (!session?.user) {
      toast.error("Please log in to customize and add garments to your cart.");
      router.push("/login?redirect=/catalog");
      return;
    }
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
    if (!userAvatar) {
      toast.warning("Create your avatar first to preview garments.");
      router.push("/avatar");
      return;
    }
    const avatarData = userAvatar ? { measurements: userAvatar.measurements, modelUrl: userAvatar.fittedModelUrl } : null;
    sessionStorage.setItem("previewGarment", JSON.stringify({ garmentId: garment.id, avatarData }));
    router.push("/preview");
  };

  if (loading) {
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
                  <Slider value={priceRange} onValueChange={setPriceRange} max={500} step={10} className="w-full" />
                  <div className="text-xs text-muted-foreground">${priceRange[0]} - ${priceRange[1]}</div>
                </div>
              </CardContent>
            </Card>

            {/* Avatar Loading/Warning - only show if logged in and no avatar */}
            {/* @ts-expect-error session typing */}
            {session?.user && !session.isPending && (
              <>
                {avatarLoading && (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <span className="ml-2 text-muted-foreground">Loading your avatar...</span>
                  </div>
                )}

                {avatarError && !avatarLoading && (
                  <Card className="mb-4 p-4 bg-destructive/5 border-destructive/20">
                    <p className="text-sm text-destructive">{avatarError}</p>
                    <Button variant="outline" size="sm" onClick={() => router.push("/avatar")}>Create Avatar</Button>
                  </Card>
                )}
              </>
            )}

            {/* Public message if not logged in */}
            {/* @ts-expect-error session typing */}
            {!session?.user && !session?.isPending && (
              <Card className="mb-4 p-4 bg-accent/10">
                <p className="text-sm text-muted-foreground">
                  Log in or sign up to create your avatar and customize garments.
                  <Button variant="link" size="sm" onClick={() => router.push('/login?redirect=/catalog')} className="p-0 h-auto">
                    Get started
                  </Button>
                </p>
              </Card>
            )}

            {/* Garment Grid */}
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredGarments.length > 0 ? (
                filteredGarments.map((garment) => (
                  <Link href={`/catalog/${garment.id}`} key={garment.id} className="block hover:no-underline">
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                      <div className="relative h-48">
                        <Image src={garment.imageUrl || "/placeholder.svg"} alt={garment.name} fill className="object-cover" />
                      </div>
                      <CardContent className="p-4">
                        <CardTitle className="font-semibold mb-1">{garment.name}</CardTitle>
                        <CardDescription className="mb-2">{garment.description.substring(0, 100)}...</CardDescription>
                        <div className="flex justify-between items-center mb-2">
                          <Badge variant="secondary">{garment.category}</Badge>
                          <span className="text-lg font-bold">${garment.price}</span>
                        </div>
                        {/* @ts-expect-error session typing */}
                        <Button variant="outline" size="sm" className="w-full" onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleAddToCart(garment);
                        }}>
                          {session?.user ? "Quick Add to Cart" : "Log in to Customize"}
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>
                ))
              ) : (
                <p className="col-span-full text-center text-muted-foreground py-8">No garments found matching your filters.</p>
              )}
            </div>
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
                    <Button variant="ghost" className="w-full justify-start space-x-2 p-2" onClick={() => setSelectedMaterial(material)}>
                      <div
                        className="w-8 h-8 rounded"
                        style={{ backgroundColor: material.textureType.includes("silk") ? "#D4AF37" : "#F5F5DC" }}
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
                          style={{ backgroundColor: material.textureType.includes("silk") ? "#D4AF37" : "#F5F5DC" }}
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