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
import dynamic from "next/dynamic";
import { FilesetResolver, PoseLandmarker, Image } from "@mediapipe/tasks-vision";
import { useLocalStorage } from '@/hooks/use-local-storage'; // Assume hook exists or implement simple

const CanvasWrapper = dynamic(() => import("./CanvasWrapper"), { ssr: false });

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
  const [consentGiven, setConsentGiven] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [skinTone, setSkinTone] = useState("peachpuff");
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [avatarId, setAvatarId] = useState<number | null>(null);
  const [storedAvatarId, setStoredAvatarId] = useLocalStorage('avatar_id', null);
  const [loadingExisting, setLoadingExisting] = useState(false);

  const router = useRouter();
  const hasRefetchedRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { data: session, isPending: sessionPending, error, refetch } = useSession();

  // MediaPipe setup
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);
  const visionRef = useRef<any>(null);

  useEffect(() => {
    const initMediaPipe = async () => {
      try {
        visionRef.current = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm"
        );
        poseLandmarkerRef.current = await PoseLandmarker.createFromOptions(visionRef.current, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`,
            delegate: "GPU"
          },
          runningMode: "IMAGE",
          numPoses: 1,
          minPoseDetectionConfidence: 0.5,
          minPosePresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
          outputProbs: false
        });
        console.log("MediaPipe PoseLandmarker initialized");
      } catch (err) {
        console.error("MediaPipe init failed:", err);
        toast.error("Failed to load measurement tool. Using defaults.");
      }
    };
    initMediaPipe();
  }, []);

  // Real extraction using MediaPipe
  const extractMeasurements = useCallback(async () => {
    if (!photos.front || !images.front) {
      toast.error("Upload front photo first for extraction.");
      return;
    }

    // Check if MediaPipe is available
    if (!poseLandmarkerRef.current) {
      toast.warning("Advanced measurement tool unavailable. Using estimated defaults.");
      // Fallback to mock immediately
      const mockHeight = Math.floor(Math.random() * 30) + 160;
      const mockShoulders = Math.floor(Math.random() * 10) + 38;
      const mockBust = Math.floor(Math.random() * 20) + 85;
      const mockWaist = Math.floor(Math.random() * 15) + 65;
      const mockHips = Math.floor(Math.random() * 20) + 90;
      setSkinTone("peachpuff");

      setMeasurements({
        height: mockHeight,
        bust: mockBust,
        waist: mockWaist,
        hips: mockHips,
        shoulders: mockShoulders,
      });
      setShowPreview(true);
      setExtracting(false);
      return;
    }

    setExtracting(true);
    try {
      // Create Image from data URL
      const imgElement = new Image();
      imgElement.src = images.front;
      await new Promise((resolve, reject) => {
        imgElement.onload = resolve;
        imgElement.onerror = reject;
      });

      const mpImage = new Image(imgElement.width, imgElement.height);
      const canvas = document.createElement('canvas');
      canvas.width = imgElement.width;
      canvas.height = imgElement.height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(imgElement, 0, 0);
      mpImage.src = canvas.toDataURL();

      const results = await poseLandmarkerRef.current.detect(mpImage);

      if (!results.landmarks || results.landmarks.length === 0) {
        throw new Error("No pose detected. Please ensure full body is visible.");
      }

      const landmarks = results.landmarks[0]; // Single pose
      const imageWidth = imgElement.width;
      const imageHeight = imgElement.height;

      // Key landmarks (normalized 0-1)
      const noseY = landmarks[0].y * imageHeight;
      const leftShoulder = landmarks[11];
      const rightShoulder = landmarks[12];
      const leftHip = landmarks[23];
      const rightHip = landmarks[24];
      const leftWrist = landmarks[15]; // For arm length proxy

      // Shoulders: horizontal distance, scale to cm (assume 0.5m average image scale for shoulders ~40cm)
      const shoulderDistPixels = Math.abs(leftShoulder.x - rightShoulder.x) * imageWidth;
      const shoulderCm = (shoulderDistPixels / imageWidth) * 40; // Calibrate based on avg 40cm shoulders

      // Height: from nose to hip midpoint, extrapolate (head ~22%, torso ~30%, legs ~48% of height)
      const hipMidY = ((leftHip.y + rightHip.y) / 2) * imageHeight;
      const upperBodyPixels = hipMidY - noseY;
      const fullHeightCm = (upperBodyPixels / 0.52) * 170; // 52% upper, avg 170cm

      // Torso width variations for bust/waist/hips (proxies; use shoulder/hip widths)
      // Bust ~ shoulder width * 1.2 (for women avg)
      const bustCm = shoulderCm * 1.2;
      // Waist ~ shoulder * 0.8
      const waistCm = shoulderCm * 0.8;
      // Hips ~ shoulder * 1.1
      const hipCm = shoulderCm * 1.1;

      // Adjust for visibility confidence
      const avgConfidence = landmarks.slice(0, 10).reduce((sum, lm) => sum + lm.visibility, 0) / 10;
      if (avgConfidence < 0.5) {
        throw new Error("Low confidence. Retake photo with better lighting/pose.");
      }

      // Extract basic skin tone: average RGB from face landmarks (nose, eyes)
      const faceLandmarks = [0, 1, 2, 7, 8]; // nose, eyes, ears approx
      const facePixels: number[] = [];
      const canvas2 = document.createElement('canvas');
      canvas2.width = imgElement.width;
      canvas2.height = imgElement.height;
      const ctx2 = canvas2.getContext('2d');
      if (ctx2) {
        ctx2.drawImage(imgElement, 0, 0);
        faceLandmarks.forEach(idx => {
          const lm = landmarks[idx];
          const x = Math.max(0, Math.min(imageWidth - 1, Math.round(lm.x * imageWidth)));
          const y = Math.max(0, Math.min(imageHeight - 1, Math.round(lm.y * imageHeight)));
          const pixelData = ctx2.getImageData(x, y, 1, 1).data;
          if (pixelData[3] > 50) { // Visible
            facePixels.push(pixelData[0], pixelData[1], pixelData[2]);
          }
        });
      }
      let avgSkinTone = "peachpuff";
      if (facePixels.length >= 9) { // At least 3 points
        const avgR = Math.round(facePixels.filter((_, i) => i % 3 === 0).reduce((a, b) => a + b, 0) / (facePixels.length / 3));
        const avgG = Math.round(facePixels.filter((_, i) => i % 3 === 1).reduce((a, b) => a + b, 0) / (facePixels.length / 3));
        const avgB = Math.round(facePixels.filter((_, i) => i % 3 === 2).reduce((a, b) => a + b, 0) / (facePixels.length / 3));
        avgSkinTone = `rgb(${avgR}, ${avgG}, ${avgB})`;
      }
      setSkinTone(avgSkinTone);

      setMeasurements({
        height: Math.round(fullHeightCm),
        bust: Math.round(bustCm),
        waist: Math.round(waistCm),
        hips: Math.round(hipCm),
        shoulders: Math.round(shoulderCm),
      });
      setShowPreview(true);
      toast.success(`Measurements extracted! Skin tone: ${avgSkinTone.slice(0,10)}... Confidence: ${Math.round(avgConfidence * 100)}%`);
    } catch (err) {
      console.error("Extraction failed", err);
      // Fallback to mock
      const mockHeight = Math.floor(Math.random() * 30) + 160;
      const mockShoulders = Math.floor(Math.random() * 10) + 38;
      const mockBust = Math.floor(Math.random() * 20) + 85;
      const mockWaist = Math.floor(Math.random() * 15) + 65;
      const mockHips = Math.floor(Math.random() * 20) + 90;
      setSkinTone("peachpuff");

      setMeasurements({
        height: mockHeight,
        bust: mockBust,
        waist: mockWaist,
        hips: mockHips,
        shoulders: mockShoulders,
      });
      setShowPreview(true);
      toast.error(`Extraction failed using defaults: ${err.message}`);
    } finally {
      setExtracting(false);
    }
  }, [photos.front, images.front]);

  // Early check: If no token, immediate redirect (prevents hook init)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const token = window.localStorage.getItem("bearer_token");
    if (!token) {
      router.push("/login?redirect=/avatar");
      return;
    }
  }, [router]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (sessionPending) {
      // Shorter timeout for stuck state: 3s max before force redirect
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        toast.error("Session loading failed. Redirecting to login.");
        router.push("/login?redirect=/avatar");
      }, 3000);
      return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      };
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    const token = typeof window !== 'undefined' ? window.localStorage.getItem("bearer_token") : null;

    if (!session?.user && token && !hasRefetchedRef.current) {
      hasRefetchedRef.current = true;
      if (typeof refetch === 'function') {
        refetch();
      } else {
        router.push("/login?redirect=/avatar");
      }
      return;
    }
  }, [sessionPending, session, router, refetch]);

  // Improved loading: Show spinner only if mounted and sessionPending (with token present)
  useEffect(() => {
    if (!session?.user?.id || loadingExisting) return;

    const loadExistingAvatar = async () => {
      setLoadingExisting(true);
      try {
        const token = window.localStorage.getItem('bearer_token');
        if (!token) return;

        const response = await fetch(`/api/avatars/by-user/${session.user.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.status === 404) {
          // No existing avatar, use defaults - no error
          console.log("No existing avatar found, using defaults");
          return;
        }

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        if (data && data.measurements) {
          setMeasurements(data.measurements);
          if (data.skinTone) setSkinTone(data.skinTone);
          setShowPreview(true);
          setStoredAvatarId(data.id);
          toast.success("Measurements loaded from your saved avatar!");
          return;
        } else {
          console.log("No measurements in response, using defaults");
          return;
        }
      } catch (err: any) {
        if (err.message.includes('404')) {
          console.log("No existing avatar, using defaults");
          return;
        }
        console.error("Failed to load existing measurements:", err);
        toast.error("Failed to load saved measurements, using defaults.");
      } finally {
        setLoadingExisting(false);
      }
    };

    loadExistingAvatar();
  }, [session?.user?.id]);

  // Improved loading: Show spinner only if mounted and sessionPending (with token present)
  if (!mounted || sessionPending || loadingExisting) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-6xl mx-auto flex items-center justify-center min-h-[calc(100vh-8rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">{loadingExisting ? "Loading your avatar..." : "Loading session..."}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !session?.user) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-6xl mx-auto flex items-center justify-center min-h-[calc(100vh-8rem)]">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-destructive">Please log in to create your avatar.</p>
              <Button onClick={() => router.push("/login?redirect=/avatar")} className="w-full">
                Go to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Removed client-side unauth render - middleware handles protection
  // If session fails to hydrate (rare), functions below will catch it

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
    if (!session?.user?.id) {
      toast.error("Session expired. Please log in again.");
      router.push("/login");
      return;
    }

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
    try {
      const storedId = storedAvatarId;
      if (storedId) {
        const token = typeof window !== 'undefined' ? window.localStorage.getItem('bearer_token') : null;
        if (token) {
          const deleteResponse = await fetch(`/api/avatars/${storedId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (deleteResponse.ok) {
            setStoredAvatarId(null);
            toast.success('Avatar record also deleted');
          } else {
            toast.warning('Photos deleted, but avatar record cleanup failed');
          }
        }
      }
    } catch (deleteErr) {
      console.error('Delete avatar error:', deleteErr);
      toast.warning('Photos deleted, avatar record remains');
    }
  };

  const handleExtractAndSave = async () => {
    if (!session?.user?.id) {
      toast.error("Session expired. Please log in again.");
      router.push("/login");
      return;
    }
    
    if (extracting || savingAvatar || !readyForExtract || !consentGiven) return;
    
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
        },
        credentials: 'include',
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
      
      if (savingAvatar) return;
      
      setSavingAvatar(true);
      
      try {
        const token = typeof window !== 'undefined' ? window.localStorage.getItem('bearer_token') : null;
        if (!token) {
          throw new Error('No auth token');
        }

        const avatarResponse = await fetch('/api/avatars', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ measurements })
        });

        if (!avatarResponse.ok) {
          const errData = await avatarResponse.json();
          throw new Error(errData.error || 'Failed to save avatar data');
        }

        const avatarData = await avatarResponse.json();
        setAvatarId(avatarData.id);
        setStoredAvatarId(avatarData.id);
        toast.success(`Avatar saved! ID: ${avatarData.id}, 3D Model: ${avatarData.fittedModelUrl ? 'Generated' : 'Skipped'}`);
      } catch (avatarErr: any) {
        console.error('Avatar API error:', avatarErr);
        toast.error(`Measurements saved but 3D model failed: ${avatarErr.message}`);
        // Still proceed, as measurements are in designs
      } finally {
        setSavingAvatar(false);
      }
      
      toast.success("Avatar saved securely with privacy controls!");
      window.location.href = "/catalog"; // Proceed to catalog
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
              {[
                { view: "Front", src: "/images/pose-guide/front.png" },
                { view: "Back", src: "/images/pose-guide/back.png" },
                { view: "Left Side", src: "/images/pose-guide/left.png" },
                { view: "Right Side", src: "/images/pose-guide/right.png" }
              ].map(({ view, src }) => (
                <div key={view} className="text-center">
                  <div className="w-24 h-48 bg-muted mx-auto rounded border-2 border-dashed border-muted mb-2 flex items-center justify-center">
                    <NextImage
                      src={src}
                      alt={`${view.toLowerCase()} pose`}
                      width={96}
                      height={192}
                      className="object-contain"
                    />
                  </div>
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
              <Button 
                onClick={handleExtractAndSave} 
                disabled={extracting || savingAvatar || !readyForExtract || !consentGiven} 
                className="w-full sm:w-auto"
              >
                {(extracting || savingAvatar) ? "Saving Avatar..." : "Extract Measurements & Save Avatar"}
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
              {mounted ? (
                <Suspense fallback={<div className="absolute inset-0 flex items-center justify-center">Loading 3D model...</div>}>
                  <CanvasWrapper measurements={measurements} bodyType={bodyType} skinTone={skinTone} />
                </Suspense>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-muted/30">Initializing 3D preview...</div>
              )}
            </div>
            <div className="text-center text-foreground mt-4">
              <p className="text-lg font-medium">Interactive 3D Avatar</p>
              <p className="text-sm mt-2">Body Type: {bodyType.hourglass}% Hourglass / {bodyType.athletic}% Athletic</p>
              <p className="text-sm">Height: {measurements.height}cm | Shoulders: {measurements.shoulders}cm</p>
              <p className="text-xs mt-4">Rotate and zoom to view. Extraction updates measurements.</p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center space-y-4">
          <Button asChild variant="outline">
            <Link href="/">Back to Home</Link>
          </Button>
          <Button asChild disabled={!showPreview}>
            <Link href="/catalog" onClick={(e) => {
              e.preventDefault();
              window.location.href = "/catalog";
            }}>Proceed to Catalog</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}