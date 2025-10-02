import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  // Check for bearer token in Authorization header
  const authHeader = request.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;
  
  // Check for session cookie
  const sessionCookie = request.cookies.get("better-auth.session_token");
  
  // If no auth token or session, redirect to login
  if (!bearerToken && !sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/profile", "/avatar", "/cart", "/preview", "/catalog/:id*"],
};