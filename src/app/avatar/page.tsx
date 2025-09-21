"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import Link from "next/link";
import NextImage from "next/image";
import { FilesManager, Avatar } from "@readyplayerme/visage";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { PoseLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

// Add MediaPipe setup
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
  const [avatarUrl, setAvatarUrl] = useState(""); // Ready Player Me avatar URL
  const fileInputRefs = useRef({
    front: useRef<HTMLInputElement>(null),
    back: useRef<HTMLInputElement>(null),
    left: useRef<HTMLInputElement>(null),
    right: useRef<HTMLInputElement>(null),
  });

  useEffect(() => {
    createPoseLandmarker();
  }, []);

  const handlePhotoUpload = (direction: keyof Photo, file: File) => {
    setPhotos((prev) => ({ ...prev, [direction]: file }));
    const reader = new FileReader();
    reader.onload = (e) => {
      setImages((prev) => ({ ...prev, [direction]: e.target?.result as string }));
    };
    reader.readAsDataURL(file);
  };

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

            setMeasurements({
              height: heightCm,
              bust: bustCm,
              waist: waistCm,
              hips: hipsCm,
              shoulders: shoulderWidthPx * pixelToCm,
            });
          }
        } catch (err) {
          console.error("Measurement extraction failed", err);
        } finally {
          setExtracting(false);
        }
      };
      img.onerror = () => setExtracting(false);
      img.src = images.front;

      // For now, use front for basic measurements
    } catch (error) {
      console.error("Measurement extraction failed", error);
      setExtracting(false);
    }
  }, [poseLandmarker, photos, images]);

  const generateAvatar = async () => {
    // Use Ready Player Me API to generate avatar from photos or measurements
    // For now, load a default avatar
    setAvatarUrl("https://models.readyplayer.me/64a0a9b5e4b0b5da9f0a9b5e.glb"); // Sample
  };

  const AvatarModel = ({ measurements }: { measurements: Measurements }) => {
    const { scene } = useGLTF(avatarUrl);
    
    // Scale factors based on measurements (assume base model measurements)
    const baseHeight = 170, baseBust = 90, baseWaist = 70, baseHips = 95, baseShoulders = 40;
    const scaleY = measurements.height / baseHeight;
    const scaleTorso = (measurements.bust + measurements.waist) / (baseBust + baseWaist) * 0.5;
    const scaleHips = measurements.hips / baseHips;
    const scaleShoulders = measurements.shoulders / baseShoulders;
    
    useEffect(() => {
      if (scene) {
        // Assuming model has groups or bones for torso, hips, etc.
        // This is simplified; in practice, traverse scene and scale specific parts
        scene.scale.set(scaleShoulders * 0.8, scaleY, scaleHips * 0.8);
        // For more precise, find mesh names like 'torso' and scale locally
      }
    }, [measurements, scene]);
    
    return <primitive object={scene} />;
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Create Your 3D Avatar</h1>
        <p className="text-center mb-12 text-muted-foreground">
          Upload 4 directional photos and adjust your avatar.
        </p>

        {/* Photo Upload Section */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Upload Directional Photos</CardTitle>
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
                  ref={fileInputRefs.current[direction as keyof Photo]}
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
          <div className="p-6 text-center">
            <Button onClick={extractMeasurements} disabled={extracting || Object.values(photos).some(p => !p)} className="w-full md:w-auto mr-4">
              {extracting ? "Extracting..." : "Extract Measurements"}
            </Button>
            <Button onClick={generateAvatar} className="w-full md:w-auto">Generate Avatar</Button>
          </div>
        </Card>

        {/* Measurements Display */}
        {Object.values(photos).every(p => p) && (
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
                <Canvas>
                  <ambientLight intensity={0.5} />
                  <pointLight position={[10, 10, 10]} />
                  <AvatarModel measurements={measurements} />
                  <OrbitControls />
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
          <Button variant="outline" asChild>
            <Link href="/catalog">Proceed to Catalog</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}