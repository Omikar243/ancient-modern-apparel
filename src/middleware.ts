import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function middleware(request: Request) {
  const session = await auth.api.getSession({ 
    headers: await request.headers 
  });

  // Define protected routes
  const protectedRoutes = ["/profile", "/avatar", "/catalog", "/preview", "/cart"];
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );

  if (isProtectedRoute && !session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If on login and authenticated, redirect to home or intended
  if (request.nextUrl.pathname.startsWith("/login") && session) {
    const redirectTo = request.nextUrl.searchParams.get("redirect") || "/";
    return NextResponse.redirect(new URL(redirectTo, request.url));
  }

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