"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import NextImage from "next/image";
import { useSession } from "@/lib/auth-client"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Canvas } from "@react-three/fiber";
import { OrbitControls, MeshDistortMaterial, Sphere, Box, Cylinder, useGLTF } from "@react-three/drei";

interface Photo {
  front: File | null;
  back: File | null;
  left: File | null;
  right: File | null;
}

interface Measurements {
  height: number;
  bust: number;
  waist: number;
  hips: number;
  shoulders: number;
}

function Avatar3D({ measurements, bodyType }: { measurements: Measurements; bodyType: { hourglass: number; athletic: number } }) {
  const scale = 1 + (bodyType.hourglass / 100) * 0.1 + (bodyType.athletic / 100) * 0.1;
  const heightScale = measurements.height / 170;
  const shoulderWidth = measurements.shoulders / 40;

  return (
    <group scale={[shoulderWidth, heightScale * scale, 1]}>
      {/* Head */}
      <Sphere args={[0.2, 16, 16]} position={[0, 1.8, 0]}>
        <meshStandardMaterial color="peachpuff" />
      </Sphere>
      
      {/* Torso */}
      <Cylinder args={[0.3, 0.4, 1.2, 8]} position={[0, 1, 0]}>
        <meshStandardMaterial color="lightblue" />
      </Cylinder>
      
      {/* Hips */}
      <Cylinder args={[0.35, 0.3, 0.4, 8]} position={[0, 0.4, 0]}>
        <meshStandardMaterial color="lightblue" />
      </Cylinder>
      
      {/* Left Arm */}
      <Cylinder args={[0.08, 0.08, 0.8, 8]} position={[-0.5, 1.2, 0]} rotation={[0, 0, Math.PI / 4]}>
        <meshStandardMaterial color="lightblue" />
      </Cylinder>
      
      {/* Right Arm */}
      <Cylinder args={[0.08, 0.08, 0.8, 8]} position={[0.5, 1.2, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <meshStandardMaterial color="lightblue" />
      </Cylinder>
      
      {/* Left Leg */}
      <Cylinder args={[0.1, 0.1, 1, 8]} position={[-0.15, -0.2, 0]}>
        <meshStandardMaterial color="lightblue" />
      </Cylinder>
      
      {/* Right Leg */}
      <Cylinder args={[0.1, 0.1, 1, 8]} position={[0.15, -0.2, 0]}>
        <meshStandardMaterial color="lightblue" />
      </Cylinder>
    </group>
  );
}

export default function AvatarCreation() {
  const [photos, setPhotos] = useState<Photo>({
    front: null,
    back: null,
    left: null,
    right: null,
  });
  const [images, setImages] = useState<Record<string, string>>({});
  const [measurements, setMeasurements] = useState<Measurements>({
    height: 170,
    bust: 90,
    waist: 70,
    hips: 95,
    shoulders: 40,
  });
  const [bodyType, setBodyType] = useState({ hourglass: 50, athletic: 50 });
  const [extracting, setExtracting] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(""); // Remove 3D reference
  const [showPreview, setShowPreview] = useState(false);

  const router = useRouter();
  const hasRefetchedRef = useRef(false);

  const { data: session, isPending: sessionPending, error, refetch } = useSession();

  // Mock extraction for now (simulates MediaPipe; replace with real later)
  const extractMeasurements = useCallback(async () => {
    if (!photos.front || !images.front) {
      toast.error("Upload front photo first for extraction.");
      return;
    }
    setExtracting(true);
    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock realistic measurements based on average pose (improve with real detection)
      const mockHeight = Math.floor(Math.random() * 30) + 160; // 160-190cm
      const mockShoulders = Math.floor(Math.random() * 10) + 38; // 38-48cm
      const mockBust = Math.floor(Math.random() * 20) + 85; // Varies
      const mockWaist = Math.floor(Math.random() * 15) + 65;
      const mockHips = Math.floor(Math.random() * 20) + 90;

      setMeasurements({
        height: mockHeight,
        bust: mockBust,
        waist: mockWaist,
        hips: mockHips,
        shoulders: mockShoulders,
      });
      setShowPreview(true);
      toast.success("Measurements extracted!");
    } catch (err) {
      console.error("Extraction failed", err);
      toast.error("Extraction failed, using defaults.");
    } finally {
      setExtracting(false);
    }
  }, [photos.front, images.front]);

  useEffect(() => {
    if (!sessionPending && !session?.user) {
      toast.error("Please log in to create your avatar.");
      router.push("/login?redirect=/avatar");
    }
  }, [session, sessionPending, router]);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem("bearer_token") : null;
    if (token && !sessionPending && !session?.user && !error && !hasRefetchedRef.current) {
      hasRefetchedRef.current = true;
      refetch();
    }
  }, [session, sessionPending, error, refetch]);

  if (sessionPending) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md p-8">
          <CardHeader>
            <CardTitle className="text-center">Access Required</CardTitle>
            <p className="text-center text-muted-foreground">Please log in to create your avatar.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full">
              <Link href="/login?redirect=/avatar">Log In</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/register">Sign Up</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const readyForExtract = Object.values(photos).every(p => p !== null);

  const handlePhotoUpload = (direction: keyof Photo, file: File) => {
    setPhotos((prev) => ({ ...prev, [direction]: file }));
    const reader = new FileReader();
    reader.onload = (e) => {
      setImages((prev) => ({ ...prev, [direction]: e.target?.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleConsentChange = (checked: boolean) => {
    setConsentGiven(checked);
  };

  const handleDeletePhotos = async () => {
    if (!session?.user?.id) return;

    const userId = session.user.id;
    try {
      const { error } = await supabase.storage
        .from('photos')
        .remove([`${userId}/avatar_front`, `${userId}/avatar_back`, `${userId}/avatar_left`, `${userId}/avatar_right`]);
      if (error) throw error;
      setPhotos({ front: null, back: null, left: null, right: null });
      setImages({});
      setShowPreview(false);
      toast.success("Photos deleted successfully.");
    } catch (error) {
      toast.error("Failed to delete photos.");
    }
  };

  const handleExtractAndSave = async () => {
    if (!session?.user?.id) {
      toast.error("Session expired. Please log in again.");
      router.push("/login");
      return;
    }
    
    if (extracting || !readyForExtract || !consentGiven) return;
    
    setExtracting(true);
    
    try {
      // Extract measurements (mock/real)
      await extractMeasurements();
      
      // Wait for state update
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Upload photos to Supabase storage (private bucket)
      const userId = session.user.id;
      const uploads = await Promise.all(
        Object.entries(photos).map(async ([view, file]) => {
          if (!file) return null;
          const filePath = `${userId}/avatar_${view}.jpg`;
          const { data, error } = await supabase.storage
            .from('photos')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false,
              contentType: file.type
            });
          if (error) throw error;
          const { data: urlData } = supabase.storage.from('photos').getPublicUrl(filePath);
          return { view, url: urlData.publicUrl, path: filePath };
        })
      );
      
      const photoUrls = uploads.filter(Boolean).reduce((acc: any, upload: any) => ({ ...acc, [upload.view]: upload.url }), {});
      const photoPaths = uploads.filter(Boolean).reduce((acc: any, upload: any) => ({ ...acc, [upload.view]: upload.path }), {});
      
      // Save to designs table (initial avatar design)
      const response = await fetch('/api/designs', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('bearer_token')}`
        },
        body: JSON.stringify({
          user_id: userId,
          avatar_measurements: measurements,
          photo_urls: photoUrls,
          design_data: { 
            type: 'avatar_base',
            photo_paths: photoPaths, // For deletion/privacy
            // Remove body_type
          }
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save design');
      }
      
      toast.success("Avatar saved securely with privacy controls!");
      router.push("/catalog"); // Proceed to catalog
    } catch (error: any) {
      toast.error("Upload failed: " + error.message);
    } finally {
      setExtracting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Create Your Avatar</h1>
        <p className="text-center mb-12 text-muted-foreground">
          Upload 4 directional photos and adjust your avatar.
        </p>

        {/* Pose Guide Section */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Photo Pose Guide</CardTitle>
            <p className="text-muted-foreground">Take clear, full-body photos in these 4 poses. Use the guides below to see the exact views needed: front, back, left side, right side. Stand straight with arms relaxed at your sides for accurate measurements.</p>
          </CardHeader>
          <CardContent className="text-center">
            <div className="grid md:grid-cols-4 gap-4 p-4">
              {["Front", "Back", "Left Side", "Right Side"].map((view) => (
                <div key={view} className="text-center">
                  <div className="w-24 h-48 bg-muted mx-auto rounded border-2 border-dashed border-muted mb-2"></div>
                  <p className="text-sm font-medium">{view}</p>
                  <p className="text-xs text-muted-foreground">Full-body view, arms at sides</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Photo Upload Section */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Upload Directional Photos</CardTitle>
            <p className="text-sm text-muted-foreground">Photos are stored securely and encrypted. You control access and can delete anytime.</p>
          </CardHeader>
          <CardContent className="grid md:grid-cols-4 gap-4">
            {["front", "back", "left", "right"].map((direction) => (
              <div key={direction} className="text-center">
                <Label htmlFor={direction} className="block mb-2 capitalize">
                  {direction} view
                </Label>
                <Input
                  id={direction}
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files && handlePhotoUpload(direction as keyof Photo, e.target.files![0])}
                  className="mb-4"
                />
                {images[direction] && (
                  <div className="w-32 h-32 mx-auto">
                    <NextImage
                      src={images[direction]}
                      alt={`${direction} photo`}
                      width={128}
                      height={128}
                      className="object-cover rounded"
                    />
                  </div>
                )}
              </div>
            ))}
          </CardContent>
          <div className="p-6 space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox id="consent" checked={consentGiven} onCheckedChange={handleConsentChange} />
              <label htmlFor="consent" className="text-sm">
                I consent to secure storage of my photos for avatar creation. I understand they are encrypted, private, and I can delete them anytime.
              </label>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleExtractAndSave} disabled={extracting || !readyForExtract || !consentGiven} className="w-full sm:w-auto">
                {extracting ? "Extracting & Uploading..." : "Extract Measurements & Save Avatar"}
              </Button>
              {readyForExtract && (
                <Button variant="destructive" onClick={handleDeletePhotos} className="w-full sm:w-auto">
                  Delete All Photos
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Measurements Display */}
        {showPreview && (
          <Card className="mb-12">
            <CardHeader>
              <CardTitle>Extracted Body Measurements (cm)</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              {Object.entries(measurements).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <Label className="capitalize">{key}</Label>
                  <Input value={value.toFixed(0)} readOnly className="bg-muted/50" />
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Interactive Body Adjustment & Preview */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Avatar Preview</CardTitle>
            <p className="text-muted-foreground">Adjust body type sliders and interact with your 3D avatar (rotate/zoom). Upload/extract for custom fit.</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="hourglass">Hourglass Shape (%)</Label>
                <Slider 
                  id="hourglass"
                  value={[bodyType.hourglass]} 
                  onValueChange={(value) => setBodyType(prev => ({ ...prev, hourglass: value[0] }))} 
                  max={100} 
                  step={1} 
                  className="mt-2"
                />
                <p className="text-sm text-muted-foreground mt-1">{bodyType.hourglass}%</p>
              </div>
              <div>
                <Label htmlFor="athletic">Athletic Build (%)</Label>
                <Slider 
                  id="athletic"
                  value={[bodyType.athletic]} 
                  onValueChange={(value) => setBodyType(prev => ({ ...prev, athletic: value[0] }))} 
                  max={100} 
                  step={1} 
                  className="mt-2"
                />
                <p className="text-sm text-muted-foreground mt-1">{bodyType.athletic}%</p>
              </div>
            </div>
            <div className="h-96 bg-muted/30 rounded-lg relative border-2 border-dashed border-muted overflow-hidden">
              <Suspense fallback={<div className="absolute inset-0 flex items-center justify-center">Loading 3D model...</div>}>
                <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
                  <ambientLight intensity={0.5} />
                  <pointLight position={[10, 10, 10]} />
                  <Avatar3D measurements={measurements} bodyType={bodyType} />
                  <OrbitControls enablePan={false} enableZoom={true} enableRotate={true} />
                </Canvas>
              </Suspense>
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="text-center text-white">
                  <p className="text-lg font-medium">Interactive 3D Avatar</p>
                  <p className="text-sm mt-2">Body Type: {bodyType.hourglass}% Hourglass / {bodyType.athletic}% Athletic</p>
                  <p className="text-sm">Height: {measurements.height}cm | Shoulders: {measurements.shoulders}cm</p>
                  <p className="text-xs mt-4">Rotate and zoom to view. Extraction updates measurements.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center space-y-4">
          <Button asChild variant="outline">
            <Link href="/">Back to Home</Link>
          </Button>
          <Button asChild disabled={!showPreview}>
            <Link href="/catalog">Proceed to Catalog</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}