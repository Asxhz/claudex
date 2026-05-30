import { cookies } from "next/headers";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateId } from "./utils";

const COOKIE_NAME = "claudex_session";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(COOKIE_NAME)?.value;
  if (!sessionId) return null;

  const result = await db
    .select({
      id: users.id,
      email: users.email,
      display_name: users.display_name,
      handle: users.handle,
      avatar_seed: users.avatar_seed,
      bio: users.bio,
      created_at: users.created_at,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.user_id, users.id))
    .where(eq(sessions.id, sessionId))
    .limit(1);

  if (!result.length) return null;

  const session = await db
    .select({ expires_at: sessions.expires_at })
    .from(sessions)
    .where(eq(sessions.id, sessionId))
    .limit(1);

  if (!session.length || session[0].expires_at < new Date()) return null;

  return result[0];
}

export async function createSession(userId: string): Promise<string> {
  const sessionId = generateId("sess");
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await db.insert(sessions).values({
    id: sessionId,
    user_id: userId,
    expires_at: expiresAt,
  });

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_MS / 1000,
  });

  return sessionId;
}

export async function destroySession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(COOKIE_NAME)?.value;

  if (sessionId) {
    await db.delete(sessions).where(eq(sessions.id, sessionId));
  }

  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
