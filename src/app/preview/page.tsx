"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import jsPDF from "jspdf";
import * as THREE from "three";

const CanvasWrapper = dynamic(() => import("../avatar/CanvasWrapper"), { ssr: false });

interface Measurements {
  height: number;
  bust: number;
  waist: number;
  hips: number;
  shoulders: number;
}

interface Design {
  id: number;
  name: string;
  description: string;
  avatarUrl?: string;
  garment: string;
  material: string;
  color: string;
  measurements: Measurements;
  purchased: boolean;
  userId: number;
  bodyType?: { hourglass: number; athletic: number };
  skinTone?: string;
}

interface PreviewGarment {
  id: number;
  name: string;
  garment: string;
  material: string;
  color: string;
  description?: string;
  imageUrl?: string;
  price?: number;
}

const defaultMeasurements: Measurements = {
  height: 170,
  bust: 90,
  waist: 70,
  hips: 95,
  shoulders: 45,
};

const ProceduralAvatarWithGarment = ({ color }: { color: string }) => (
  <group>
    <mesh position={[0, 1.2, 0]}>
      <capsuleGeometry args={[0.2, 1.1, 8, 16]} />
      <meshStandardMaterial color="#d8c1a7" />
    </mesh>
    <mesh position={[0, 1.2, 0.22]}>
      <planeGeometry args={[1.25, 1.6]} />
      <meshBasicMaterial color={color} transparent opacity={0.7} />
    </mesh>
  </group>
);

const LoadedAvatarWithGarment = ({
  measurements,
  avatarUrl,
  color,
  skinTone,
}: {
  measurements: Measurements;
  avatarUrl: string;
  color: string;
  skinTone?: string;
}) => {
  const { scene } = useGLTF(avatarUrl);
  const clonedScene = useMemo(() => scene.clone(), [scene]);

  useEffect(() => {
    const baseHeight = 170;
    const scaleY = measurements.height / baseHeight;
    clonedScene.scale.set(1, scaleY, 1);

    clonedScene.traverse((child: any) => {
      if (child.isMesh && child.material && child.name) {
        if (child.name.includes("head") || child.name.includes("skin")) {
          child.material.color.set(skinTone || "peachpuff");
        }
      }
    });
  }, [clonedScene, color, measurements.height, skinTone]);

  return (
    <>
      <primitive object={clonedScene} />
      <mesh position={[0, measurements.height / 200, 0.01]}>
        <planeGeometry args={[3, 1.5]} />
        <meshBasicMaterial color={color} transparent opacity={0.7} />
      </mesh>
    </>
  );
};

const AvatarWithGarment = ({
  measurements,
  avatarUrl,
  color,
  skinTone = "peachpuff",
}: {
  measurements: Measurements;
  avatarUrl?: string;
  color: string;
  skinTone?: string;
}) => {
  if (!avatarUrl) {
    return <ProceduralAvatarWithGarment color={color} />;
  }

  return (
    <LoadedAvatarWithGarment
      measurements={measurements}
      avatarUrl={avatarUrl}
      color={color}
      skinTone={skinTone}
    />
  );
};

