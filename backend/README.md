# Avatar Backend

This folder holds the separate GPU-oriented Python service for the avatar pipeline. The current Next.js app is the orchestration layer; this service is intended to be deployed independently once GPU infrastructure is available.

## Development milestones

1. Phase 1: build the upload UI and preprocessing
2. Phase 2: add SAM 3 segmentation and background removal
3. Phase 3: implement a baseline 4-view reconstruction model
4. Phase 4: train on MVHumanNet
5. Phase 5: add 2K2K-style detail refinement and use the dataset
6. Phase 6: use THuman2.0 for clothing-focused realism
7. Phase 7: texture baking and mesh export
8. Phase 8: browser 3D preview and deployment

## Dataset roadmap

- `MVHumanNet`: primary dataset for multi-view fusion, masks, cameras, keypoints, and SMPL/SMPLX supervision
- `2K2K`: later detail refinement for normals, depth, folds, and higher-frequency geometry
- `THuman2.0`: later clothing-aware realism and texture improvement

## Runtime contract

The production Python service should expose an `/avatar/process` endpoint that accepts:

- `sessionId`
- `userId`
- ordered `front/back/left/right` image URLs
- `pipelineVersion`

The service should return terminal status, warnings, coarse measurements, optional SMPL params, and artifact URLs.
