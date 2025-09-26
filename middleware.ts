import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
 
  if (!session?.user) {
    return NextResponse.redirect(new URL("/login?redirect=" + encodeURIComponent(request.nextUrl.pathname), request.url));
  }
 
  return NextResponse.next();
}
 
export const config = {
  runtime: "nodejs",
  matcher: ["/avatar", "/preview"],
};