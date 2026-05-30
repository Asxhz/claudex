import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sessions, utraceSeedMarkers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { validateAdapterAuth, AdapterAuthError } from "@/lib/utrace/adapter-auth";
import { tokenStore } from "@/lib/utrace/validation-store";
import { generateId } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    await validateAdapterAuth(request.headers, body);

    const { validation_token } = body as Record<string, string>;

    if (!validation_token || typeof validation_token !== "string") {
      return NextResponse.json(
        { error: "validation_token is required" },
        { status: 400 }
      );
    }

    const entry = tokenStore.get(validation_token);

    if (!entry) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    if (entry.expiresAt < new Date()) {
      tokenStore.delete(validation_token);
      return NextResponse.json(
        { error: "Token has expired" },
        { status: 401 }
      );
    }

    tokenStore.delete(validation_token);

    const marker = await db
      .select()
      .from(utraceSeedMarkers)
      .where(eq(utraceSeedMarkers.session_id, entry.sessionId))
      .limit(1);

    if (!marker.length || marker[0].preview_id !== entry.previewId) {
      return NextResponse.json(
        { error: "Preview has not been seeded" },
        { status: 409 }
      );
    }

    const sessionId = generateId("sess");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await db.insert(sessions).values({
      id: sessionId,
      user_id: marker[0].external_user_id,
      expires_at: expiresAt,
    });

    const response = NextResponse.json({
      authenticated: true,
      browser_authenticated: true,
      session_id: entry.sessionId,
      preview_id: entry.previewId,
    });

    response.cookies.set("claudex_session", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60,
    });

    return response;
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
