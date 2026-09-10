import { NextResponse } from "next/server";

export const runtime = "nodejs";

function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return String(error);
}

function missingConfiguration() {
  return [
    !process.env.TURSO_CONNECTION_URL ? "TURSO_CONNECTION_URL" : null,
    !process.env.TURSO_AUTH_TOKEN ? "TURSO_AUTH_TOKEN" : null,
    !process.env.BETTER_AUTH_SECRET ? "BETTER_AUTH_SECRET" : null,
  ].filter(Boolean);
}

async function withAuthErrorBoundary(request: Request, method: "GET" | "POST") {
  try {
    const { auth } = await import("@/lib/auth");
    const { toNextJsHandler } = await import("better-auth/next-js");
    const handler = toNextJsHandler(auth);
    return await handler[method](request);
  } catch (error) {
    const missing = missingConfiguration();
    console.error(`Better Auth ${method} request failed`, { error, missing });
    return NextResponse.json(
      {
        error: "AUTH_SERVER_ERROR",
        message: process.env.NODE_ENV === "production"
          ? missing.length
            ? `Authentication server configuration is incomplete: ${missing.join(", ")}.`
            : "Authentication server failed while connecting to its database. Check the Turso URL, token, and migration state."
          : errorMessage(error),
      },
      { status: 500 },
    );
  }
}

export const POST = (request: Request) => withAuthErrorBoundary(request, "POST");
export const GET = (request: Request) => withAuthErrorBoundary(request, "GET");
