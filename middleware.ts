import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers
  });

  if (!session) {
    // Redirect to login with the current URL as redirect param
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  runtime: "nodejs",
  matcher: ["/profile", "/avatar", "/cart", "/preview", "/catalog/:id*"],
};