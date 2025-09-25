"use client";

import { useState, useRef, useEffect, useCallback, useMemo, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import NextImage from "next/image";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Bounds } from "@react-three/drei";
import { PoseLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { useSession } from "@/lib/auth-client"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

let poseLandmarker: PoseLandmarker | null = null;

const createPoseLandmarker = async () => {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
  );
  poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`,
      delegate: "GPU"
    },
    runningMode: "IMAGE",
    numPoses: 1
  });
};

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

const PoseView = ({ gltf, rotationY }: { gltf: any; rotationY: number }) => {
  const clonedScene = useMemo(() => {
    const clone = gltf.scene.clone();
    clone.rotation.y = rotationY;
    clone.scale.set(1.0, 1.0, 1.0);
    clone.position.set(0, 0, 0);
    return clone;
  }, [gltf, rotationY]);
  
  return (
    <Canvas 
      camera={{ 
        position: [0, 0, 5],
        fov: 45,
        near: 0.1,
        far: 20 
      }} 
      style={{ height: '100%', width: '100%' }}
    >
      <ambientLight intensity={0.6} />
      <pointLight position={[5, 5, 5]} intensity={1.2} />
      <Bounds fit clip observe margin={1}>
        <primitive object={clonedScene} dispose={null} />
      </Bounds>
      <OrbitControls 
        enablePan={false} 
        enableZoom={true} 
        enableRotate={true} 
        minDistance={2} 
        maxDistance={6}
        target={[0, 0, 0]}
        autoRotate={false}
        dampingFactor={0.05}
      />
    </Canvas>
  );
};

const AvatarModel = ({ measurements, gltf }: { measurements: Measurements; gltf: any }) => {
  const clonedScene = useMemo(() => {
    const baseHeight = 170, baseBust = 90, baseWaist = 70, baseHips = 95, baseShoulders = 40;
    const scaleY = measurements.height / baseHeight * 0.2;
    const scaleHips = measurements.hips / baseHips * 0.2;
    const scaleShoulders = measurements.shoulders / baseShoulders * 0.2;
    
    const clone = gltf.scene.clone();
    clone.scale.set(scaleShoulders, scaleY, scaleHips);
    clone.position.set(0, 0, 0);
    clone.rotation.y = 0;
    return clone;
  }, [measurements, gltf]);
  
  return <primitive object={clonedScene} dispose={null} />;
};

const PoseGuideModel = () => {
  const gltf = useGLTF("https://modelviewer.dev/shared-assets/models/Astronaut.glb");
  const { scene } = gltf;
  
  useEffect(() => {
    if (scene) {
      scene.scale.set(2, 2, 2);
      scene.position.set(0, -1, 0);
    }
  }, [scene]);
  
  return <primitive object={scene} dispose={null} />;
};

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
  const [avatarUrl, setAvatarUrl] = useState(""); // Ready Player Me avatar URL
  const fileInputRefs = useRef<{
    front: HTMLInputElement | null;
    back: HTMLInputElement | null;
    left: HTMLInputElement | null;
    right: HTMLInputElement | null;
  }>({
    front: null,
    back: null,
    left: null,
    right: null,
  });
  const router = useRouter();
  const hasRefetchedRef = useRef(false);

  const { data: session, isPending: sessionPending, error, refetch } = useSession();

  const url = "https://modelviewer.dev/shared-assets/models/Astronaut.glb";
  const gltf = useGLTF(url);

  const extractMeasurements = useCallback(async () => {
    if (!poseLandmarker || !photos.front) return;
    setExtracting(true);
    try {
      // Use a DOM Image element (not Next.js Image component)
      const img = new window.Image();
      img.onload = async () => {
        try {
          const results = await poseLandmarker!.detect(img);
          if (results.landmarks && results.landmarks.length > 0) {
            const landmarks = results.landmarks[0] as any;

            const leftShoulder = landmarks[11];
            const rightShoulder = landmarks[12];
            const leftHip = landmarks[23];
            const rightHip = landmarks[24];
            const nose = landmarks[0];
            const leftAnkle = landmarks[27];
            const rightAnkle = landmarks[29];

            // Convert normalized coordinates to pixels using image dimensions
            const shoulderWidthPx = Math.hypot(
              (rightShoulder.x - leftShoulder.x) * img.width,
              (rightShoulder.y - leftShoulder.y) * img.height
            );
            const hipWidthPx = Math.hypot(
              (rightHip.x - leftHip.x) * img.width,
              (rightHip.y - leftHip.y) * img.height
            );
            const heightPixelsPx = (Math.max(leftAnkle.y, rightAnkle.y) - nose.y) * img.height;

            // Assume average shoulder width is 40cm for scaling
            const pixelToCm = 40 / Math.max(shoulderWidthPx, 1);
            const heightCm = heightPixelsPx * pixelToCm;
            const bustCm = shoulderWidthPx * pixelToCm * 0.8 + 20; // Approximate
            const waistCm = hipWidthPx * pixelToCm * 0.9; // Approximate
            const hipsCm = hipWidthPx * pixelToCm;

            const extractedMeasurements = {
              height: Math.round(heightCm),
              bust: Math.round(bustCm),
              waist: Math.round(waistCm),
              hips: Math.round(hipsCm),
              shoulders: Math.round(shoulderWidthPx * pixelToCm),
            };

            setMeasurements(extractedMeasurements);
          }
        } catch (err) {
          console.error("Measurement extraction failed", err);
          toast.error("Measurement extraction failed, using defaults.");
        } finally {
          setExtracting(false);
        }
      };
      img.onerror = () => {
        setExtracting(false);
        toast.error("Failed to load image for measurement.");
      };
      img.src = images.front as string;

      // For now, use front for basic measurements
    } catch (error) {
      console.error("Measurement extraction failed", error);
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

  useEffect(() => {
    createPoseLandmarker();
  }, []);

  if (sessionPending) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!session?.user) return null;

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
        .remove([`${userId}/avatar_${'front'}`, `${userId}/avatar_${'back'}`, `${userId}/avatar_${'left'}`, `${userId}/avatar_${'right'}`]);
      if (error) throw error;
      setPhotos({ front: null, back: null, left: null, right: null });
      setImages({});
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
    
    setExtracting(true)
    
    try {
      // Extract measurements
      await extractMeasurements();
      
      // Wait for state update
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Upload photos to Supabase storage (private bucket)
      const userId = session.user.id
      const uploads = await Promise.all(
        Object.entries(photos).map(async ([view, file]) => {
          if (!file) return null
          const filePath = `${userId}/avatar_${view}.jpg`;
          const { data, error } = await supabase.storage
            .from('photos')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false,
              contentType: file.type
            })
          if (error) throw error
          const { data: urlData } = supabase.storage.from('photos').getPublicUrl(filePath)
          return { view, url: urlData.publicUrl, path: filePath }
        })
      )
      
      const photoUrls = uploads.filter(Boolean).reduce((acc: any, upload: any) => ({ ...acc, [upload.view]: upload.url }), {})
      const photoPaths = uploads.filter(Boolean).reduce((acc: any, upload: any) => ({ ...acc, [upload.view]: upload.path }), {})
      
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
            body_type: bodyType
          }
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save design');
      }
      
      toast.success("Avatar saved securely with privacy controls!")
      router.push("/catalog") // Proceed to catalog
    } catch (error: any) {
      toast.error("Upload failed: " + error.message)
    } finally {
      setExtracting(false)
    }
  }

  const generateAvatar = async () => {
    setAvatarUrl("https://modelviewer.dev/shared-assets/models/Astronaut.glb");
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Create Your 3D Avatar</h1>
        <p className="text-center mb-12 text-muted-foreground">
          Upload 4 directional photos and adjust your avatar.
        </p>

        {/* Pose Guide Section */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Photo Pose Guide</CardTitle>
            <p className="text-muted-foreground">Take clear, full-body photos in these 4 poses. Use the guides below to see the exact views needed: front, back, left side, right side. Stand straight with arms relaxed at your sides for accurate measurements. You can rotate and zoom each model for better preview.</p>
          </CardHeader>
          <CardContent className="grid md:grid-cols-4 gap-4 w-full">
            <div className="text-center space-y-2">
              <h3 className="font-semibold">Front View</h3>
              <div className="h-64 w-full bg-muted/30 rounded">
                <Suspense fallback={<div className="flex items-center justify-center h-full bg-muted/50 text-xs">Loading model...</div>}>
                  <PoseView gltf={gltf} rotationY={0} />
                </Suspense>
              </div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="font-semibold">Back View</h3>
              <div className="h-64 w-full bg-muted/30 rounded">
                <Suspense fallback={<div className="flex items-center justify-center h-full bg-muted/50 text-xs">Loading model...</div>}>
                  <PoseView gltf={gltf} rotationY={Math.PI} />
                </Suspense>
              </div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="font-semibold">Left Side</h3>
              <div className="h-64 w-full bg-muted/30 rounded">
                <Suspense fallback={<div className="flex items-center justify-center h-full bg-muted/50 text-xs">Loading model...</div>}>
                  <PoseView gltf={gltf} rotationY={Math.PI / 2} />
                </Suspense>
              </div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="font-semibold">Right Side</h3>
              <div className="h-64 w-full bg-muted/30 rounded">
                <Suspense fallback={<div className="flex items-center justify-center h-full bg-muted/50 text-xs">Loading model...</div>}>
                  <PoseView gltf={gltf} rotationY={-Math.PI / 2} />
                </Suspense>
              </div>
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
                  onChange={(e) => e.target.files && handlePhotoUpload(direction as keyof Photo, e.target.files[0])}
                  ref={(el) => {
                    if (el) {
                      (fileInputRefs.current as any)[direction as keyof Photo] = el;
                    }
                  }}
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
            {/* Privacy Consent */}
            <div className="flex items-center space-x-2">
              <Checkbox id="consent" onCheckedChange={handleConsentChange} />
              <Label htmlFor="consent" className="text-sm">
                I consent to secure storage of my photos for avatar creation. I understand they are encrypted, private, and I can delete them anytime.
              </Label>
            </div>
            <Button onClick={handleExtractAndSave} disabled={extracting || !readyForExtract || !consentGiven} className="w-full md:w-auto mr-4">
              {extracting ? "Uploading..." : "Extract & Save Avatar"}
            </Button>
            <Button onClick={generateAvatar} className="w-full md:w-auto mr-4" disabled={!readyForExtract}>
              Generate Avatar Preview
            </Button>
            {readyForExtract && (
              <Button variant="destructive" onClick={handleDeletePhotos} className="w-full md:w-auto">
                Delete Photos
              </Button>
            )}
          </div>
        </Card>

        {/* Measurements Display */}
        {readyForExtract && (
          <Card className="mb-12">
            <CardHeader>
              <CardTitle>Extracted Body Measurements (cm)</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              {Object.entries(measurements).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <Label className="capitalize">{key}</Label>
                  <Input value={`${value.toFixed(1)}`} readOnly />
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Interactive Body Adjustment */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Adjust Body Type</CardTitle>
            <p className="text-muted-foreground">Fine-tune interactively.</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label>Hourglass Figure</Label>
              <Slider
                value={[bodyType.hourglass]}
                onValueChange={(value) => setBodyType((prev) => ({ ...prev, hourglass: value[0] }))}
                max={100}
                step={1}
              />
              <div>{bodyType.hourglass}%</div>
            </div>
            <div className="space-y-4">
              <Label>Athletic Build</Label>
              <Slider
                value={[bodyType.athletic]}
                onValueChange={(value) => setBodyType((prev) => ({ ...prev, athletic: value[0] }))}
                max={100}
                step={1}
              />
              <div>{bodyType.athletic}%</div>
            </div>
            {/* 3D Preview */}
            {avatarUrl && (
              <div className="h-96">
                <Canvas 
                  camera={{ 
                    position: [0, 0, 5], 
                    fov: 50,
                    near: 0.1,
                    far: 15 
                  }} 
                  style={{ height: '100%', width: '100%' }}
                >
                  <Suspense fallback={<div className="flex items-center justify-center h-full bg-muted/50 text-xs">Loading preview...</div>}>
                    <ambientLight intensity={0.6} />
                    <pointLight position={[5, 5, 5]} intensity={1.2} />
                    <AvatarModel measurements={measurements} gltf={gltf} />
                    <OrbitControls 
                      enablePan={false}
                      minDistance={2}
                      maxDistance={8}
                      target={[0, 0, 0]}
                    />
                  </Suspense>
                </Canvas>
              </div>
            )}
            {!avatarUrl && (
              <div className="w-full h-96 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
                Upload photos and extract measurements to generate 3D avatar.
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center space-x-4">
          <Button asChild>
            <Link href="/">Back to Home</Link>
          </Button>
          <Button variant="outline" asChild disabled={!readyForExtract}>
            <Link href="/catalog">Proceed to Catalog</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}