import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  try {
    // Define protected routes
    const protectedRoutes = ["/profile", "/avatar", "/catalog", "/preview", "/cart"];
    const isProtectedRoute = protectedRoutes.some(route => 
      request.nextUrl.pathname.startsWith(route)
    );

    if (!isProtectedRoute) {
      return NextResponse.next();
    }

    // Try to get session from bearer token first (for iframe compatibility)
    const authHeader = request.headers.get("authorization");
    const bearerToken = authHeader?.replace("Bearer ", "");
    
    // Also check for bearer token in cookies as fallback
    const cookieToken = request.cookies.get("bearer_token")?.value;
    const token = bearerToken || cookieToken;

    let session = null;
    
    if (token) {
      // Verify bearer token
      try {
        session = await auth.api.getSession({
          headers: new Headers({
            ...Object.fromEntries(request.headers.entries()),
            "Authorization": `Bearer ${token}`
          })
        });
      } catch (error) {
        console.error("Bearer token validation error:", error);
      }
    }
    
    // Fallback to cookie-based session
    if (!session) {
      session = await auth.api.getSession({ 
        headers: request.headers 
      });
    }

    // If trying to access a protected route without a session, redirect to login
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Allow access - pass token to the response if available
    const response = NextResponse.next();
    if (token) {
      response.cookies.set("bearer_token", token, {
        httpOnly: false, // Make it accessible to client-side JS
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7 // 7 days
      });
    }
    
    return response;
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
    "/cart/:path*"
  ]
};