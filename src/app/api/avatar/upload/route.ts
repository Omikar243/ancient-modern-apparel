import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { createAvatarSession } from "@/lib/avatar-session-service";
import { uploadAvatarAsset } from "@/lib/avatar-storage";
import type { AvatarCaptureViewMap, AvatarView } from "@/lib/avatar-types";

const REQUIRED_VIEWS: AvatarView[] = ["front", "back", "left", "right"];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

function isImageFile(file: File | null) {
  return Boolean(file && file.type.startsWith("image/"));
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const formData = await request.formData();
    const files = REQUIRED_VIEWS.map((view) => ({
      view,
      file: formData.get(view) as File | null,
    }));

    const missingViews = files.filter(({ file }) => !file).map(({ view }) => view);
    if (missingViews.length) {
      return NextResponse.json(
        { error: `Missing required views: ${missingViews.join(", ")}` },
        { status: 400 }
      );
    }

    for (const { view, file } of files) {
      if (!isImageFile(file)) {
        return NextResponse.json(
          { error: `The ${view} upload must be an image file.` },
          { status: 400 }
        );
      }

      if ((file?.size ?? 0) > MAX_FILE_SIZE_BYTES) {
        return NextResponse.json(
          { error: `The ${view} image exceeds the 10MB limit.` },
          { status: 400 }
        );
      }
    }

    const sessionId = randomUUID();
    const inputImageUrls = {} as AvatarCaptureViewMap;

    for (const { view, file } of files) {
      const ext = file!.name.split(".").pop()?.toLowerCase() || "jpg";
      const storagePath = `${session.user.id}/${sessionId}/inputs/${view}.${ext}`;
      const arrayBuffer = await file!.arrayBuffer();
      const uploadedPath = await uploadAvatarAsset({
        path: storagePath,
        buffer: arrayBuffer,
        contentType: file!.type || "image/jpeg",
      });
      inputImageUrls[view] = uploadedPath;
    }

    await createAvatarSession({
      id: sessionId,
      userId: session.user.id,
      captureViews: REQUIRED_VIEWS,
      inputImageUrls,
    });

    return NextResponse.json({
      sessionId,
      status: "uploaded",
      viewsReceived: REQUIRED_VIEWS,
    });
  } catch (error) {
    console.error("POST /api/avatar/upload error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to upload avatar capture set.",
      },
      { status: 500 }
    );
  }
}
