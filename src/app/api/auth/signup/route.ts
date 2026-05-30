import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { createSession } from "@/lib/auth";
import { generateId } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const { display_name, handle, email, password } = await request.json();

    if (!display_name || !handle || !email || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const existing = await db
      .select({ id: users.id, email: users.email, handle: users.handle })
      .from(users)
      .where(or(eq(users.email, email), eq(users.handle, handle)))
      .limit(1);

    if (existing.length) {
      const conflict =
        existing[0].email === email ? "Email" : "Handle";
      return NextResponse.json(
        { error: `${conflict} already taken` },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = generateId("user");

    await db.insert(users).values({
      id: userId,
      display_name,
      handle,
      email,
      password_hash: passwordHash,
      avatar_seed: handle,
    });

    await createSession(userId);

    return NextResponse.json({
      id: userId,
      email,
      display_name,
      handle,
      avatar_seed: handle,
      bio: null,
      created_at: new Date(),
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
