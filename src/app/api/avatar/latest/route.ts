import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { buildAvatarSessionResponse, getLatestCompletedAvatarSession } from "@/lib/avatar-session-service";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const latestSession = await getLatestCompletedAvatarSession(session.user.id);
    if (!latestSession) {
      return NextResponse.json({ error: "No avatar session found" }, { status: 404 });
    }

    const payload = await buildAvatarSessionResponse(latestSession);
    return NextResponse.json(payload);
  } catch (error) {
    console.error("GET /api/avatar/latest error:", error);
    return NextResponse.json(
      { error: "Failed to load the latest avatar session." },
      { status: 500 }
    );
  }
}
