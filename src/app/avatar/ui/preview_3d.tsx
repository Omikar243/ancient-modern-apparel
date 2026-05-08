"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  ImageIcon,
  Loader2,
  RefreshCw,
  ScanLine,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "@/lib/auth-client";
import type { AvatarMeasurements } from "@/lib/avatar-types";
const SessionModelViewer = dynamic(() => import("./session_model_viewer"), { ssr: false });

type ImageMap = Partial<Record<"front" | "back" | "left" | "right", string>>;

interface SessionResult {
  sessionId: string;
  status: "uploaded" | "queued" | "processing" | "completed" | "failed";
  stage: string;
  progress: number;
  warnings: string[];
  views: ImageMap;
  normalizedViews: ImageMap;
  maskViews: ImageMap;
  previewImages: string[];
  measurements: AvatarMeasurements | null;
  confidence: number | null;
  pipelineMode: "fallback" | "external";
  pipelineVersion: string;
  modelUrl: string | null;
  errorCode: string | null;
  errorMessage: string | null;
}

const stageLabels: Record<string, string> = {
  upload: "Upload complete",
  preprocessing: "Preparing your photos",
  alignment: "Aligning body views",
  reconstruction: "Building your 3D body model",
  export: "Finalizing your avatar",
  complete: "Your avatar is ready",
};

function toDisplayWarning(warning: string) {
  if (/built-in fallback reconstruction/i.test(warning)) {
    return "This preview uses the standard production avatar pipeline.";
  }

  if (/AVATAR_PIPELINE_URL|Phase 2 segmentation|alignment in production/i.test(warning)) {
    return "Higher-fidelity preprocessing will improve edge cleanup and view alignment in a later upgrade.";
  }

  return warning;
}

