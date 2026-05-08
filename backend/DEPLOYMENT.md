# External Avatar Pipeline Deployment

This repository now supports a split deployment model:

- Vercel project 1 hosts the Next.js storefront from the repo root
- Vercel project 2 hosts the FastAPI backend from `backend/`

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

## Recommended Vercel setup

### 1. Create the backend project

Using the same Git repository:

1. In Vercel, click `Add New -> Project`
2. Import this repository again
3. Set `Root Directory` to `backend`
4. Let Vercel detect it as a FastAPI/Python project
5. Deploy

This follows Vercel's monorepo guidance for separate projects with different root directories, and Vercel's FastAPI docs indicate a standalone FastAPI app can deploy with a standard `app` entrypoint such as `main.py`.

### 2. Configure backend environment variables

Set these in the backend Vercel project:

```env
AVATAR_PIPELINE_TOKEN=choose-a-long-random-secret
```

The backend now checks the bearer token on `POST /avatar/process` when this variable is set.

### 3. Confirm backend health

Open:

```text
https://your-backend-project.vercel.app/health
```

Expected shape:

```json
{
  "status": "ok",
  "pipeline": "avatar-phase2",
  "tokenProtected": true
}
```

### 4. Wire the storefront

In your frontend Vercel project, set:

```env
AVATAR_PIPELINE_URL=https://your-backend-project.vercel.app
AVATAR_PIPELINE_TOKEN=the-same-secret-you-set-on-the-backend
```

Redeploy the frontend after adding both values.

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
