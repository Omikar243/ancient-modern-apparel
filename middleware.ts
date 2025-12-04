import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // In iframe environments, cookies are blocked due to third-party cookie restrictions
  // Authentication is handled client-side using useSession() hook and localStorage bearer tokens
  // Simply allow all requests to proceed - client components handle their own auth protection
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/profile/:path*",
    "/avatar/:path*",
    "/catalog/:path*",
    "/preview/:path*",
    "/cart/:path*",
    "/login/:path*"
  ]
};