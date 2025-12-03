import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// In iframe contexts, cookies are unreliable due to third-party cookie restrictions
// We'll handle auth on the client side instead for better compatibility
export async function middleware(request: NextRequest) {
  // Simply pass through all requests - auth will be handled client-side
  return NextResponse.next();
}

export const config = {
  matcher: []
};