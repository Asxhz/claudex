import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { comments, feedPosts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { generateId } from "@/lib/utils";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { postId } = await params;
    const { body } = await request.json();

    if (!body || typeof body !== "string") {
      return NextResponse.json(
        { error: "Comment body is required" },
        { status: 400 }
      );
    }

    const post = await db
      .select({ id: feedPosts.id, is_draft: feedPosts.is_draft, author_id: feedPosts.author_id })
      .from(feedPosts)
      .where(eq(feedPosts.id, postId))
      .limit(1);

    if (!post.length) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (post[0].is_draft && post[0].author_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const commentId = generateId("comment");

    await db.insert(comments).values({
      id: commentId,
      post_id: postId,
      author_id: user.id,
      body,
    });

    return NextResponse.json({
      id: commentId,
      post_id: postId,
      author_id: user.id,
      body,
      created_at: new Date(),
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
