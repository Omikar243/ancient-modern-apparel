import os

from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel

from .pipeline.segmentation import run_segmentation
from .pipeline.alignment import run_alignment
from .pipeline.reconstruction import run_reconstruction
from .pipeline.texture import run_texture


class AvatarProcessRequest(BaseModel):
    sessionId: str
    userId: str
    views: dict
    pipelineVersion: str = "phase1-smpl-baseline"


app = FastAPI(title="Ancient Modern Avatar Pipeline")


def validate_pipeline_token(authorization: str | None) -> None:
    expected_token = os.getenv("AVATAR_PIPELINE_TOKEN")
    if not expected_token:
        return

    if not authorization:
        raise HTTPException(status_code=401, detail="Missing pipeline authorization token.")

    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or token != expected_token:
        raise HTTPException(status_code=401, detail="Invalid pipeline authorization token.")


@app.get("/health")
def health():
    return {
        "status": "ok",
        "pipeline": "avatar-phase2",
        "tokenProtected": bool(os.getenv("AVATAR_PIPELINE_TOKEN")),
    }


@app.post("/avatar/process")
def process_avatar(
    request: AvatarProcessRequest,
    authorization: str | None = Header(default=None),
):
    validate_pipeline_token(authorization)

    segmentation = run_segmentation(request.views)
    alignment = run_alignment(segmentation)
    reconstruction = run_reconstruction(alignment)
    textured = run_texture(reconstruction)
    return textured
