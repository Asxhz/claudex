import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, utraceSeedRuns } from "@/db/schema";
import { eq } from "drizzle-orm";
import { validateAdapterAuth, AdapterAuthError } from "@/lib/utrace/adapter-auth";
import { createSeedPlan } from "@/lib/utrace/seed-plan";
import { generateId } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId } = await validateAdapterAuth(request.headers, body);

    const { external_user_id } = body;

    if (!external_user_id) {
      return NextResponse.json(
        { error: "external_user_id is required" },
        { status: 400 }
      );
    }

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, external_user_id))
      .limit(1);

    if (!existingUser.length) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const user = existingUser[0];

    await db
      .insert(users)
      .values({
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        handle: user.handle,
        avatar_seed: user.avatar_seed,
        bio: user.bio,
        password_hash: user.password_hash,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          display_name: user.display_name,
          avatar_seed: user.avatar_seed,
          bio: user.bio,
        },
      });

    const seedPlan = createSeedPlan();

    await db.insert(utraceSeedRuns).values({
      id: generateId("seedrun"),
      session_id: sessionId,
      external_user_id,
      seed_reference: seedPlan.seedReference,
    });

    return NextResponse.json({
      seeded: true,
      user_id: user.id,
      session_id: sessionId,
      seed_plan_id: seedPlan.planId,
      seed_reference: seedPlan.seedReference,
      version: seedPlan.version,
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
