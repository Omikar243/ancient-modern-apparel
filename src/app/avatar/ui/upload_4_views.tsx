"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Check, Loader2, UploadCloud } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "@/lib/auth-client";
import type { AvatarView } from "@/lib/avatar-types";

const REQUIRED_VIEWS: AvatarView[] = ["front", "back", "left", "right"];
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MIN_RESOLUTION = 768;
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

type FileMap = Record<AvatarView, File | null>;
type PreviewMap = Record<AvatarView, string | null>;
type ErrorMap = Record<AvatarView, string | null>;

const initialFiles: FileMap = {
  front: null,
  back: null,
  left: null,
  right: null,
};

const initialPreviews: PreviewMap = {
  front: null,
  back: null,
  left: null,
  right: null,
};

const initialErrors: ErrorMap = {
  front: null,
  back: null,
  left: null,
  right: null,
};

async function validateImageFile(file: File) {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return "Use JPG, PNG, or WebP images.";
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return "Image must be 10MB or smaller.";
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const dimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve({ width: image.width, height: image.height });
      image.onerror = reject;
      image.src = objectUrl;
    });

    if (dimensions.width < MIN_RESOLUTION || dimensions.height < MIN_RESOLUTION) {
      return `Use images at least ${MIN_RESOLUTION}px on both sides.`;
    }

    return null;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export default function Upload4Views() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending } = useSession();
  const [files, setFiles] = useState<FileMap>(initialFiles);
  const [previews, setPreviews] = useState<PreviewMap>(initialPreviews);
  const [errors, setErrors] = useState<ErrorMap>(initialErrors);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login?redirect=/avatar");
    }
  }, [isPending, router, session?.user]);

  useEffect(() => {
    const restoreLatestAvatar = async () => {
      if (!session?.user || searchParams.get("fresh") === "1") {
        return;
      }

      try {
        const response = await fetch("/api/avatar/latest", {
          credentials: "include",
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const data = await response.json();
        if (data?.sessionId) {
          router.replace(`/avatar/${data.sessionId}`);
        }
      } catch (restoreError) {
        console.error("Failed to restore latest avatar session:", restoreError);
      }
    };

    if (!isPending) {
      void restoreLatestAvatar();
    }
  }, [isPending, router, searchParams, session?.user]);

  const readyCount = useMemo(
    () => REQUIRED_VIEWS.filter((view) => files[view] && !errors[view]).length,
    [errors, files]
  );

  const allReady = readyCount === REQUIRED_VIEWS.length;

  async function handleSelect(view: AvatarView, list: FileList | null) {
    const file = list?.[0] ?? null;
    if (!file) {
      return;
    }

    const error = await validateImageFile(file);
    setErrors((current) => ({ ...current, [view]: error }));

    if (error) {
      setFiles((current) => ({ ...current, [view]: null }));
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setFiles((current) => ({ ...current, [view]: file }));
    setPreviews((current) => {
      if (current[view]) {
        URL.revokeObjectURL(current[view]!);
      }
      return { ...current, [view]: previewUrl };
    });
  }

  async function handleSubmit() {
    if (!allReady) {
      setFormError("Upload all four validated views before continuing.");
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      const formData = new FormData();
      REQUIRED_VIEWS.forEach((view) => {
        const file = files[view];
        if (file) {
          formData.append(view, file);
        }
      });

      const uploadResponse = await fetch("/api/avatar/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadResponse.json();
      if (!uploadResponse.ok) {
        throw new Error(uploadData.error || "Upload failed");
      }

      const processResponse = await fetch("/api/avatar/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionId: uploadData.sessionId }),
      });

      if (!processResponse.ok) {
        const processData = await processResponse.json();
        throw new Error(processData.error || "Processing failed");
      }

      router.push(`/avatar/${uploadData.sessionId}`);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Unable to start avatar processing.");
    } finally {
      setSubmitting(false);
    }
  }

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8 md:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.back()} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="text-sm text-muted-foreground">{readyCount}/4 views ready</div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">4-View Avatar Capture</CardTitle>
              <CardDescription>
                Upload front, back, left, and right full-body photos to generate your 3D avatar.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              {REQUIRED_VIEWS.map((view) => (
                <label
                  key={view}
                  className="group relative flex aspect-[3/4] cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-muted/30"
                >
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    onChange={(event) => void handleSelect(view, event.target.files)}
                  />
                  {previews[view] ? (
                    <img src={previews[view]!} alt={`${view} preview`} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
                      <UploadCloud className="h-8 w-8" />
                      <span className="text-sm font-medium capitalize">{view}</span>
                      <span className="px-3 text-center text-xs">Drop in a full-body {view} capture.</span>
                    </div>
                  )}
                  <div className="absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1 text-xs font-medium capitalize shadow-sm">
                    {view}
                  </div>
                  {files[view] && !errors[view] ? (
                    <div className="absolute right-3 top-3 rounded-full bg-emerald-500 px-2 py-1 text-xs font-medium text-white">
                      <span className="inline-flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        Ready
                      </span>
                    </div>
                  ) : null}
                  {errors[view] ? (
                    <div className="absolute inset-x-0 bottom-0 bg-destructive px-3 py-2 text-xs text-destructive-foreground">
                      {errors[view]}
                    </div>
                  ) : null}
                </label>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Capture Rules</CardTitle>
              <CardDescription>These constraints protect the preprocessing and multi-view alignment stages.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <ul className="space-y-2">
                <li>Same person in all 4 views with the full body visible.</li>
                <li>Neutral standing pose, arms relaxed, minimal occlusion.</li>
                <li>Consistent lighting and a plain background when possible.</li>
                <li>Each image must be JPG, PNG, or WebP and at least 768px.</li>
              </ul>
              <div className="rounded-xl border border-border bg-muted/40 p-4">
                <div className="font-medium text-foreground">For best results</div>
                <div className="mt-2 space-y-1 text-xs">
                  <div>Keep your camera at a consistent distance for all four photos.</div>
                  <div>Make sure your feet are visible and not cut off by the frame.</div>
                  <div>Avoid oversized outerwear if you want a cleaner body reconstruction.</div>
                  <div>Use even lighting to reduce shadows and silhouette errors.</div>
                </div>
              </div>
              {formError ? (
                <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-destructive">
                  {formError}
                </div>
              ) : null}
              <Button className="w-full" disabled={!allReady || submitting} onClick={handleSubmit}>
                {submitting ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading your photos
                  </span>
                ) : (
                  "Generate 3D Avatar"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
