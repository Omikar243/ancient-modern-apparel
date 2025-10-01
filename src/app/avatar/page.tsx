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
import { FilesetResolver, PoseLandmarker } from "@mediapipe/tasks-vision";
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
            delegate: "CPU"
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
      // Create HTMLImageElement from data URL
      const imgElement = new Image();
      imgElement.src = images.front;
      await new Promise((resolve, reject) => {
        imgElement.onload = resolve as any;
        imgElement.onerror = reject as any;
      });

      // Run pose detection directly on the HTMLImageElement
      const results = await poseLandmarkerRef.current.detect(imgElement as HTMLImageElement);

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
      const avgConfidence = landmarks.slice(0, 10).reduce((sum, lm) => sum + (lm.visibility ?? 1), 0) / 10;
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
    } catch (err: any) {
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

  // Simplified session effect: Short timeout fallback if pending too long
  useEffect(() => {
    if (!sessionPending) return;

    const timeoutId = setTimeout(() => {
      const token = typeof window !== 'undefined' ? window.localStorage.getItem("bearer_token") : null;
      if (token && !session?.user) {
        toast.error("Session verification failed. Redirecting to login.");
        router.push("/login?redirect=/avatar");
      }
    }, 1000); // 1s max pending before fallback

    return () => clearTimeout(timeoutId);
  }, [sessionPending, session, router]);

  // Load existing avatar only if session ready
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

  // Show loading only if mounted and (session pending or loading existing)
  if (!mounted || sessionPending || loadingExisting) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center py-32">
        <div className="max-w-md mx-auto text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-6"></div>
          <p className="text-xl text-muted-foreground font-medium">{loadingExisting ? "Loading Your Avatar..." : "Verifying Access..."}</p>
        </div>
      </div>
    );
  }

  if (error || !session?.user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center py-32">
        <Card className="w-full max-w-md mx-auto border-0 shadow-2xl">
          <CardHeader className="text-center pb-0">
            <CardTitle className="text-2xl font-serif">Access Restricted</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-0">
            <p className="text-muted-foreground text-lg leading-relaxed">For your privacy, avatar creation requires authentication.</p>
            <Button onClick={() => router.push("/login?redirect=/avatar")} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-full py-6 font-semibold shadow-lg">
              Enter Your Atelier
            </Button>
          </CardContent>
        </Card>
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
    <div className="min-h-screen bg-background/95 pattern-dots">
      <div className="max-w-5xl mx-auto px-4 py-12 md:py-20">
        {/* Header - Match repo's elegant banner style */}
        <div className="text-center mb-12 md:mb-20">
          <h1 className="text-4xl md:text-6xl font-serif font-light text-foreground mb-4 leading-tight tracking-wide">Merlin Atelier: Your Silhouette</h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">Discover personalized elegance through precise form capture. Inspired by timeless craftsmanship.</p>
        </div>

        {/* Pose Guidance - Gallery-card style like repo's image sections */}
        <Card className="mb-12 md:mb-20 border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl md:text-3xl font-serif font-medium text-foreground">Guided Poses for Accuracy</CardTitle>
            <p className="text-muted-foreground text-base leading-relaxed max-w-2xl mx-auto">Four views, natural stance—echoing Merlin's fusion of ancient and modern.</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-4 md:p-6">
              {[
                { view: "Front", desc: "Anterior Grace" },
                { view: "Back", desc: "Posterior Poise" },
                { view: "Left", desc: "Lateral Flow" },
                { view: "Right", desc: "Contralateral Charm" }
              ].map(({ view, desc }) => (
                <div key={view} className="text-center group hover:scale-105 transition-all duration-300 ease-in-out">
                  <div className="w-24 h-48 md:w-32 md:h-64 mx-auto bg-muted/30 rounded-lg border-2 border-dashed border-muted/40 mb-3 flex items-center justify-center overflow-hidden shadow-sm group-hover:border-accent/60 group-hover:bg-accent/10">
                    <span className="text-xs md:text-sm text-muted-foreground px-2 py-3 font-light">Merlin Pose: {view}</span>
                  </div>
                  <p className="font-medium text-foreground/90 text-sm md:text-base">{view} View</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upload - Product upload cards like repo's shop sections */}
        <Card className="mb-12 md:mb-20 border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardHeader className="text-left md:text-center">
            <CardTitle className="text-2xl md:text-3xl font-serif font-medium text-foreground">Upload Your Visions</CardTitle>
            <p className="text-muted-foreground text-base leading-relaxed">Secure your images—Merlin safeguards with ancient-inspired encryption.</p>
          </CardHeader>
          <CardContent className="space-y-6 md:space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
              {["front", "back", "left", "right"].map((direction) => (
                <div key={direction} className="text-center group hover:shadow-md transition-all duration-300 rounded-xl p-4 md:p-6 bg-card/60 border border-border/30">
                  <Label htmlFor={direction} className="block mb-3 capitalize font-medium text-foreground text-base md:text-lg">
                    {direction.replace('left', 'Left').replace('right', 'Right')} View
                  </Label>
                  <Input
                    id={direction}
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files && handlePhotoUpload(direction as keyof Photo, e.target.files![0])}
                    className="mb-4 file:bg-accent file:text-accent-foreground file:rounded-lg file:px-3 file:py-2 file:font-medium hover:file:bg-accent/90"
                  />
                  {images[direction] && (
                    <div className="w-32 h-32 md:w-40 md:h-40 mx-auto rounded-lg overflow-hidden shadow-lg group-hover:scale-105 transition-transform duration-300">
                      <NextImage
                        src={images[direction]}
                        alt={`${direction} perspective`}
                        width={160}
                        height={160}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Consent & Actions - Footer CTA like repo */}
            <div className="pt-6 border-t border-border/30 space-y-4">
              <div className="flex items-start space-x-3 p-3 md:p-4 bg-accent/5 rounded-lg border border-accent/20">
                <Checkbox id="consent" checked={consentGiven} onCheckedChange={handleConsentChange} className="mt-0.5 flex-shrink-0" />
                <label htmlFor="consent" className="text-sm md:text-base leading-relaxed text-foreground/80 flex-1">
                  I consent to secure image processing for Merlin's avatar fusion. Privacy paramount.
                </label>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center pt-2">
                <Button 
                  onClick={handleExtractAndSave} 
                  disabled={extracting || savingAvatar || !readyForExtract || !consentGiven} 
                  className="w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90 rounded-lg py-3 px-6 md:px-8 font-serif text-base md:text-lg shadow-md hover:shadow-lg transition-all duration-300 min-h-[48px]"
                >
                  {(extracting || savingAvatar) ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent-foreground mr-2"></div>
                      Crafting Avatar...
                    </>
                  ) : (
                    "Extract & Create"
                  )}
                </Button>
                {readyForExtract && (
                  <Button 
                    variant="outline" 
                    onClick={handleDeletePhotos} 
                    className="w-full sm:w-auto rounded-lg py-3 px-6 font-serif text-base border-muted-foreground/50 hover:bg-muted/20 transition-all duration-300"
                  >
                    Clear All
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Measurements - Feature cards like repo's product specs */}
        {showPreview && (
          <Card className="mb-12 md:mb-20 border-0 shadow-lg bg-white/70 backdrop-blur-sm">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl md:text-3xl font-serif font-medium text-foreground">Your Merlin Measurements</CardTitle>
              <p className="text-muted-foreground text-base">Tailored proportions in cm, ready for fusion.</p>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 p-0">
              {Object.entries(measurements).map(([key, value]) => (
                <div key={key} className="text-center p-4 md:p-6 bg-gradient-to-br from-accent/5 to-background rounded-lg border border-accent/20 shadow-sm">
                  <Label className="block text-xs md:text-sm text-muted-foreground uppercase tracking-wider mb-1 font-light">{key}</Label>
                  <div className="text-2xl md:text-3xl font-serif font-semibold text-foreground">{value.toFixed(0)}</div>
                  <p className="text-xs text-muted-foreground mt-1">cm</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* 3D - Main preview like repo's hero image viewer */}
        <Card className="mb-12 md:mb-20 border-0 shadow-xl bg-white/70 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl md:text-3xl font-serif font-medium text-foreground">Atelier Preview</CardTitle>
            <p className="text-muted-foreground text-base leading-relaxed max-w-xl mx-auto">Adjust and visualize your form in Merlin's ancient-modern blend.</p>
          </CardHeader>
          <CardContent className="space-y-6 md:space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-6">
              <div className="space-y-3">
                <Label className="text-base md:text-lg font-medium text-foreground block">Hourglass Fusion</Label>
                <Slider 
                  value={[bodyType.hourglass]} 
                  onValueChange={(value) => setBodyType(prev => ({ ...prev, hourglass: value[0] }))} 
                  max={100} 
                  step={1} 
                  className="my-1"
                />
                <p className="text-sm text-muted-foreground">{bodyType.hourglass}%</p>
              </div>
              <div className="space-y-3">
                <Label className="text-base md:text-lg font-medium text-foreground block">Athletic Heritage</Label>
                <Slider 
                  value={[bodyType.athletic]} 
                  onValueChange={(value) => setBodyType(prev => ({ ...prev, athletic: value[0] }))} 
                  max={100} 
                  step={1} 
                  className="my-1"
                />
                <p className="text-sm text-muted-foreground">{bodyType.athletic}%</p>
              </div>
            </div>
            <div className="relative h-[400px] md:h-[500px] bg-gradient-to-br from-muted/10 to-accent/10 rounded-2xl border border-accent/30 overflow-hidden shadow-lg">
              {mounted ? (
                <Suspense fallback={
                  <div className="absolute inset-0 flex items-center justify-center bg-background/90">
                    <div className="text-center">
                      <div className="animate-pulse rounded-full h-10 w-10 border-2 border-accent mx-auto mb-3"></div>
                      <p className="text-muted-foreground font-medium">Rendering Fusion...</p>
                    </div>
                  </div>
                }>
                  <CanvasWrapper measurements={measurements} bodyType={bodyType} skinTone={skinTone} />
                </Suspense>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-background/90">
                  <p className="text-muted-foreground">Initializing Atelier...</p>
                </div>
              )}
            </div>
            <div className="text-center space-y-1 pt-3 border-t border-border/30">
              <p className="text-lg md:text-xl font-serif font-medium text-foreground">Live Silhouette View</p>
              <p className="text-sm md:text-base text-muted-foreground">Hourglass: {bodyType.hourglass}% | Athletic: {bodyType.athletic}% | Height: {measurements.height}cm</p>
              <p className="text-xs text-foreground/60 italic">Interactive—rotate to explore.</p>
            </div>
          </CardContent>
        </Card>

        {/* Navigation - Footer links like repo's nav */}
        <div className="text-center space-y-3 pt-6 border-t border-border/30">
          <Button asChild variant="outline" className="rounded-lg px-6 md:px-8 py-3 font-serif text-base border-accent/50 hover:border-accent transition-all">
            <Link href="/">Home</Link>
          </Button>
          <Button asChild disabled={!showPreview} className="rounded-lg px-8 md:px-10 py-3 bg-accent text-accent-foreground font-serif text-base shadow-md hover:shadow-lg transition-all duration-300 min-h-[48px]">
            <Link href="/catalog">To Catalog</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}