# External Avatar Pipeline Deployment

This repository now supports a split deployment model:

- Vercel hosts the Next.js storefront.
- A separate Python host runs the Phase 2 avatar pipeline.

## Python service

The FastAPI app entrypoint is:

- `backend/main.py`

The main endpoint used by the storefront is:

- `POST /avatar/process`

Health check:

- `GET /health`

## Required storefront environment variables

Add these to the frontend deployment when the external pipeline is live:

```env
AVATAR_PIPELINE_URL=https://your-python-service.example.com
AVATAR_PIPELINE_TOKEN=optional-shared-secret
```

## Runtime behavior

- If `AVATAR_PIPELINE_URL` is set and reachable, avatar jobs use the external preprocessing pipeline.
- If the external pipeline is unavailable, the storefront now falls back gracefully to the built-in production pipeline and records a warning instead of failing the entire avatar session.

## Recommended production checks

1. Open `GET /health` on the Python service.
2. Generate an avatar in the storefront.
3. Confirm the avatar result page shows:
   - `Enhanced preprocessing active` when the external service is healthy
   - cleaned views and segmentation masks in the capture review section

If the storefront shows `Standard production pipeline`, the external backend is either not configured or not reachable.
