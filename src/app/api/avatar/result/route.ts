import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import {
  buildAvatarSessionResponse,
  getAvatarSessionById,
} from "@/lib/avatar-session-service";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json({ error: "session_id is required" }, { status: 400 });
    }

    const avatarSession = await getAvatarSessionById(sessionId, session.user.id);
    if (!avatarSession) {
      return NextResponse.json({ error: "Avatar session not found" }, { status: 404 });
    }

    const payload = await buildAvatarSessionResponse(avatarSession);
    return NextResponse.json(payload);
  } catch (error) {
    console.error("GET /api/avatar/result error:", error);
    return NextResponse.json(
      { error: "Failed to load avatar session result." },
      { status: 500 }
    );
  }
}
