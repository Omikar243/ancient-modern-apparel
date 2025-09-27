import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const setFrameHeaders = (res: NextResponse) => {
    // Ensure the app can be embedded inside Orchids iframe
    res.headers.delete("X-Frame-Options");
    res.headers.set(
      "Content-Security-Policy",
      "frame-ancestors 'self' https://*.orchids.page https://orchids.page http://localhost:* http://127.0.0.1:*;"
    );
    res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    return res;
  };

  // Protect only specific paths with auth, keep rest public
  if (pathname.startsWith("/avatar") || pathname.startsWith("/preview")) {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      const redirectUrl = new URL(
        "/login?redirect=" + encodeURIComponent(pathname + search),
        request.url
      );
      return setFrameHeaders(NextResponse.redirect(redirectUrl));
    }
  }

  return setFrameHeaders(NextResponse.next());
}

export const config = {
  runtime: "nodejs",
  // Run on all pages (exclude assets and api) so headers are set consistently for embedding
  matcher: ["/(?!_next/static|_next/image|favicon.ico|api).*"],
};