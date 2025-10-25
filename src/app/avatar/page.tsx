"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Camera, Check, Plus, Upload, ArrowLeft } from "lucide-react";

type Direction = "front" | "back" | "left" | "right";

interface ScanImages {
  front: string | null;
  back: string | null;
  left: string | null;
  right: string | null;
}

export default function BodyScanPage() {
  const router = useRouter();
  const [images, setImages] = useState<ScanImages>({ front: null, back: null, left: null, right: null });

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
    } catch {}
    router.push("/avatar/studio");
  };

  const UploadCell = ({ dir, label }: { dir: Direction; label: string }) => (
    <button
      onClick={() => onPick(dir)}
      className="relative aspect-[3/4] rounded-2xl border border-zinc-800 bg-zinc-900/60 overflow-hidden flex items-center justify-center group"
      aria-label={`Upload ${label} photo`}
    >
      {/* Silhouette placeholder */}
      {!images[dir] && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-24 rounded-full border border-zinc-700/70" />
          <div className="absolute -bottom-1 w-20 h-8 rounded-full border border-zinc-700/70" />
        </div>
      )}

      {/* Uploaded preview */}
      {images[dir] && (
        <img src={images[dir]!} alt={`${label} preview`} className="absolute inset-0 w-full h-full object-cover" />
      )}

      {/* Plus target */}
      {!images[dir] && (
        <div className="relative z-10 flex items-center gap-2 rounded-full bg-zinc-800/70 px-3 py-1.5 text-zinc-200 text-sm">
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
    <div className="min-h-dvh bg-black text-zinc-100">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-zinc-900 bg-black/90 backdrop-blur">
        <div className="mx-auto max-w-md px-4 py-3 flex items-center justify-between">
          <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-zinc-900" aria-label="Back">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <div className="text-xs text-zinc-400 tracking-wider">STEP 1/3</div>
            <div className="text-sm font-medium">Body Scan</div>
          </div>
          <button onClick={() => {}} className="p-2 rounded-full hover:bg-zinc-900" aria-label="Upload tips">
            <Upload className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-md px-4 pb-28 pt-4">
        <p className="text-sm text-zinc-400 mb-4">Upload 4 directional photos to generate your 3D avatar.</p>

        <div className="grid grid-cols-2 gap-3">
          <UploadCell dir="front" label="Front" />
          <UploadCell dir="back" label="Back" />
          <UploadCell dir="left" label="Left" />
          <UploadCell dir="right" label="Right" />
        </div>

        <div className="mt-4 rounded-xl border border-zinc-900 bg-zinc-950 p-3 text-xs text-zinc-400">
          Tip: Stand straight, arms relaxed, neutral lighting. Keep full body in frame.
        </div>
      </main>

      {/* Footer action */}
      <div className="fixed inset-x-0 bottom-5 flex items-center justify-center">
        <button
          onClick={handleContinue}
          disabled={!allSet}
          className="relative inline-flex h-16 w-16 items-center justify-center rounded-full shadow-xl ring-1 ring-white/10 transition disabled:opacity-40 disabled:cursor-not-allowed disabled:ring-zinc-700"
          style={{ background: allSet ? "linear-gradient(135deg,#10b981,#22d3ee)" : "#0a0a0a" }}
          aria-label="Continue to Avatar Studio"
        >
          <Camera className="w-7 h-7 text-white" />
        </button>
      </div>
    </div>
  );
}