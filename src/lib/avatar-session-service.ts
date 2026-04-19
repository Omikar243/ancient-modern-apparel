import { and, desc, eq, InferSelectModel } from "drizzle-orm";

import { db } from "@/db";
import { avatarSessions, avatars, userAvatars } from "@/db/schema";
import type {
  AvatarCaptureViewMap,
  AvatarMeasurements,
  AvatarPipelineResult,
  AvatarSessionRecord,
  AvatarSessionResultMeta,
  AvatarSessionStatus,
  AvatarView,
} from "@/lib/avatar-types";
import { createAvatarSignedUrl } from "@/lib/avatar-storage";

function parseJson<T>(value: unknown, fallback: T): T {
  let current = value;

  while (typeof current === "string") {
    try {
      const parsed = JSON.parse(current) as unknown;
      if (parsed === current) {
        break;
      }
      current = parsed;
    } catch {
      break;
    }
  }

  return (current as T) ?? fallback;
}

function normalizeSessionRecord(record: InferSelectModel<typeof avatarSessions>): AvatarSessionRecord {
  return {
    id: record.id,
    userId: record.userId,
    status: record.status as AvatarSessionStatus,
    captureViews: parseJson<AvatarView[]>(record.captureViews, []),
    inputImageUrls: parseJson<AvatarCaptureViewMap>(record.inputImageUrls, {
      front: "",
      back: "",
      left: "",
      right: "",
    }),
    normalizedImageUrls: parseJson<Partial<Record<AvatarView, string>>>(record.normalizedImageUrls, {}),
    maskUrls: parseJson<Partial<Record<AvatarView, string>>>(record.maskUrls, {}),
    previewImageUrls: parseJson<string[]>(record.previewImageUrls, []),
    resultGlbUrl: record.resultGlbUrl ?? null,
    resultObjUrl: record.resultObjUrl ?? null,
    resultMeta: parseJson<AvatarSessionResultMeta>(record.resultMeta, {}),
    pipelineVersion: record.pipelineVersion,
    errorCode: record.errorCode ?? null,
    errorMessage: record.errorMessage ?? null,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export async function createAvatarSession(params: {
  id: string;
  userId: string;
  captureViews: AvatarView[];
  inputImageUrls: AvatarCaptureViewMap;
  pipelineVersion?: string;
}) {
  const now = new Date().toISOString();

  await db.insert(avatarSessions).values({
    id: params.id,
    userId: params.userId,
    status: "uploaded",
    captureViews: params.captureViews,
    inputImageUrls: params.inputImageUrls,
    normalizedImageUrls: {},
    maskUrls: {},
    previewImageUrls: [],
    resultMeta: {},
    pipelineVersion: params.pipelineVersion ?? "phase1-smpl-baseline",
    createdAt: now,
    updatedAt: now,
  });

  return getAvatarSessionById(params.id, params.userId);
}

export async function getAvatarSessionById(id: string, userId: string) {
  const records = await db
    .select()
    .from(avatarSessions)
    .where(and(eq(avatarSessions.id, id), eq(avatarSessions.userId, userId)))
    .limit(1);

  if (!records.length) {
    return null;
  }

  return normalizeSessionRecord(records[0]);
}

export async function getLatestCompletedAvatarSession(userId: string) {
  const records = await db
    .select()
    .from(avatarSessions)
    .where(and(eq(avatarSessions.userId, userId), eq(avatarSessions.status, "completed")))
    .orderBy(desc(avatarSessions.updatedAt))
    .limit(1);

  if (!records.length) {
    return null;
  }

  return normalizeSessionRecord(records[0]);
}

export async function updateAvatarSessionStatus(params: {
  id: string;
  userId: string;
  status: AvatarSessionStatus;
  errorCode?: string | null;
  errorMessage?: string | null;
}) {
  const now = new Date().toISOString();
  await db
    .update(avatarSessions)
    .set({
      status: params.status,
      errorCode: params.errorCode ?? null,
      errorMessage: params.errorMessage ?? null,
      updatedAt: now,
    })
    .where(and(eq(avatarSessions.id, params.id), eq(avatarSessions.userId, params.userId)));
}

export async function completeAvatarSession(params: {
  id: string;
  userId: string;
  pipelineResult: AvatarPipelineResult;
}) {
  const now = new Date().toISOString();
  const existing = await getAvatarSessionById(params.id, params.userId);

  if (!existing) {
    throw new Error("Avatar session not found");
  }

  const mergedMeta: AvatarSessionResultMeta = {
    ...existing.resultMeta,
    measurements: params.pipelineResult.measurements ?? existing.resultMeta.measurements,
    smplParams: params.pipelineResult.smplParams ?? existing.resultMeta.smplParams ?? null,
    confidence: params.pipelineResult.confidence ?? existing.resultMeta.confidence,
    warnings: params.pipelineResult.warnings ?? existing.resultMeta.warnings ?? [],
    stageTimings: existing.resultMeta.stageTimings ?? {},
    pipelineOutputs: {
      ...(existing.resultMeta.pipelineOutputs ?? {}),
      stage: params.pipelineResult.stage,
      progress: params.pipelineResult.progress,
    },
  };

  await db
    .update(avatarSessions)
    .set({
      status: params.pipelineResult.status,
      normalizedImageUrls: params.pipelineResult.normalizedImageUrls ?? existing.normalizedImageUrls,
      maskUrls: params.pipelineResult.maskUrls ?? existing.maskUrls,
      previewImageUrls: params.pipelineResult.previewImageUrls ?? existing.previewImageUrls,
      resultGlbUrl: params.pipelineResult.resultGlbUrl ?? existing.resultGlbUrl,
      resultObjUrl: params.pipelineResult.resultObjUrl ?? existing.resultObjUrl,
      resultMeta: mergedMeta,
      errorCode: params.pipelineResult.errorCode ?? null,
      errorMessage: params.pipelineResult.errorMessage ?? null,
      updatedAt: now,
    })
    .where(and(eq(avatarSessions.id, params.id), eq(avatarSessions.userId, params.userId)));

  const updated = await getAvatarSessionById(params.id, params.userId);
  if (updated && updated.status === "completed") {
    await syncLegacyAvatarRecord(updated);
  }
}

async function syncLegacyAvatarRecord(session: AvatarSessionRecord) {
  const measurements = session.resultMeta.measurements;
  if (!measurements) {
    return;
  }

  const now = new Date().toISOString();
  const existing = await db
    .select()
    .from(avatars)
    .where(eq(avatars.userId, session.userId))
    .orderBy(desc(avatars.updatedAt))
    .limit(1);

  const legacyPhotos = [
    session.inputImageUrls.front,
    session.inputImageUrls.back,
    session.inputImageUrls.left,
    session.inputImageUrls.right,
  ];

  if (existing.length) {
    await db
      .update(avatars)
      .set({
        measurements,
        photos: legacyPhotos,
        updatedAt: now,
      })
      .where(eq(avatars.id, existing[0].id));
  } else {
    await db.insert(avatars).values({
      userId: session.userId,
      measurements,
      photos: legacyPhotos,
      createdAt: now,
      updatedAt: now,
    });
  }

  const existingUserAvatar = await db
    .select()
    .from(userAvatars)
    .where(eq(userAvatars.userId, session.userId))
    .limit(1);

  if (existingUserAvatar.length) {
    await db
      .update(userAvatars)
      .set({
        measurements,
        photos: legacyPhotos,
        updatedAt: now,
      })
      .where(eq(userAvatars.id, existingUserAvatar[0].id));
    return;
  }

  await db.insert(userAvatars).values({
    userId: session.userId,
    measurements,
    photos: legacyPhotos,
    unitPreference: "cm",
    updatedAt: now,
  });
}

export async function buildAvatarSessionResponse(session: AvatarSessionRecord) {
  const signedInputUrls = {
    front: await createAvatarSignedUrl(session.inputImageUrls.front),
    back: await createAvatarSignedUrl(session.inputImageUrls.back),
    left: await createAvatarSignedUrl(session.inputImageUrls.left),
    right: await createAvatarSignedUrl(session.inputImageUrls.right),
  };

  const previewImages = await Promise.all(
    session.previewImageUrls.map((path) => createAvatarSignedUrl(path))
  );

  return {
    sessionId: session.id,
    status: session.status,
    stage:
      session.status === "uploaded"
        ? "upload"
        : session.status === "queued"
          ? "preprocessing"
          : session.status === "processing"
            ? "reconstruction"
            : session.status === "completed"
              ? "complete"
              : "export",
    progress:
      session.status === "uploaded"
        ? 10
        : session.status === "queued"
          ? 30
          : session.status === "processing"
            ? 65
            : session.status === "completed"
              ? 100
              : 0,
    warnings: session.resultMeta.warnings ?? [],
    views: signedInputUrls,
    previewImages,
    measurements: session.resultMeta.measurements ?? null,
    smplParams: session.resultMeta.smplParams ?? null,
    confidence: session.resultMeta.confidence ?? null,
    modelUrl: session.resultGlbUrl,
    errorCode: session.errorCode,
    errorMessage: session.errorMessage,
  };
}

export async function getLatestLegacyAvatarExtras(userId: string) {
  const latestSession = await getLatestCompletedAvatarSession(userId);
  return {
    fittedModelUrl: latestSession?.resultGlbUrl ?? null,
    avatarSessionId: latestSession?.id ?? null,
    measurements: latestSession?.resultMeta.measurements ?? null,
  };
}

export function coerceMeasurements(value: unknown) {
  return parseJson<AvatarMeasurements | null>(value, null);
}
