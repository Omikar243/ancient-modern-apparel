import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { NextResponse } from "next/server";

// Better Auth uses the Turso/libsql adapter, which must run in the Node.js runtime.
export const runtime = "nodejs";

const handler = toNextJsHandler(auth);

function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return String(error);
}

async function withAuthErrorBoundary(request: Request, method: "GET" | "POST") {
  try {
    return await handler[method](request);
  } catch (error) {
    console.error(`Better Auth ${method} request failed`, error);
    return NextResponse.json(
      {
        error: "AUTH_SERVER_ERROR",
        message: process.env.NODE_ENV === "production"
          ? "Authentication service is not configured correctly. Please check the server database and auth environment variables."
          : errorMessage(error),
      },
      { status: 500 },
    );
  }
}

export const POST = (request: Request) => withAuthErrorBoundary(request, "POST");
export const GET = (request: Request) => withAuthErrorBoundary(request, "GET");
