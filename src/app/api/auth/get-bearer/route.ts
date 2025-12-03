import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Get the session from cookies
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // The session token is what we need for bearer authentication
    // This is the token stored in the session table
    const token = session.session?.token;

    if (!token) {
      console.error("Session exists but no token found:", session);
      return NextResponse.json(
        { error: "No token in session" },
        { status: 500 }
      );
    }

    return NextResponse.json({ token });
  } catch (error) {
    console.error("Error getting bearer token:", error);
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 }
    );
  }
}