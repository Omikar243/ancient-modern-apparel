"use client";

import { useState, useMemo, Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, Plus, ArrowLeft, ArrowRight } from "lucide-react";
import dynamic from "next/dynamic";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Lazy load the 3D preview component
const Avatar3DPreview = dynamic(() => import("./Avatar3DPreview"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-white">
      <div className="text-muted-foreground text-sm animate-pulse">Initializing Studio...</div>
    </div>
  ),
});

type Direction = "front" | "back" | "left" | "right";
type Gender = "male" | "female";

interface ScanImages {
  front: string | null;
  back: string | null;
  left: string | null;
  right: string | null;
}

export const BodyScanClient = () => {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [images, setImages] = useState<ScanImages>({ front: null, back: null, left: null, right: null });
  const [gender, setGender] = useState<Gender>("male");

  // Client-side auth protection
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login?redirect=/avatar");
    }
  }, [session, isPending, router]);

  const allSet = useMemo(() => Object.values(images).every(Boolean), [images]);
  const uploadedCount = Object.values(images).filter(Boolean).length;

  const onPick = (dir: Direction) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setImages((prev) => ({ ...prev, [dir]: dataUrl }));
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const handleContinue = () => {
    if (!allSet) return;
    try {
      sessionStorage.setItem("body_scan_images", JSON.stringify(images));
      sessionStorage.setItem("avatar_gender", gender);
    } catch {}
    router.push("/avatar/studio");
  };

  // Show loading while checking auth
  if (isPending) {
    return (
      <div className="min-h-dvh bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session?.user) return null;

  const UploadCell = ({ dir, label }: { dir: Direction; label: string }) => (
    <button
      onClick={() => onPick(dir)}
      className={cn(
        "relative w-full aspect-square rounded-xl border overflow-hidden group transition-all duration-300",
        "hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:border-emerald-500/50", // Brand glow effect
        "bg-white/60 backdrop-blur-md border-white/20 shadow-sm", // Translucent glassmorphism
        images[dir] ? "border-emerald-500/50 ring-1 ring-emerald-500/20" : "border-black/5"
      )}
      aria-label={`Upload ${label} photo`}
    >
      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-2 transition-opacity duration-300">
        {!images[dir] ? (
          <>
            <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center mb-2 group-hover:bg-emerald-500/10 group-hover:text-emerald-600 transition-colors">
              <Plus className="w-4 h-4 text-muted-foreground group-hover:text-emerald-600" />
            </div>
            <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">{label}</span>
          </>
        ) : (
          <img src={images[dir]!} alt={`${label} preview`} className="absolute inset-0 w-full h-full object-cover" />
        )}
      </div>

      {/* Success Overlay */}
      {images[dir] && (
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
          <div className="absolute top-2 right-2 bg-emerald-500 text-white rounded-full p-1 shadow-sm">
            <Check className="w-3 h-3" />
          </div>
        </div>
      )}
    </button>
  );

  return (
    <div className="h-screen w-full overflow-hidden flex flex-col bg-white relative">
      {/* Elegant Top Progress Bar (1px height) */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gray-100 z-50">
        <div 
          className="h-full bg-primary transition-all duration-700 ease-out shadow-[0_0_10px_rgba(0,0,0,0.1)]" 
          style={{ width: `${((uploadedCount + 1) / 5) * 33 + 33}%` }} // Simulated step progress 
        />
      </div>

      {/* Navigation Overlay */}
      <div className="absolute top-6 left-6 z-40">
        <button 
          onClick={() => router.back()} 
          className="p-3 rounded-full bg-white/80 backdrop-blur-md shadow-sm hover:bg-white transition-all border border-black/5 group"
        >
          <ArrowLeft className="w-5 h-5 text-foreground/80 group-hover:-translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row h-full relative">
        
        {/* 3D Viewer Area - Full Screen feel */}
        <div className="absolute inset-0 lg:static lg:flex-1 bg-white">
          <Suspense fallback={<div className="w-full h-full bg-gray-50" />}>
            <Avatar3DPreview uploadProgress={uploadedCount} gender={gender} />
          </Suspense>
        </div>

        {/* Sidebar / Overlay for Controls */}
        <div className="absolute bottom-0 left-0 right-0 lg:static lg:w-[400px] lg:h-full bg-gradient-to-t from-white via-white/90 to-transparent lg:bg-white lg:border-l border-black/5 p-6 flex flex-col justify-end lg:justify-center z-30 backdrop-blur-sm lg:backdrop-blur-none">
          
          <div className="max-w-sm mx-auto w-full space-y-8 mb-8 lg:mb-0">
            <div className="space-y-2 text-center lg:text-left">
              <h1 className="text-3xl font-serif font-medium tracking-tight">Digital Twin</h1>
              <p className="text-muted-foreground text-sm">Create your high-fidelity avatar. Upload directional photos for precise measurement.</p>
            </div>

            {/* Gender Toggle */}
            <div className="bg-secondary/50 p-1 rounded-xl flex relative">
              <div 
                className="absolute inset-y-1 rounded-lg bg-white shadow-sm transition-all duration-300 ease-out"
                style={{ 
                  left: '4px', 
                  width: 'calc(50% - 4px)',
                  transform: gender === 'female' ? 'translateX(100%)' : 'translateX(0)'
                }}
              />
              <button
                onClick={() => setGender("male")}
                className={cn(
                  "flex-1 py-2.5 text-sm font-medium relative z-10 transition-colors text-center",
                  gender === "male" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Male
              </button>
              <button
                onClick={() => setGender("female")}
                className={cn(
                  "flex-1 py-2.5 text-sm font-medium relative z-10 transition-colors text-center",
                  gender === "female" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Female
              </button>
            </div>

            {/* Upload Grid */}
            <div className="space-y-3">
               <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <span>Required Photos</span>
                  <span className={uploadedCount === 4 ? "text-emerald-600" : ""}>{uploadedCount}/4 Ready</span>
               </div>
               <div className="grid grid-cols-4 gap-3">
                  <UploadCell dir="front" label="Front" />
                  <UploadCell dir="back" label="Back" />
                  <UploadCell dir="left" label="Left" />
                  <UploadCell dir="right" label="Right" />
               </div>
            </div>

            {/* Action Button */}
            <Button 
              onClick={handleContinue}
              disabled={!allSet}
              className={cn(
                "w-full h-14 text-lg rounded-full shadow-lg transition-all duration-300",
                allSet 
                  ? "bg-foreground text-background hover:bg-foreground/90 shadow-emerald-500/20" 
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {allSet ? (
                <span className="flex items-center gap-2">Generate Avatar <ArrowRight className="w-5 h-5" /></span>
              ) : (
                "Complete All Uploads"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};