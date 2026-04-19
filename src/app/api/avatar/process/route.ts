import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import {
  completeAvatarSession,
  getAvatarSessionById,
  updateAvatarSessionStatus,
} from "@/lib/avatar-session-service";
import { runAvatarPipeline } from "@/lib/avatar-pipeline";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await request.json();
    const sessionId = typeof body.sessionId === "string" ? body.sessionId : null;

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
    }

    const avatarSession = await getAvatarSessionById(sessionId, session.user.id);
    if (!avatarSession) {
      return NextResponse.json({ error: "Avatar session not found" }, { status: 404 });
    }

    await updateAvatarSessionStatus({
      id: sessionId,
      userId: session.user.id,
      status: "queued",
    });

    await updateAvatarSessionStatus({
      id: sessionId,
      userId: session.user.id,
      status: "processing",
    });

    try {
      const pipelineResult = await runAvatarPipeline({
        sessionId,
        userId: session.user.id,
        views: avatarSession.inputImageUrls,
        pipelineVersion: avatarSession.pipelineVersion,
      });

      await completeAvatarSession({
        id: sessionId,
        userId: session.user.id,
        pipelineResult,
      });

      return NextResponse.json({
        sessionId,
        status: pipelineResult.status,
      });
    } catch (error) {
      console.error("Avatar processing pipeline error:", error);
      await updateAvatarSessionStatus({
        id: sessionId,
        userId: session.user.id,
        status: "failed",
        errorCode: "PIPELINE_ERROR",
        errorMessage: error instanceof Error ? error.message : "Pipeline execution failed",
      });

      return NextResponse.json(
        {
          sessionId,
          status: "failed",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("POST /api/avatar/process error:", error);
    return NextResponse.json(
      { error: "Failed to process avatar session." },
      { status: 500 }
    );
  }
}
