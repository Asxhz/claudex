import { NextRequest, NextResponse } from "next/server";
import { validateAdapterAuth, AdapterAuthError } from "@/lib/utrace/adapter-auth";
import { tokenStore } from "@/app/api/__utrace/validation-token/route";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    await validateAdapterAuth(request.headers, body);

    const { token } = body;

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400 }
      );
    }

    const entry = tokenStore.get(token);

    if (!entry) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    if (entry.expiresAt < new Date()) {
      tokenStore.delete(token);
      return NextResponse.json(
        { error: "Token has expired" },
        { status: 401 }
      );
    }

    tokenStore.delete(token);

    return NextResponse.json({
      valid: true,
      session_id: entry.sessionId,
      client_id: entry.clientId,
      authenticated_at: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof AdapterAuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
