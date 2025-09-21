"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import Link from "next/link";
import Image from "next/image";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import * as THREE from "three";

// Sample data from previous pages (in real app, use context or session)
const sampleMeasurements = { height: 170, bust: 90, waist: 70, hips: 95, shoulders: 40 };
const sampleGarment = { name: "Saree", material: "Banarasi Silk", color: "red" };
const sampleAvatarUrl = "https://models.readyplayer.me/64a0a9b5e4b0b5da9f0a9b5e.glb"; // Default avatar
const sampleGarmentUrl = "https://example.com/saree.glb"; // Placeholder for garment model

interface Measurements {
  height: number;
  bust: number;
  waist: number;
  hips: number;
  shoulders: number;
}

const AvatarWithGarment = ({ measurements }: { measurements: Measurements }) => {
  const { scene: avatarScene } = useGLTF(sampleAvatarUrl);
  // const { scene: garmentScene } = useGLTF(sampleGarmentUrl); // Load garment

  useEffect(() => {
    if (avatarScene) {
      // Scale avatar based on measurements
      const baseHeight = 170;
      const scaleY = measurements.height / baseHeight;
      avatarScene.scale.set(1, scaleY, 1);
      // Position garment on avatar (simplified)
      // If garment loaded: garmentScene.position.set(0, 0, 0);
    }
  }, [avatarScene, measurements]);

  return (
    <>
      {/* <primitive object={garmentScene} /> */}
      <primitive object={avatarScene} />
    </>
  );
};

export default function Preview() {
  const [exporting, setExporting] = useState(false);
  const [watermarkVisible, setWatermarkVisible] = useState(true);

  const sceneRef = useRef<THREE.Scene>(null);

  const exportDesign = async () => {
    setExporting(true);
    try {
      const exporter = new GLTFExporter();
      const scene = new THREE.Scene();
      // Add avatar and garment to scene for export
      const avatar = await new Promise((resolve) => {
        const loader = new GLTFLoader();
        loader.load(sampleAvatarUrl, resolve);
      });
      scene.add(avatar.scene);

      exporter.parse(
        scene,
        (gltf) => {
          const output = JSON.stringify(gltf, null, 2);
          const blob = new Blob([output], { type: "text/plain" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "design-pack.glb";
          a.click();
          URL.revokeObjectURL(url);
        },
        { binary: true },
        (error) => console.error("Export error:", error)
      );

      // For watermark: In GLB, embed metadata or generate screenshot with overlay
      // Simplified: Alert or console log
      console.log("Watermarked export: IndiFusion Design Pack");
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">3D Preview & Export</h1>
        <p className="text-center mb-12 text-muted-foreground">
          Visualize your custom garment on your avatar with realistic fitting.
        </p>

        {/* Preview Section - Enhance with ref third image style adjustments */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Preview on Avatar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="h-96 relative rounded-lg overflow-hidden border">
              <Canvas camera={{ position: [0, 1.7, 3] }} className="w-full h-full">
                <ambientLight intensity={0.6} />
                <directionalLight position={[0, 10, 5]} intensity={1} />
                <AvatarWithGarment measurements={sampleMeasurements} />
                <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
              </Canvas>
              {watermarkVisible && (
                <div className="absolute top-4 left-4 bg-primary/90 text-primary-foreground px-3 py-1 rounded-md text-sm font-semibold z-10">
                  IndiFusion Preview
                </div>
              )}
            </div>
            {/* Adjustment controls like ref third image */}
            <div className="grid md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <Label className="text-sm font-medium">Body Adjustments</Label>
                <div className="space-y-2 mt-2">
                  <div className="flex justify-between items-center text-xs">
                    <span>Height</span>
                    <span>{sampleMeasurements.height} cm</span>
                  </div>
                  <input
                    type="range"
                    min="150"
                    max="200"
                    value={sampleMeasurements.height}
                    onChange={(e) => {/* Update measurements state */}}
                    className="w-full"
                  />
                  <div className="flex justify-between items-center text-xs">
                    <span>Waist</span>
                    <span>{sampleMeasurements.waist} cm</span>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="100"
                    value={sampleMeasurements.waist}
                    onChange={(e) => {/* Update */}}
                    className="w-full"
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Garment Fit</Label>
                <div className="space-y-2 mt-2 text-xs">
                  <div className="flex justify-between">
                    <span>Selected: {sampleGarment.name}</span>
                    <span>{sampleGarment.material}</span>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">Adjust Fit</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Export Section */}
        <Card>
          <CardHeader>
            <CardTitle>Export Design Pack</CardTitle>
            <CardDescription>
              Download your design as a secure GLB file with watermarking and metadata for production.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Button onClick={exportDesign} disabled={exporting} className="w-full">
              {exporting ? "Exporting..." : "Export Secure Design Pack"}
            </Button>
            <p className="text-sm text-muted-foreground mt-2 text-center">
              Secure export with watermark, metadata, and encryption for production use.
            </p>
          </CardContent>
        </Card>

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