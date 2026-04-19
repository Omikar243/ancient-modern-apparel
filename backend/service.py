from fastapi import FastAPI
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


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/avatar/process")
def process_avatar(request: AvatarProcessRequest):
    segmentation = run_segmentation(request.views)
    alignment = run_alignment(segmentation)
    reconstruction = run_reconstruction(alignment)
    textured = run_texture(reconstruction)
    return textured