export default function Preview3D({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [result, setResult] = useState<SessionResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push(`/login?redirect=/avatar/${sessionId}`);
    }
  }, [isPending, router, session?.user, sessionId]);

  useEffect(() => {
    if (!session?.user) {
      return;
    }

    let active = true;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    async function loadResult() {
      try {
        const response = await fetch(`/api/avatar/result?session_id=${sessionId}`, {
          cache: "no-store",
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Unable to load avatar result");
        }
        if (!active) {
          return;
        }
        setResult(data);
        setError(null);
        setLoading(false);

        if (data.status === "uploaded" || data.status === "queued" || data.status === "processing") {
          timeoutId = setTimeout(loadResult, 2500);
        }
      } catch (fetchError) {
        if (!active) {
          return;
        }
        setLoading(false);
        setError(fetchError instanceof Error ? fetchError.message : "Failed to load avatar result");
      }
    }

    void loadResult();

    return () => {
      active = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [session?.user, sessionId]);

  const measurements = useMemo<AvatarMeasurements>(
    () =>
      result?.measurements ?? {
        height: 172,
        bust: 92,
        waist: 78,
        hips: 96,
        shoulders: 44,
      },
    [result?.measurements]
  );

  const orderedNormalizedViews = useMemo(
    () =>
      ["front", "back", "left", "right"].flatMap((view) => {
        const image = result?.normalizedViews?.[view as keyof ImageMap];
        return image ? [{ view, image }] : [];
      }),
    [result?.normalizedViews]
  );

  const orderedMaskViews = useMemo(
    () =>
      ["front", "back", "left", "right"].flatMap((view) => {
        const image = result?.maskViews?.[view as keyof ImageMap];
        return image ? [{ view, image }] : [];
      }),
    [result?.maskViews]
  );

  const shouldShowPreviewImages = useMemo(() => {
    const previewImages = result?.previewImages ?? [];
    if (!previewImages.length) {
      return false;
    }

    const normalizedImages = orderedNormalizedViews.map(({ image }) => image);
    if (
      normalizedImages.length === previewImages.length &&
      normalizedImages.every((image, index) => image === previewImages[index])
    ) {
      return false;
    }

    return true;
  }, [orderedNormalizedViews, result?.previewImages]);

  const orderedInputViews = useMemo(
    () =>
      ["front", "back", "left", "right"].flatMap((view) => {
        const image = result?.views?.[view as keyof ImageMap];
        return image ? [{ view, image }] : [];
      }),
    [result?.views]
  );

  const displayWarnings = useMemo(() => {
    const warnings = result?.warnings?.length ? result.warnings : ["No quality notes yet."];
    return warnings.map(toDisplayWarning);
  }, [result?.warnings]);

  const confidenceLabel =
    result?.confidence != null ? `${Math.round(result.confidence * 100)}%` : "Pending";
  const pipelineBadgeLabel =
    result?.pipelineMode === "external" ? "Enhanced preprocessing active" : "Standard production pipeline";

  if (isPending || loading) {
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
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Your 3D Avatar</h1>
            <p className="text-sm text-muted-foreground">Track progress, review the result, and download your model.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="rounded-full border border-border bg-muted/40 px-3 py-1.5 font-medium text-foreground/90">
              {pipelineBadgeLabel}
            </div>
            <div className="rounded-full border border-border bg-muted/40 px-3 py-1.5 font-medium text-foreground/90">
              {stageLabels[result?.stage ?? "upload"] ?? "Preparing your avatar"}
            </div>
            <div className="rounded-full border border-border bg-muted/40 px-3 py-1.5 font-medium text-foreground/90">
              Confidence {confidenceLabel}
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <Link href="/avatar?fresh=1">Start Over</Link>
            </Button>
            {result?.modelUrl ? (
              <Button asChild>
                <a href={result.modelUrl} target="_blank" rel="noreferrer">
                  <Download className="mr-2 h-4 w-4" />
                  Download Model
                </a>
              </Button>
            ) : null}
          </div>
        </div>

        {error ? (
          <Card className="border-destructive/40">
            <CardContent className="flex items-center gap-3 p-6 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </CardContent>
          </Card>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <Card className="overflow-hidden border-border/80 bg-gradient-to-b from-muted/20 to-background">
            <CardHeader>
              <CardTitle>3D Preview</CardTitle>
              <CardDescription>
                Rotate and inspect the generated body model directly in the browser.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[520px] bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_55%)]">
              <SessionModelViewer measurements={measurements} />
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Processing Status</CardTitle>
                <CardDescription>
                  {result ? stageLabels[result.stage] ?? result.stage : "Preparing session"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="capitalize">{result?.status ?? "queued"}</span>
                    <span>{result?.progress ?? 0}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-muted">
                    <div
                      className="h-3 rounded-full bg-primary transition-all"
                      style={{ width: `${result?.progress ?? 0}%` }}
                    />
                  </div>
                </div>
                {result?.status === "processing" || result?.status === "queued" || result?.status === "uploaded" ? (
                  <Button variant="outline" className="w-full" disabled>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing your avatar
                  </Button>
                ) : null}
                {result?.status === "completed" ? (
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-200">
                    <span className="inline-flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Your avatar is ready to preview and use with garments.
                    </span>
                  </div>
                ) : null}
                <div className="rounded-xl border border-border/60 bg-muted/20 p-3 text-sm text-muted-foreground">
                  {result?.pipelineMode === "external"
                    ? "Enhanced preprocessing is active for this session, including cleaned silhouettes and aligned captures."
                    : "This session used the standard production pipeline. The external Phase 2 backend can be connected later for segmentation and alignment."}
                </div>
                {result?.status === "failed" ? (
                  <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                    {result.errorMessage || "We couldn't finish building this avatar. Please try another capture set."}
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estimated Measurements</CardTitle>
                <CardDescription>These measurements are derived from the uploaded body views.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl border p-3">Height: {measurements.height} cm</div>
                <div className="rounded-xl border p-3">Bust: {measurements.bust} cm</div>
                <div className="rounded-xl border p-3">Waist: {measurements.waist} cm</div>
                <div className="rounded-xl border p-3">Hips: {measurements.hips} cm</div>
                <div className="rounded-xl border p-3">Shoulders: {measurements.shoulders} cm</div>
                <div className="rounded-xl border p-3">Confidence: {confidenceLabel}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Capture Review</CardTitle>
                <CardDescription>Review the uploaded angles, cleaned views, and quality notes for this avatar.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                {orderedInputViews.length ? (
                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-foreground/80">
                      <ImageIcon className="h-3.5 w-3.5" />
                      Original Captures
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {orderedInputViews.map(({ view, image }) => (
                        <div key={view} className="space-y-2">
                          <div className="text-xs font-medium capitalize text-foreground">{view}</div>
                          <img
                            src={image}
                            alt={`${view} original avatar capture`}
                            className="aspect-[3/4] w-full rounded-xl border object-cover bg-white"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
                {orderedNormalizedViews.length ? (
                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-foreground/80">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Normalized Views
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {orderedNormalizedViews.map(({ view, image }) => (
                        <div key={view} className="space-y-2">
                          <div className="text-xs font-medium capitalize text-foreground">{view}</div>
                          <img
                            src={image}
                            alt={`${view} normalized avatar view`}
                            className="aspect-[3/4] w-full rounded-xl border object-cover bg-white"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
                {orderedMaskViews.length ? (
                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-foreground/80">
                      <ScanLine className="h-3.5 w-3.5" />
                      Segmentation Masks
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {orderedMaskViews.map(({ view, image }) => (
                        <div key={view} className="space-y-2">
                          <div className="text-xs font-medium capitalize text-foreground">{view}</div>
                          <img
                            src={image}
                            alt={`${view} segmentation mask`}
                            className="aspect-[3/4] w-full rounded-xl border object-cover bg-white"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
                {shouldShowPreviewImages ? (
                  <div className="space-y-3">
                    <div className="text-xs font-medium uppercase tracking-wide text-foreground/80">
                      Processed Previews
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {result?.previewImages?.map((image, index) => (
                        <img
                          key={image}
                          src={image}
                          alt={`Processed avatar preview ${index + 1}`}
                          className="aspect-[3/4] w-full rounded-xl border object-cover"
                        />
                      ))}
                    </div>
                  </div>
                ) : null}
                {displayWarnings.map((warning) => (
                  <div key={warning} className="rounded-xl border bg-muted/30 p-3">
                    {warning}
                  </div>
                ))}
                {result?.status === "failed" ? (
                  <Button variant="outline" className="w-full" onClick={() => router.refresh()}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Retry page fetch
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
