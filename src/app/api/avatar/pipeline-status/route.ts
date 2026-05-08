import { NextResponse } from "next/server";

function resolvePipelineStatus() {
  const pipelineUrl = process.env.AVATAR_PIPELINE_URL?.trim();

  if (pipelineUrl) {
    return {
      mode: "external" as const,
      label: "Enhanced preprocessing enabled",
      description: "This deployment is configured to use the external Phase 2 avatar pipeline.",
    };
  }

  return {
    mode: "fallback" as const,
    label: "Standard production pipeline",
    description: "This deployment is using the built-in avatar pipeline while the external Phase 2 backend is offline or not configured.",
  };
}

export async function GET() {
  return NextResponse.json(resolvePipelineStatus());
}
