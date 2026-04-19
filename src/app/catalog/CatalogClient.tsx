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

function savePreviewGarment(garment: Garment, userAvatar: any) {
  sessionStorage.setItem(
    "previewGarment",
    JSON.stringify({
      garmentId: garment.id,
      garment: {
        id: garment.id,
        name: garment.name,
        garment: garment.name,
        material: "Selected Material",
        color: "blue",
        price: garment.price,
        imageUrl: garment.imageUrl || "/placeholder.svg",
        description: garment.description,
      },
      avatarData: userAvatar
        ? {
            measurements: userAvatar.measurements,
            modelUrl: userAvatar.fittedModelUrl,
          }
        : null,
    })
  );
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

  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Public access - always load catalog
    fetchGarments();
    fetchMaterials();
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
      if (!session?.user?.id) {
        setUserAvatar(null);
        setAvatarLoading(false);
        return;
      }
      try {
        setAvatarLoading(true);
        const response = await fetch("/api/avatars/by-user/" + session.user.id);
        if (response.ok) {
          const avatarsData = await response.json();
          const latestAvatar = Array.isArray(avatarsData)
            ? (avatarsData.length > 0 ? avatarsData[0] : null)
            : avatarsData;
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
    
    if (!isPending) {
      fetchUserAvatar();
    }
  }, [session?.user?.id, isPending]);

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

  const loadLatestAvatar = async () => {
    if (!session?.user?.id) {
      return null;
    }

    const response = await fetch(`/api/avatars/by-user/${session.user.id}`, {
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const latestAvatar = Array.isArray(data) ? data[0] : data;
    setUserAvatar(latestAvatar);
    setAvatarError(null);
    return latestAvatar;
  };

  const handlePreview = (garment: Garment) => {
    if (!session?.user) {
      toast.error("Please log in to preview garments on your avatar.");
      router.push("/login?redirect=/catalog");
      return;
    }
    const openPreview = async () => {
      const latestAvatar = userAvatar || await loadLatestAvatar();
      if (!latestAvatar) {
        toast.warning("Create your avatar first to preview garments.");
        router.push("/avatar");
        return;
      }
      savePreviewGarment(garment, latestAvatar);
      router.push(`/preview?garmentId=${garment.id}`);
    };

    void openPreview();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading catalog...</p>
        </div>
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
    <div className="min-h-screen bg-background py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Luxurious Header */}
        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-foreground mb-6 leading-tight">The Heritage Atelier</h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">Discover timeless Indian silhouettes, where ancient weave marries contemporary form. Each garment, a narrative of tradition, awaits your discerning touch.</p>
        </div>

        {/* Auth & Avatar Prompt - Elegant */}
        {session?.user && !isPending && avatarError && !avatarLoading && (
          <Card className="mb-12 border-0 shadow-xl backdrop-blur-sm bg-background/60">
            <CardContent className="p-8 text-center">
              <p className="text-lg text-muted-foreground mb-4 italic">{avatarError}</p>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => router.push("/avatar")} 
                className="rounded-full px-8 py-4 font-serif border-foreground/20 hover:border-primary hover:bg-transparent transition-all duration-300"
              >
                Forge Your Silhouette
              </Button>
            </CardContent>
          </Card>
        )}

        {!session?.user && !isPending && (
          <Card className="mb-12 border-0 shadow-xl backdrop-blur-sm bg-background/60">
            <CardContent className="p-8 text-center">
              <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
                Enter the atelier to compose bespoke creations. Your vision demands authentication.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={() => router.push('/login?redirect=/catalog')} 
                  className="rounded-full px-8 py-4 font-serif border-foreground/20 hover:border-primary transition-all duration-300"
                >
                  Enter the Sanctum
                </Button>
                <Button 
                  size="lg" 
                  onClick={() => router.push('/register')} 
                  className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 py-4 font-serif text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                >
                  Begin Your Journey
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Refined Filters - Sidebar Style */}
          <Card className="lg:w-80 border-0 shadow-xl backdrop-blur-sm bg-background/60">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl font-serif font-bold text-foreground">
                <Filter className="w-5 h-5" />
                Refine Your Vision
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Curate from our eternal collection with discerning precision.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-0">
              <div className="p-6 border-b border-border/20">
                <label className="text-sm font-medium text-foreground block mb-3">Seek Elegance</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Whisper your desire..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-card/50 border-border/20 focus:border-primary rounded-xl"
                  />
                </div>
              </div>
              <div className="p-6 border-b border-border/20">
                <label className="text-sm font-medium text-foreground block mb-3">Lineage</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="bg-card/50 border-border/20 rounded-xl">
                    <SelectValue placeholder="Eternal legacies" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Lineages</SelectItem>
                    <SelectItem value="women">Feminine Grace</SelectItem>
                    <SelectItem value="men">Masculine Form</SelectItem>
                    <SelectItem value="kids">Youthful Essence</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="p-6">
                <label className="text-sm font-medium text-foreground block mb-3">Value Spectrum</label>
                <Slider 
                  value={priceRange} 
                  onValueChange={(value) => setPriceRange(value as [number, number])} 
                  max={500} 
                  step={10} 
                  className="my-4" 
                />
                <div className="text-xs text-muted-foreground">${priceRange[0]} – ${priceRange[1]}</div>
              </div>
            </CardContent>
          </Card>

          {/* Exquisite Garment Gallery */}
          <div className="flex-1">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredGarments.length > 0 ? (
                filteredGarments.map((garment) => (
                  <Link 
                    href={`/catalog/${garment.id}`} 
                    key={garment.id} 
                    className="block hover:no-underline group"
                  >
                    <Card 
                      className="overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl bg-background/60 backdrop-blur-sm hover:border-primary/30 hover:scale-105 h-full"
                    >
                      <div className="relative h-64 overflow-hidden rounded-t-2xl">
                        <img 
                          src={garment.imageUrl || "/placeholder.svg"} 
                          alt={garment.name} 
                          className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      </div>
                      <CardContent className="p-6">
                        <CardTitle className="text-xl font-serif font-bold text-foreground mb-2 leading-tight">{garment.name}</CardTitle>
                        <CardDescription className="text-muted-foreground mb-4 leading-relaxed text-base line-clamp-2">
                          {garment.description}
                        </CardDescription>
                        <div className="flex justify-between items-center mb-4">
                          <Badge 
                            variant="secondary" 
                            className="bg-accent/20 text-accent-foreground font-medium"
                          >
                            {garment.category.toUpperCase()}
                          </Badge>
                          <span className="text-2xl font-serif font-bold text-primary">${garment.price}</span>
                        </div>
                        <Button 
                          variant="outline" 
                          size="lg" 
                          className="w-full rounded-full font-serif border-foreground/20 hover:border-primary hover:bg-transparent transition-all duration-300 group-hover:scale-105" 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handlePreview(garment);
                          }}
                        >
                          {session?.user ? "Preview on My Avatar" : "Reveal Your Form"}
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>
                ))
              ) : (
                <Card className="col-span-full border-0 shadow-xl backdrop-blur-sm bg-background/60 text-center py-16 rounded-2xl">
                  <CardContent>
                    <p className="text-xl text-muted-foreground italic">No silhouettes align with your vision at present. Refine your quest.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* Materials Codex - Sophisticated Sidebar */}
        <Card className="mt-16 lg:float-right lg:w-96 border-0 shadow-xl backdrop-blur-sm bg-background/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-serif font-bold text-foreground">
              <Palette className="w-5 h-5" />
              Textile Codex
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Unveil the lore of ancestral fabrics, each thread a chronicle of artistry and provenance.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 p-0">
            {materials.map((material) => (
              <Dialog key={material.id}>
                <DialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start space-x-3 p-4 hover:bg-accent/10 transition-all duration-300 rounded-xl border border-border/20" 
                    onClick={() => setSelectedMaterial(material)}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex-shrink-0"
                      style={{ 
                        backgroundColor: material.textureType.includes("silk") 
                          ? "#D4AF37" 
                          : material.textureType.includes("cotton") 
                          ? "#F5F5DC" 
                          : "#8B0000" 
                      }}
                    />
                    <div className="flex-1 text-left">
                      <span className="font-serif font-medium text-foreground">{material.name}</span>
                      <p className="text-xs text-muted-foreground leading-tight">{material.origin}</p>
                    </div>
                    <Badge className="ml-auto bg-primary/20 text-primary font-medium">
                      {material.authenticityRating}/10
                    </Badge>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="font-serif text-2xl">{material.name}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="w-16 h-16 rounded-xl"
                        style={{ 
                          backgroundColor: material.textureType.includes("silk") 
                            ? "#D4AF37" 
                            : material.textureType.includes("cotton") 
                            ? "#F5F5DC" 
                            : "#8B0000" 
                        }}
                      />
                      <Badge variant="secondary" className="font-medium uppercase tracking-wide">
                        {material.textureType}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        <strong>Provenance:</strong> {material.origin}, where master weavers have preserved arcane techniques through generations.
                      </p>
                      <p className="text-sm leading-relaxed mt-2 italic">
                        {material.description} This fabric whispers of royal courts and sacred rituals, its tactile elegance a testament to enduring legacy.
                      </p>
                    </div>
                    <p className="text-sm font-medium text-foreground/90 flex items-center justify-between">
                      Purity of Craft
                      <Badge className="bg-primary/30 text-primary">
                        {material.authenticityRating}/10
                      </Badge>
                    </p>
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
