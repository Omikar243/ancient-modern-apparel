import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ 
      headers: request.headers 
    });

    // Define protected routes
    const protectedRoutes = ["/profile", "/avatar", "/catalog", "/preview", "/cart"];
    const isProtectedRoute = protectedRoutes.some(route => 
      request.nextUrl.pathname.startsWith(route)
    );

    // If trying to access a protected route without a session, redirect to login
    if (isProtectedRoute && !session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    // If on login page and already authenticated, redirect to intended page or home
    if (request.nextUrl.pathname.startsWith("/login") && session) {
      const redirectTo = request.nextUrl.searchParams.get("redirect") || "/";
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    return NextResponse.next();
  }
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