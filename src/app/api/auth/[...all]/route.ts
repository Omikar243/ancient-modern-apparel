import { auth, getAuthDiagnostics } from "@/lib/auth";
import { NextRequest } from "next/server";

import { toNextJsHandler } from "better-auth/next-js";

const handlers = toNextJsHandler(auth);

function logAuthRequest(request: NextRequest) {
  console.info("[auth-route] request", {
    method: request.method,
    pathname: request.nextUrl.pathname,
    origin: request.headers.get("origin"),
    referer: request.headers.get("referer"),
    host: request.headers.get("host"),
    hasCookie: Boolean(request.headers.get("cookie")),
    hasAuthorization: Boolean(request.headers.get("authorization")),
    diagnostics: getAuthDiagnostics(),
  });
}

async function logAuthResponse(label: string, response: Response) {
  console.info("[auth-route] response", {
    label,
    status: response.status,
    hasSetCookie: response.headers.has("set-cookie"),
    hasSetAuthToken: response.headers.has("set-auth-token"),
    location: response.headers.get("location"),
  });
}

export async function GET(request: NextRequest) {
  logAuthRequest(request);
  const response = await handlers.GET(request);
  await logAuthResponse("GET", response);
  return response;
}

export async function POST(request: NextRequest) {
  logAuthRequest(request);
  const response = await handlers.POST(request);
  await logAuthResponse("POST", response);
  return response;
}
