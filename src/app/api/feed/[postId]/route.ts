import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { feedPosts, comments, users } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;

    const postResult = await db
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
      .where(eq(feedPosts.id, postId))
      .limit(1);

    if (!postResult.length) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const post = postResult[0];
    if (post.is_draft) {
      const currentUser = await getCurrentUser();
      if (!currentUser || currentUser.id !== post.author_id) {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
      }
    }

    const postComments = await db
      .select({
        id: comments.id,
        post_id: comments.post_id,
        author_id: comments.author_id,
        body: comments.body,
        created_at: comments.created_at,
        author: {
          id: users.id,
          display_name: users.display_name,
          handle: users.handle,
          avatar_seed: users.avatar_seed,
        },
      })
      .from(comments)
      .innerJoin(users, eq(comments.author_id, users.id))
      .where(eq(comments.post_id, postId))
      .orderBy(asc(comments.created_at));

    return NextResponse.json({
      post: postResult[0],
      comments: postComments,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