export default function Preview() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [designs, setDesigns] = useState<Design[]>([]);
  const [selectedDesign, setSelectedDesign] = useState<Design | null>(null);
  const [garmentForPreview, setGarmentForPreview] = useState<PreviewGarment | null>(null);
  const [userAvatar, setUserAvatar] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login?redirect=/preview");
    }
  }, [isPending, router, session?.user]);

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }

      try {
        const [designRes, avatarRes] = await Promise.all([
          fetch(`/api/designs/${session.user.id}`),
          fetch(`/api/avatars`, { credentials: "include" }),
        ]);

        if (designRes.ok) {
          const data = await designRes.json();
          setDesigns(data);
          if (data.length > 0) {
            setSelectedDesign(data[0]);
          }
        }

        if (avatarRes.ok) {
          const avatarsData = await avatarRes.json();
          if (avatarsData.length > 0) {
            setUserAvatar({
              measurements: avatarsData[0].measurements,
              modelUrl: avatarsData[0].fittedModelUrl,
              id: avatarsData[0].id,
            });
          }
        }

        const urlParams = new URLSearchParams(window.location.search);
        const garmentId = urlParams.get("garmentId");
        const storedGarment = sessionStorage.getItem("previewGarment");
        if (garmentId && storedGarment) {
          const parsed = JSON.parse(storedGarment);
          if (String(parsed.garmentId) === garmentId) {
            setGarmentForPreview(parsed.garment);
            if (parsed.avatarData) {
              setUserAvatar({
                measurements: parsed.avatarData.measurements,
                modelUrl: parsed.avatarData.modelUrl,
                id: "latest-avatar",
              });
            }
          }
        }
      } catch (error) {
        console.error("Preview fetch error:", error);
        toast.error("Failed to load preview data");
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      void fetchData();
    }
  }, [router, session?.user]);

  const activeLook = selectedDesign
    ? {
        source: "design" as const,
        title: selectedDesign.name,
        garment: selectedDesign.garment,
        material: selectedDesign.material,
        color: selectedDesign.color,
        purchased: selectedDesign.purchased,
        measurements: selectedDesign.measurements,
        bodyType: selectedDesign.bodyType || { hourglass: 50, athletic: 50 },
        skinTone: selectedDesign.skinTone || "peachpuff",
        description: selectedDesign.description,
      }
    : garmentForPreview
      ? {
          source: "catalog" as const,
          title: garmentForPreview.name,
          garment: garmentForPreview.garment,
          material: garmentForPreview.material,
          color: garmentForPreview.color,
          purchased: true,
          measurements: userAvatar?.measurements || defaultMeasurements,
          bodyType: { hourglass: 50, athletic: 50 },
          skinTone: "peachpuff",
          description: garmentForPreview.description || "Previewing the selected garment on your latest avatar.",
        }
      : null;

  const exportDesign = async () => {
    if (!activeLook) return;
    setExporting(true);
    try {
      const exportData = {
        activeLook,
        userAvatar,
        exportDate: new Date().toISOString(),
      };
      const jsonBlob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const jsonUrl = URL.createObjectURL(jsonBlob);
      const a = document.createElement("a");
      a.href = jsonUrl;
      a.download = `avatar-preview-${activeLook.title}.json`;
      a.click();
      URL.revokeObjectURL(jsonUrl);

      const pdf = new jsPDF();
      pdf.text(`Preview Export: ${activeLook.title}`, 10, 10);
      pdf.text(`Garment: ${activeLook.garment}`, 10, 20);
      pdf.text(`Material: ${activeLook.material}`, 10, 30);
      pdf.save(`avatar-preview-${activeLook.title}.pdf`);

      toast.success("Preview exported");
    } catch (error) {
      toast.error("Export failed");
    } finally {
      setExporting(false);
    }
  };

  if (isPending || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading preview...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/5 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-foreground mb-6 leading-tight">The Revelation</h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Witness your creation in eternal form. Refine, admire, and eternalize the masterpiece.
          </p>
        </div>

        {designs.length > 0 ? (
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
                      <Badge className={`${design.purchased ? "bg-primary/20 text-primary" : "bg-destructive/20 text-destructive"}`}>
                        {design.purchased ? "Eternalized" : "Awaiting Rite"}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : null}

        {!activeLook ? (
          <Card className="mb-16 lg:max-w-2xl mx-auto border-0 shadow-2xl backdrop-blur-sm bg-background/60">
            <CardContent className="text-center py-16">
              <p className="text-xl text-muted-foreground italic font-serif">
                No preview selected yet. Choose a garment from the catalog to see it on your avatar.
              </p>
              <Button asChild variant="outline" className="mt-6 rounded-full px-8 py-4 font-serif border-foreground/20 hover:border-primary">
                <Link href="/catalog">Choose a Garment</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {userAvatar ? (
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
                </CardContent>
              </Card>
            ) : null}

            <Card className="mb-16 border-0 shadow-2xl backdrop-blur-sm bg-background/60">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl font-serif font-bold text-foreground">The Unveiling: {activeLook.title}</CardTitle>
                <CardDescription className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                  Behold the fusion of heritage and vision, rendered in transcendent form.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="relative h-[600px] rounded-3xl overflow-hidden border-2 border-primary/20 shadow-2xl bg-gradient-to-br from-muted/20 to-accent/5">
                  <Canvas camera={{ position: [0, 1.7, 3] }} className="w-full h-full">
                    <ambientLight intensity={0.6} />
                    <directionalLight position={[0, 10, 5]} intensity={1} />
                    <AvatarWithGarment
                      measurements={userAvatar?.measurements || activeLook.measurements || defaultMeasurements}
                      avatarUrl={userAvatar?.modelUrl}
                      color={activeLook.color || "blue"}
                      skinTone={activeLook.skinTone}
                    />
                    <OrbitControls enablePan enableZoom enableRotate />
                  </Canvas>
                </div>

                <div className="grid md:grid-cols-2 gap-8 p-8 bg-muted/20 rounded-3xl border border-border/20">
                  <div className="space-y-6">
                    <Label className="text-xl font-serif font-bold text-foreground block">Subtle Refinements</Label>
                    <div className="space-y-4 text-sm">
                      <div className="flex justify-between items-center p-3 bg-card/50 rounded-xl">
                        <span className="text-muted-foreground">Stature:</span>
                        <span className="font-serif font-bold text-foreground">{(userAvatar?.measurements || activeLook.measurements || defaultMeasurements).height}cm</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-card/50 rounded-xl">
                        <span className="text-muted-foreground">Waist:</span>
                        <span className="font-serif font-bold text-foreground">{(userAvatar?.measurements || activeLook.measurements || defaultMeasurements).waist}cm</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <Label className="text-xl font-serif font-bold text-foreground block">Essence of Craft</Label>
                    <div className="space-y-3 text-sm bg-card/50 p-4 rounded-xl">
                      <div className="flex justify-between"><span>Lineage:</span> <span className="font-serif font-medium">{activeLook.garment}</span></div>
                      <div className="flex justify-between"><span>Textile:</span> <span className="font-serif font-medium">{activeLook.material}</span></div>
                      <div className="flex justify-between"><span>Hue:</span> <span className="font-serif font-medium capitalize">{activeLook.color}</span></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-2xl backdrop-blur-sm bg-background/60">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl font-serif font-bold text-foreground">
                  {activeLook.source === "design" ? "The Rite of Passage" : "Preview Export"}
                </CardTitle>
                <CardDescription className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                  {activeLook.source === "design"
                    ? "Eternalize your vision. The watermark veils until the rite is complete."
                    : "Export this preview summary while the full avatar pipeline continues to evolve."}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-8 space-y-6">
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <Button
                    onClick={exportDesign}
                    disabled={exporting}
                    className="flex-1 max-w-md h-16 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground text-lg font-serif font-semibold shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105"
                    size="lg"
                  >
                    {exporting ? "Preparing Export..." : "Export Preview Summary"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}

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
