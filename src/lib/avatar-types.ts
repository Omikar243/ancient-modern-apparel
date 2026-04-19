export type AvatarView = "front" | "back" | "left" | "right";

export type AvatarSessionStatus =
  | "uploaded"
  | "queued"
  | "processing"
  | "completed"
  | "failed";

export type AvatarStage =
  | "upload"
  | "preprocessing"
  | "alignment"
  | "reconstruction"
  | "export"
  | "complete";

export interface AvatarMeasurements {
  height: number;
  bust: number;
  waist: number;
  hips: number;
  shoulders: number;
}

export interface AvatarCaptureViewMap {
  front: string;
  back: string;
  left: string;
  right: string;
}

export interface AvatarSessionResultMeta {
  measurements?: AvatarMeasurements;
  smplParams?: Record<string, unknown> | null;
  confidence?: number;
  warnings?: string[];
  stageTimings?: Partial<Record<AvatarStage, number>>;
  pipelineOutputs?: Record<string, unknown>;
}

export interface AvatarSessionRecord {
  id: string;
  userId: string;
  status: AvatarSessionStatus;
  captureViews: AvatarView[];
  inputImageUrls: AvatarCaptureViewMap;
  normalizedImageUrls: Partial<Record<AvatarView, string>>;
  maskUrls: Partial<Record<AvatarView, string>>;
  previewImageUrls: string[];
  resultGlbUrl: string | null;
  resultObjUrl: string | null;
  resultMeta: AvatarSessionResultMeta;
  pipelineVersion: string;
  errorCode: string | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AvatarPipelineRequest {
  sessionId: string;
  userId: string;
  views: AvatarCaptureViewMap;
  pipelineVersion: string;
}

export interface AvatarPipelineResult {
  status: Extract<AvatarSessionStatus, "completed" | "failed">;
  stage: AvatarStage;
  progress: number;
  previewImageUrls?: string[];
  normalizedImageUrls?: Partial<Record<AvatarView, string>>;
  maskUrls?: Partial<Record<AvatarView, string>>;
  resultGlbUrl?: string | null;
  resultObjUrl?: string | null;
  measurements?: AvatarMeasurements;
  smplParams?: Record<string, unknown> | null;
  confidence?: number;
  warnings?: string[];
  errorCode?: string | null;
  errorMessage?: string | null;
}
