"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import dynamic from 'next/dynamic';
const CanvasWrapper = dynamic(() => import('../avatar/CanvasWrapper'), { ssr: false });
import * as THREE from 'three';

// Import for export (simplified to JSON for prototype; real GLB later)
import jsPDF from "jspdf"; // For PDF placeholder

// Mock 3D models (replace with uploaded avatar/garment URLs from designs)
const defaultAvatarUrl = "/models/default-avatar.glb"; // Placeholder; use storage URL
const defaultGarmentUrl = "/models/default-saree.glb"; // Placeholder

interface Design {
  id: number;
  name: string;
  description: string;
  avatarUrl: string;
  garment: string;
  material: string;
  color: string;
  measurements: { height: number; bust: number; waist: number; hips: number; shoulders: number };
  purchased: boolean;
  userId: number;
  bodyType?: { hourglass: number; athletic: number };
  skinTone?: string;
}

interface Measurements {
  height: number;
  bust: number;
  waist: number;
  hips: number;
  shoulders: number;
}

const defaultMeasurements: Measurements = {
  height: 170,
  bust: 90,
  waist: 70,
  hips: 95,
  shoulders: 45
};

const AvatarWithGarment = ({ measurements, avatarUrl, garment, material, color, bodyType = { hourglass: 50, athletic: 50 }, skinTone = 'peachpuff' }: {
  measurements: Measurements;
  avatarUrl?: string;
  garment: string;
  material: string;
  color: string;
  bodyType?: { hourglass: number; athletic: number };
  skinTone?: string;
}) => {
  const { scene: avatarScene } = useGLTF(avatarUrl || '/models/default-avatar.glb');
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    if (avatarUrl && avatarScene && !useFallback) {
      try {
        // Scale based on measurements
        const baseHeight = 170;
        const scaleY = measurements.height / baseHeight;
        avatarScene.scale.set(1, scaleY, 1);
        
        // Simulate garment overlay on loaded model
        const overlayGeometry = new THREE.PlaneGeometry(2, 1.5);
        const overlayMaterial = new THREE.MeshBasicMaterial({ 
          color: color === 'red' ? new THREE.Color('red') : new THREE.Color('blue'), 
          transparent: true, 
          opacity: 0.7 
        });
        const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial);
        overlay.position.set(0, measurements.height / 200, 0.01); // Slight offset forward
        avatarScene.add(overlay);

        // Update material colors if skinTone available (for head/torso)
        avatarScene.traverse((child: any) => {
          if (child.isMesh && child.material) {
            if (child.name.includes('head') || child.name.includes('skin')) {
              child.material.color.set(skinTone);
            }
          }
        });
      } catch (err) {
        console.error('GLTF loading error, falling back to procedural:', err);
        setUseFallback(true);
      }
    }
  }, [avatarScene, measurements, color, skinTone, useFallback, avatarUrl]);

  if (useFallback || !avatarUrl) {
    return (
      <group>
        <CanvasWrapper 
          measurements={measurements} 
          bodyType={bodyType} 
          skinTone={skinTone} 
        />
      </group>
    );
  }

  return (
    <>
      <primitive object={avatarScene} />
      {/* Garment overlay for GLTF */}
      <mesh position={[0, measurements.height / 200, 0.01]}>
        <planeGeometry args={[3, 1.5]} />
        <meshBasicMaterial color={color} transparent opacity={0.7} />
      </mesh>
    </>
  );
};

