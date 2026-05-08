import type {
  AvatarImageMap,
  AvatarMeasurements,
  AvatarPipelineRequest,
  AvatarPipelineResult,
  AvatarView,
} from "@/lib/avatar-types";
import { uploadAvatarAsset } from "@/lib/avatar-storage";

const DEFAULT_MEASUREMENTS: AvatarMeasurements = {
  height: 172,
  bust: 92,
  waist: 78,
  hips: 96,
  shoulders: 44,
};

function deriveMeasurementsFromViews(): AvatarMeasurements {
  return DEFAULT_MEASUREMENTS;
}

function resolvePipelineUrl() {
  if (process.env.AVATAR_PIPELINE_URL) {
    return process.env.AVATAR_PIPELINE_URL.replace(/\/$/, "");
  }

  return null;
}

function dataUrlToArrayBuffer(dataUrl: string) {
  const match = dataUrl.match(/^data:(.+?);base64,(.+)$/);
  if (!match) {
    throw new Error("Invalid image data returned from avatar pipeline.");
  }

  const [, contentType, base64Data] = match;
  const buffer = Buffer.from(base64Data, "base64");
  return {
    buffer: buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength),
    contentType,
  };
}

async function uploadProcessedImageMap(params: {
  userId: string;
  sessionId: string;
  kind: "normalized" | "mask";
  dataUrls?: AvatarImageMap;
}) {
  const uploaded: AvatarImageMap = {};
  const entries = Object.entries(params.dataUrls ?? {}) as Array<[AvatarView, string]>;

  for (const [view, dataUrl] of entries) {
    const { buffer, contentType } = dataUrlToArrayBuffer(dataUrl);
    const ext = contentType.includes("png") ? "png" : "jpg";
    uploaded[view] = await uploadAvatarAsset({
      path: `${params.userId}/${params.sessionId}/processed/${params.kind}/${view}.${ext}`,
      buffer,
      contentType,
    });
  }

  return uploaded;
}

async function uploadPreviewImages(params: {
  userId: string;
  sessionId: string;
  dataUrls?: string[];
}) {
  const uploaded: string[] = [];

  for (const [index, dataUrl] of (params.dataUrls ?? []).entries()) {
    const { buffer, contentType } = dataUrlToArrayBuffer(dataUrl);
    const ext = contentType.includes("png") ? "png" : "jpg";
    const path = `${params.userId}/${params.sessionId}/processed/previews/view-${index + 1}.${ext}`;
    uploaded.push(
      await uploadAvatarAsset({
        path,
        buffer,
        contentType,
      })
    );
  }

  return uploaded;
}

async function persistRemoteOutputs(
  request: AvatarPipelineRequest,
  pipelineResult: AvatarPipelineResult
) {
  const [normalizedImageUrls, maskUrls, previewImageUrls] = await Promise.all([
    uploadProcessedImageMap({
      userId: request.userId,
      sessionId: request.sessionId,
      kind: "normalized",
      dataUrls: pipelineResult.normalizedImageDataUrls,
    }),
    uploadProcessedImageMap({
      userId: request.userId,
      sessionId: request.sessionId,
      kind: "mask",
      dataUrls: pipelineResult.maskDataUrls,
    }),
    uploadPreviewImages({
      userId: request.userId,
      sessionId: request.sessionId,
      dataUrls: pipelineResult.previewImageDataUrls,
    }),
  ]);

  return {
    ...pipelineResult,
    normalizedImageUrls:
      Object.keys(normalizedImageUrls).length > 0
        ? normalizedImageUrls
        : pipelineResult.normalizedImageUrls,
    maskUrls: Object.keys(maskUrls).length > 0 ? maskUrls : pipelineResult.maskUrls,
    previewImageUrls:
      previewImageUrls.length > 0 ? previewImageUrls : pipelineResult.previewImageUrls,
  };
}

async function runRemotePipeline(request: AvatarPipelineRequest) {
  const pipelineUrl = resolvePipelineUrl();
  if (!pipelineUrl) {
    return null;
  }

  try {
    const response = await fetch(`${pipelineUrl}/avatar/process`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.AVATAR_PIPELINE_TOKEN
          ? { Authorization: `Bearer ${process.env.AVATAR_PIPELINE_TOKEN}` }
          : {}),
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Avatar pipeline request failed with status ${response.status}`);
    }

    const pipelineResult = (await response.json()) as AvatarPipelineResult;
    return persistRemoteOutputs(request, {
      ...pipelineResult,
      pipelineMode: "external",
      warnings: [
        ...(pipelineResult.warnings ?? []),
        "Phase 2 preprocessing is active for this avatar session.",
      ],
    });
  } catch (error) {
    console.error("External avatar pipeline unavailable, using fallback pipeline:", error);
    return {
      ...runFallbackPipeline(request),
      warnings: [
        "The external preprocessing service was unavailable, so this avatar used the standard fallback pipeline.",
        "Deploy the Python backend and set AVATAR_PIPELINE_URL for live segmentation and alignment in production.",
      ],
    };
  }
}

function runFallbackPipeline(request: AvatarPipelineRequest): AvatarPipelineResult {
  const measurements = deriveMeasurementsFromViews();

  return {
    status: "completed",
    stage: "complete",
    progress: 100,
    pipelineMode: "fallback",
    previewImageUrls: Object.values(request.views),
    normalizedImageUrls: request.views,
    maskUrls: {},
    resultGlbUrl: `/api/avatar/model/${request.sessionId}`,
    resultObjUrl: null,
    measurements,
    smplParams: {
      model: "smpl-phase1-placeholder",
      pose: "canonical-standing",
    },
    confidence: 0.61,
    warnings: [
      "Using the built-in fallback reconstruction because no external avatar pipeline is configured.",
      "Set AVATAR_PIPELINE_URL to a separately deployed Python backend to enable Phase 2 segmentation and alignment in production.",
    ],
  };
}

export async function runAvatarPipeline(request: AvatarPipelineRequest) {
  const remoteResult = await runRemotePipeline(request);
  if (remoteResult) {
    return remoteResult;
  }

  return runFallbackPipeline(request);
}
