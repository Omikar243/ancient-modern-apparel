import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { getAvatarSessionById } from "@/lib/avatar-session-service";
import { createAvatarGltf } from "@/lib/avatar-gltf";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { sessionId } = await params;
    const avatarSession = await getAvatarSessionById(sessionId, session.user.id);
    if (!avatarSession) {
      return NextResponse.json({ error: "Avatar session not found" }, { status: 404 });
    }

    if (avatarSession.status !== "completed" || !avatarSession.resultMeta.measurements) {
      return NextResponse.json({ error: "Avatar model is not ready yet" }, { status: 409 });
    }

    const gltf = createAvatarGltf(avatarSession.resultMeta.measurements);
    return new NextResponse(gltf, {
      status: 200,
      headers: {
        "Content-Type": "model/gltf+json",
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch (error) {
    console.error("GET /api/avatar/model/[sessionId] error:", error);
    return NextResponse.json(
      { error: "Failed to generate the avatar model." },
      { status: 500 }
    );
  }
}