export default function Preview() {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [selectedDesign, setSelectedDesign] = useState<Design | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [userAvatar, setUserAvatar] = useState<any>(null);
  const [avatarLoading, setAvatarLoading] = useState(true);
  const [garmentForPreview, setGarmentForPreview] = useState<any>(null);
  const { data: session, isPending } = useSession();
  const router = useRouter();

  // Auth check effect
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login?redirect=/preview");
    }
  }, [isPending, session?.user, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.id) {
        setAvatarLoading(false);
        setLoading(false);
        return;
      }
      try {
        // Fetch designs (existing)
        const res = await fetch(`/api/designs/${session.user.id}`);
        if (res.ok) {
          const data = await res.json();
          setDesigns(data);
          if (data.length > 0 && !selectedDesign) {
            setSelectedDesign(data[0]);
          }
        }

        // Fetch user avatar
        setAvatarLoading(true);
        const avatarRes = await fetch('/api/avatars', {
          headers: { Authorization: `Bearer ${localStorage.getItem('bearer_token')}` },
          credentials: 'include',
        });
        if (avatarRes.ok) {
          const avatarsData = await avatarRes.json();
          // Use latest or first if available
          const latestAvatar = avatarsData.length > 0 ? {
            measurements: avatarsData[0].measurements,
            modelUrl: avatarsData[0].fittedModelUrl,
            id: avatarsData[0].id
          } : null;
          setUserAvatar(latestAvatar);
        } else if (avatarRes.status === 401) {
          toast.error("Session expired. Redirecting...");
          router.push("/login");
        }

        // Check for garment from catalog redirect
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('garmentId')) {
          const garmentId = parseInt(urlParams.get('garmentId')!);
          // Fetch garment by ID (assume API exists or use local state)
          // For now, mock or use from sessionStorage
          const storedGarment = sessionStorage.getItem('previewGarment');
          if (storedGarment) {
            const { garmentId: storedId } = JSON.parse(storedGarment);
            if (storedId === garmentId) {
              const mockGarment = {
                name: 'Custom Garment',
                garment: 'Saree', // example
                material: 'Silk',
                color: 'Red'
              };
              setGarmentForPreview(mockGarment);
            }
          }
        }
      } catch (error) {
        console.error('Fetch error:', error);
        toast.error("Failed to load data");
      } finally {
        setAvatarLoading(false);
        setLoading(false);
      }
    };

    if (session?.user) {
      fetchData();
    } else if (!isPending) {
      setLoading(false);
      setAvatarLoading(false);
    }
  }, [session?.user, isPending, router, selectedDesign]);

  // Show loading while checking auth
  if (isPending || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading designs...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  const handlePurchase = async (designId: number) => {
    toast.loading("Processing purchase...");
    try {
      const res = await fetch(`/api/designs/${designId}/purchase`, { method: "PUT" });
      if (res.ok) {
        const updated = await res.json();
        setDesigns(designs.map(d => d.id === designId ? updated.design : d));
        if (selectedDesign?.id === designId) {
          setSelectedDesign(updated.design);
        }
        toast.success("Purchase successful! Watermark removed.");
      } else {
        toast.error("Purchase failed");
      }
    } catch (error) {
      toast.error("Purchase error");
    }
  };

  const exportDesign = async (design: Design) => {
    if (!design.purchased) {
      toast.error("Purchase required to export.");
      return;
    }
    setExporting(true);
    try {
      // Prototype: Export as JSON + PDF summary (real: GLB with watermark metadata)
      const exportData = {
        ...design,
        exportDate: new Date().toISOString(),
        watermark: "IndiFusion Secure Export" // Embed in real GLB metadata
      };
      const jsonBlob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const jsonUrl = URL.createObjectURL(jsonBlob);
      const a = document.createElement("a");
      a.href = jsonUrl;
      a.download = `design-${design.id}.json`;
      a.click();
      URL.revokeObjectURL(jsonUrl);

      // PDF placeholder
      const pdf = new jsPDF();
      pdf.text(`Design Export: ${design.name}`, 10, 10);
      pdf.text(`Garment: ${design.garment}, Material: ${design.material}, Color: ${design.color}`, 10, 20);
      pdf.text("Full GLB export in production version.", 10, 30);
      pdf.save(`design-${design.id}.pdf`);

      toast.success("Design exported!");
    } catch (error) {
      toast.error("Export failed.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/5 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Elegant Header */}
        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-foreground mb-6 leading-tight">The Revelation</h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">Witness your creation in eternal form. Refine, admire, and eternalize the masterpiece.</p>
        </div>

        {/* Designs Codex */}
        <Card className="mb-16 lg:max-w-2xl mx-auto border-0 shadow-2xl backdrop-blur-sm bg-background/60">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-serif font-bold text-foreground">Your Eternal Compositions</CardTitle>
            <CardDescription className="text-lg text-muted-foreground">Select a legacy to unveil and refine.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {designs.map((design) => (
                <Card 
                  key={design.id} 
                  className={`cursor-pointer p-6 hover:shadow-2xl transition-all duration-500 rounded-2xl border-0 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:scale-105 group ${selectedDesign?.id === design.id ? "ring-2 ring-primary shadow-2xl" : ""}`} 
                  onClick={() => setSelectedDesign(design)}
                >
                  <CardTitle className="text-xl font-serif font-bold text-foreground mb-2 leading-tight">{design.name}</CardTitle>
                  <CardDescription className="text-muted-foreground mb-4 leading-relaxed text-base">{design.garment} - {design.material}</CardDescription>
                  <div className="flex items-center justify-between">
                    <Badge className={`font-serif ${design.purchased ? "bg-primary/20 text-primary" : "bg-destructive/20 text-destructive"}`}>
                      {design.purchased ? "Eternalized" : "Awaiting Rite"}
                    </Badge>
                    <div className="text-sm opacity-0 group-hover:opacity-100 transition-opacity">{design.purchased ? "✓" : "⏳"}</div>
                  </div>
                </Card>
              ))}
            </div>
            {!designs.length && (
              <div className="text-center py-16">
                <p className="text-xl text-muted-foreground italic font-serif">No legacies composed. Begin in the Atelier.</p>
                <Button asChild variant="outline" className="mt-6 rounded-full px-8 py-4 font-serif border-foreground/20 hover:border-primary">
                  <Link href="/catalog">Compose Your First</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {selectedDesign && (
          <>
            {/* Avatar Sanctum */}
            {userAvatar && (
              <Card className="mb-12 border-0 shadow-xl backdrop-blur-sm bg-background/60">
                <CardHeader>
                  <CardTitle className="text-2xl font-serif font-bold text-foreground">Your Divine Form</CardTitle>
                  <CardDescription className="text-lg text-muted-foreground">The vessel for your visions.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6 text-center">
                    <div className="p-4 bg-muted/20 rounded-xl">
                      <p className="text-sm text-muted-foreground mb-1">Sanctum ID</p>
                      <p className="text-xl font-serif font-bold text-foreground">{userAvatar.id}</p>
                    </div>
                    <div className="p-4 bg-muted/20 rounded-xl">
                      <p className="text-sm text-muted-foreground mb-1">Stature</p>
                      <p className="text-xl font-serif font-bold text-foreground">{userAvatar.measurements?.height}cm</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    onClick={() => router.push('/avatar')} 
                    className="w-full rounded-full px-8 py-4 font-serif border-foreground/20 hover:border-primary hover:bg-transparent transition-all duration-300"
                  >
                    Refine Your Form
                  </Button>
                  {userAvatar.modelUrl ? (
                    <p className="text-sm text-muted-foreground italic text-center">Sculptural essence eternalized.</p>
                  ) : (
                    <p className="text-sm text-destructive italic text-center">Procedural vessel - <Link href="/avatar" className="underline">Eternalize in three dimensions</Link></p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* The Unveiling */}
            <Card className="mb-16 border-0 shadow-2xl backdrop-blur-sm bg-background/60">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl font-serif font-bold text-foreground">The Unveiling: {selectedDesign.name}</CardTitle>
                <CardDescription className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">Behold the fusion of heritage and vision, rendered in transcendent form.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="relative h-[600px] rounded-3xl overflow-hidden border-2 border-primary/20 shadow-2xl bg-gradient-to-br from-muted/20 to-accent/5">
                  <Canvas camera={{ position: [0, 1.7, 3] }} className="w-full h-full">
                    <ambientLight intensity={0.6} />
                    <directionalLight position={[0, 10, 5]} intensity={1} />
                    {userAvatar ? (
                      <AvatarWithGarment
                        measurements={userAvatar.measurements || selectedDesign?.measurements || defaultMeasurements}
                        avatarUrl={userAvatar.modelUrl}
                        garment={selectedDesign?.garment || garmentForPreview?.garment || 'Sample Garment'}
                        material={selectedDesign?.material || garmentForPreview?.material || 'Cotton'}
                        color={selectedDesign?.color || 'blue'}
                        bodyType={selectedDesign?.bodyType || { hourglass: 50, athletic: 50 }}
                        skinTone={selectedDesign?.skinTone || 'peachpuff'}
                      />
                    ) : (
                      <AvatarWithGarment
                        measurements={selectedDesign?.measurements || defaultMeasurements}
                        garment={selectedDesign?.garment || 'Sample Garment'}
                        material={selectedDesign?.material || 'Cotton'}
                        color={selectedDesign?.color || 'blue'}
                      />
                    )}
                    <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
                  </Canvas>
                  {!selectedDesign.purchased && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm text-primary text-3xl font-serif font-bold z-10 rounded-3xl">
                      Rite of Eternalization Required
                    </div>
                  )}
                </div>

                {/* Refinements */}
                <div className="grid md:grid-cols-2 gap-8 p-8 bg-muted/20 rounded-3xl border border-border/20">
                  <div className="space-y-6">
                    <Label className="text-xl font-serif font-bold text-foreground block">Subtle Refinements</Label>
                    <div className="space-y-4 text-sm">
                      <div className="flex justify-between items-center p-3 bg-card/50 rounded-xl">
                        <span className="text-muted-foreground">Stature:</span>
                        <span className="font-serif font-bold text-foreground">{(userAvatar?.measurements || selectedDesign?.measurements || defaultMeasurements).height}cm</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-card/50 rounded-xl">
                        <span className="text-muted-foreground">Waist:</span>
                        <span className="font-serif font-bold text-foreground">{selectedDesign.measurements.waist}cm</span>
                      </div>
                      <input 
                        type="range" 
                        min="60" 
                        max="100" 
                        value={selectedDesign.measurements.waist} 
                        readOnly 
                        className="w-full h-2 bg-muted rounded-full" 
                      />
                    </div>
                  </div>
                  <div className="space-y-6">
                    <Label className="text-xl font-serif font-bold text-foreground block">Essence of Craft</Label>
                    <div className="space-y-3 text-sm bg-card/50 p-4 rounded-xl">
                      <div className="flex justify-between"><span>Lineage:</span> <span className="font-serif font-medium">{selectedDesign.garment}</span></div>
                      <div className="flex justify-between"><span>Textile:</span> <span className="font-serif font-medium">{selectedDesign.material}</span></div>
                      <div className="flex justify-between"><span>Hue:</span> <span className="font-serif font-medium capitalize">{selectedDesign.color}</span></div>
                      <Button variant="outline" size="sm" className="w-full mt-3 rounded-full font-serif border-foreground/20 hover:border-primary">
                        Refine in Codex
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* The Rite & Eternalization */}
            <Card className="border-0 shadow-2xl backdrop-blur-sm bg-background/60">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl font-serif font-bold text-foreground">The Rite of Passage</CardTitle>
                <CardDescription className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                  Eternalize your vision. The watermark veils until the rite is complete.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-8 space-y-6">
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  {!selectedDesign.purchased ? (
                    <Button 
                      onClick={() => handlePurchase(selectedDesign.id)} 
                      className="flex-1 max-w-md h-16 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground text-lg font-serif font-semibold shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105" 
                      size="lg"
                    >
                      Rite of Eternalization (Prototype Unveiling)
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => exportDesign(selectedDesign)} 
                      disabled={exporting} 
                      className="flex-1 max-w-md h-16 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground text-lg font-serif font-semibold shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105" 
                      size="lg"
                    >
                      {exporting ? (
                        <>
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-foreground mr-3"></div>
                          Eternalizing...
                        </>
                      ) : (
                        "Eternalize the Masterpiece (JSON/Visage)"
                      )}
                    </Button>
                  )}
                </div>
                <p className="text-center text-sm text-muted-foreground italic max-w-2xl mx-auto">
                  Prototype rite; authentic transactions in the grand unveiling.
                </p>
              </CardContent>
            </Card>
          </>
        )}

        {/* Navigation */}
        <div className="text-center space-y-4 pt-12 border-t border-border/20">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="outline" className="rounded-full px-8 py-4 font-serif border-foreground/20 hover:border-primary transition-all">
              <Link href="/catalog">Return to the Codex</Link>
            </Button>
            <Button asChild className="rounded-full px-8 py-4 bg-primary text-primary-foreground font-serif text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <Link href="/">The Eternal Home</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}