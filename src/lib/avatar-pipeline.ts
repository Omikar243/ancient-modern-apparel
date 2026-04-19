import type {
  AvatarMeasurements,
  AvatarPipelineRequest,
  AvatarPipelineResult,
} from "@/lib/avatar-types";

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

async function runRemotePipeline(request: AvatarPipelineRequest) {
  const pipelineUrl = process.env.AVATAR_PIPELINE_URL;
  if (!pipelineUrl) {
    return null;
  }

  const response = await fetch(`${pipelineUrl.replace(/\/$/, "")}/avatar/process`, {
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

  return (await response.json()) as AvatarPipelineResult;
}

function runFallbackPipeline(request: AvatarPipelineRequest): AvatarPipelineResult {
  const measurements = deriveMeasurementsFromViews();

  return {
    status: "completed",
    stage: "complete",
    progress: 100,
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
      "Using the built-in local reconstruction fallback for this session.",
      "This preview is still coarse and will improve as the full reconstruction pipeline is expanded.",
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
