import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { utraceSeedRuns } from "@/db/schema";
import { eq } from "drizzle-orm";
import { validateAdapterAuth, AdapterAuthError } from "@/lib/utrace/adapter-auth";
import { generateId } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    await validateAdapterAuth(request.headers, body);

    const { session_id } = body;

    if (!session_id) {
      return NextResponse.json(
        { error: "session_id is required" },
        { status: 400 }
      );
    }

    await db
      .delete(utraceSeedRuns)
      .where(eq(utraceSeedRuns.session_id, session_id));

    return NextResponse.json({
      reset: true,
      session_id,
      warm_environment_lease_id: generateId("lease"),
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
