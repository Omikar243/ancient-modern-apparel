"use client";

import { useState, useMemo, Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Camera, Check, Plus, Upload, ArrowLeft } from "lucide-react";
import dynamic from "next/dynamic";
import { useSession } from "@/lib/auth-client";

// Lazy load the 3D preview component
const Avatar3DPreview = dynamic(() => import("./Avatar3DPreview"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-muted rounded-2xl">
      <div className="text-muted-foreground text-sm">Loading 3D preview...</div>
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
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render content if not authenticated (will redirect)
  if (!session?.user) {
    return (
      <div className="min-h-dvh bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  const UploadCell = ({ dir, label }: { dir: Direction; label: string }) => (
    <button
      onClick={() => onPick(dir)}
      className="relative aspect-[3/4] rounded-2xl border border-border bg-muted overflow-hidden flex items-center justify-center group"
      aria-label={`Upload ${label} photo`}
    >
      {/* Silhouette placeholder */}
      {!images[dir] && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-24 rounded-full border border-border opacity-70" />
          <div className="absolute -bottom-1 w-20 h-8 rounded-full border border-border opacity-70" />
        </div>
      )}

      {/* Uploaded preview */}
      {images[dir] && (
        <img src={images[dir]!} alt={`${label} preview`} className="absolute inset-0 w-full h-full object-cover" />
      )}

      {/* Plus target */}
      {!images[dir] && (
        <div className="relative z-10 flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-foreground text-sm">
          <Plus className="w-4 h-4" />
          {label}
        </div>
      )}

      {/* Check mark when uploaded */}
      {images[dir] && (
        <div className="absolute top-2 right-2 z-10 flex items-center gap-1 rounded-full bg-emerald-600 text-white px-2 py-1 text-xs font-medium shadow">
          <Check className="w-3.5 h-3.5" /> Done
        </div>
      )}
    </button>
  );

  return (
    <div className="min-h-dvh bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto max-w-md px-4 py-3 flex items-center justify-between">
          <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-accent" aria-label="Back">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <div className="text-xs text-muted-foreground tracking-wider">STEP 1/3</div>
            <div className="text-sm font-medium">Body Scan</div>
          </div>
          <button onClick={() => {}} className="p-2 rounded-full hover:bg-accent" aria-label="Upload tips">
            <Upload className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-md px-4 pb-28 pt-4">
        <p className="text-sm text-muted-foreground mb-4">Select your gender and upload 4 directional photos to generate your 3D avatar.</p>

        {/* Gender Selection */}
        <div className="mb-4 rounded-xl border border-border bg-card p-4">
          <div className="text-xs text-muted-foreground mb-2 font-medium tracking-wide">SELECT GENDER</div>
          <div className="flex gap-3">
            <button
              onClick={() => setGender("male")}
              className={`flex-1 py-3 px-4 rounded-lg border transition-all font-medium text-sm ${
                gender === "male"
                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "border-border bg-secondary text-foreground hover:bg-accent"
              }`}
            >
              Male
            </button>
            <button
              onClick={() => setGender("female")}
              className={`flex-1 py-3 px-4 rounded-lg border transition-all font-medium text-sm ${
                gender === "female"
                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "border-border bg-secondary text-foreground hover:bg-accent"
              }`}
            >
              Female
            </button>
          </div>
        </div>

        {/* 3D Preview Section */}
        <div className="mb-6 rounded-2xl border border-border bg-card overflow-hidden">
          <div className="h-64 relative">
            <Suspense fallback={
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <div className="text-muted-foreground text-sm">Loading 3D preview...</div>
              </div>
            }>
              <Avatar3DPreview uploadProgress={Object.values(images).filter(Boolean).length} gender={gender} />
            </Suspense>
          </div>
          <div className="px-4 py-3 border-t border-border">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">3D Avatar Preview - Drag to rotate</span>
              <span className="text-emerald-600 dark:text-emerald-500 font-medium">
                {Object.values(images).filter(Boolean).length}/4 photos uploaded
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <UploadCell dir="front" label="Front" />
          <UploadCell dir="back" label="Back" />
          <UploadCell dir="left" label="Left" />
          <UploadCell dir="right" label="Right" />
        </div>

        <div className="mt-4 rounded-xl border border-border bg-card p-3 text-xs text-muted-foreground">
          Tip: Stand straight, arms relaxed, neutral lighting. Keep full body in frame.
        </div>
      </main>

      {/* Footer action */}
      <div className="fixed inset-x-0 bottom-5 flex items-center justify-center">
        <button
          onClick={handleContinue}
          disabled={!allSet}
          className="relative inline-flex h-16 w-16 items-center justify-center rounded-full shadow-xl ring-1 ring-border transition disabled:opacity-40 disabled:cursor-not-allowed disabled:ring-muted"
          style={{ background: allSet ? "linear-gradient(135deg,#10b981,#22d3ee)" : "hsl(var(--muted))" }}
          aria-label="Continue to Avatar Studio"
        >
          <Camera className="w-7 h-7 text-white" />
        </button>
      </div>
    </div>
  );
};