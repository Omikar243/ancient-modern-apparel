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
}

interface Measurements {
  height: number;
  bust: number;
  waist: number;
  hips: number;
  shoulders: number;
}

const AvatarWithGarment = ({ measurements, avatarUrl, garment, material, color }: { measurements: Measurements; avatarUrl: string; garment: string; material: string; color: string }) => {
  const { scene: avatarScene } = useGLTF(avatarUrl || defaultAvatarUrl);

  useEffect(() => {
    if (avatarScene) {
      // Scale based on measurements (prototype simplification)
      const baseHeight = 170;
      const scaleY = measurements.height / baseHeight;
      avatarScene.scale.set(1, scaleY, 1);
      // Simulate garment overlay (text for prototype; real: load GLTF)
      const overlay = new THREE.Mesh(
        new THREE.PlaneGeometry(2, 1),
        new THREE.MeshBasicMaterial({ color: color === "red" ? "red" : "blue", transparent: true, opacity: 0.7 })
      );
      overlay.position.set(0, 1, 0);
      avatarScene.add(overlay);
    }
  }, [avatarScene, measurements, color]);

  return (
    <>
      <primitive object={avatarScene} />
      {/* Garment text overlay for prototype */}
      <mesh position={[0, 2, 0]}>
        <planeGeometry args={[3, 1]} />
        <meshBasicMaterial color="white" transparent opacity={0.8} />
        <text geometry={new THREE.TextGeometry(`${garment} - ${material}`, { font: null })} position={[0, 0, 0.01]} />
      </mesh>
    </>
  );
};

export default function Preview() {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [selectedDesign, setSelectedDesign] = useState<Design | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    const fetchDesigns = async () => {
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/designs?userId=${session.user.id}`);
        if (res.ok) {
          const data = await res.json();
          setDesigns(data);
          if (data.length > 0 && !selectedDesign) {
            setSelectedDesign(data[0]); // Auto-select first
          }
        }
      } catch (error) {
        toast.error("Failed to load designs");
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchDesigns();
    }
  }, [session]);

  useEffect(() => {
    if (!loading && !session?.user) {
      router.push("/login?redirect=/preview");
    }
  }, [session, loading, router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading designs...</div>;
  }

  if (!session?.user) return null;

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
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">3D Preview & Export</h1>
        <p className="text-center mb-12 text-muted-foreground">Select a saved design to preview and export after purchase.</p>

        {/* Designs List */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Saved Designs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {designs.map((design) => (
                <Card key={design.id} className={`cursor-pointer p-4 hover:bg-accent ${selectedDesign?.id === design.id ? "ring-2 ring-primary" : ""}`} onClick={() => setSelectedDesign(design)}>
                  <CardTitle className="text-lg">{design.name}</CardTitle>
                  <CardDescription>{design.garment} - {design.material}</CardDescription>
                  <p className="text-xs">Purchased: {design.purchased ? "Yes" : "No"}</p>
                </Card>
              ))}
            </div>
            {!designs.length && <p className="text-center text-muted-foreground">No designs saved. Create one in Avatar or Catalog.</p>}
          </CardContent>
        </Card>

        {selectedDesign && (
          <>
            {/* Preview Section */}
            <Card className="mb-12">
              <CardHeader>
                <CardTitle>Preview: {selectedDesign.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="h-96 relative rounded-lg overflow-hidden border">
                  <Canvas camera={{ position: [0, 1.7, 3] }}>
                    <ambientLight intensity={0.6} />
                    <directionalLight position={[0, 10, 5]} intensity={1} />
                    <AvatarWithGarment
                      measurements={selectedDesign.measurements}
                      avatarUrl={selectedDesign.avatarUrl}
                      garment={selectedDesign.garment}
                      material={selectedDesign.material}
                      color={selectedDesign.color}
                    />
                    <OrbitControls />
                  </Canvas>
                  {!selectedDesign.purchased && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white text-2xl font-bold z-10">
                      Purchase to Remove Watermark
                    </div>
                  )}
                </div>
                {/* Adjustments */}
                <div className="grid md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div>
                    <Label>Body Adjustments</Label>
                    <div className="space-y-2 mt-2">
                      <div className="flex justify-between text-xs"><span>Height:</span> <span>{selectedDesign.measurements.height}cm</span></div>
                      <input type="range" min="150" max="200" value={selectedDesign.measurements.height} readOnly className="w-full" />
                      <div className="flex justify-between text-xs"><span>Waist:</span> <span>{selectedDesign.measurements.waist}cm</span></div>
                      <input type="range" min="60" max="100" value={selectedDesign.measurements.waist} readOnly className="w-full" />
                    </div>
                  </div>
                  <div>
                    <Label>Design Details</Label>
                    <div className="space-y-2 mt-2 text-xs">
                      <div>Garment: {selectedDesign.garment}</div>
                      <div>Material: {selectedDesign.material}</div>
                      <div>Color: {selectedDesign.color}</div>
                      <Button variant="outline" size="sm" className="w-full mt-2">Edit in Catalog</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Purchase & Export */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
                <CardDescription>Complete purchase to export without watermark.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {!selectedDesign.purchased ? (
                  <Button onClick={() => handlePurchase(selectedDesign.id)} className="w-full">
                    Dummy Purchase ($0 - Prototype) - Unlock Export
                  </Button>
                ) : (
                  <Button onClick={() => exportDesign(selectedDesign)} disabled={exporting} className="w-full">
                    {exporting ? "Exporting..." : "Export Design Pack (JSON/PDF)"}
                  </Button>
                )}
                <p className="text-sm text-muted-foreground text-center">Dummy purchase for prototype; real payments later.</p>
              </CardContent>
            </Card>
          </>
        )}

        <div className="text-center space-x-4 mt-8">
          <Button asChild variant="outline">
            <Link href="/catalog">Back to Catalog</Link>
          </Button>
          <Button asChild>
            <Link href="/">Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}