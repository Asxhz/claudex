import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { feedPosts, users } from "@/db/schema";
import { eq, desc, and, lt } from "drizzle-orm";

const PAGE_SIZE = 20;

export async function GET(request: NextRequest) {
  try {
    const cursor = request.nextUrl.searchParams.get("cursor");

    const conditions = [eq(feedPosts.is_draft, false)];
    if (cursor) {
      conditions.push(lt(feedPosts.published_at, new Date(cursor)));
    }

    const posts = await db
      .select({
        id: feedPosts.id,
        author_id: feedPosts.author_id,
        task_id: feedPosts.task_id,
        body: feedPosts.body,
        agent_results: feedPosts.agent_results,
        is_draft: feedPosts.is_draft,
        published_at: feedPosts.published_at,
        created_at: feedPosts.created_at,
        author: {
          id: users.id,
          display_name: users.display_name,
          handle: users.handle,
          avatar_seed: users.avatar_seed,
        },
      })
      .from(feedPosts)
      .innerJoin(users, eq(feedPosts.author_id, users.id))
      .where(and(...conditions))
      .orderBy(desc(feedPosts.published_at))
      .limit(PAGE_SIZE + 1);

    const hasMore = posts.length > PAGE_SIZE;
    const page = hasMore ? posts.slice(0, PAGE_SIZE) : posts;
    const nextCursor = hasMore
      ? page[page.length - 1].published_at?.toISOString()
      : null;

    return NextResponse.json({ posts: page, nextCursor });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
