import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { feedPosts, benchmarkTasks, users, comments } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { validateAdapterAuth, AdapterAuthError } from "@/lib/utrace/adapter-auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    await validateAdapterAuth(request.headers, body);

    const [userCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users);

    const [taskCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(benchmarkTasks);

    const [postCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(feedPosts)
      .where(eq(feedPosts.is_draft, false));

    const [commentCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(comments);

    const recentPosts = await db
      .select({
        id: feedPosts.id,
        task_id: feedPosts.task_id,
        body: feedPosts.body,
        published_at: feedPosts.published_at,
      })
      .from(feedPosts)
      .where(eq(feedPosts.is_draft, false))
      .orderBy(sql`${feedPosts.published_at} desc`)
      .limit(10);

    const tasks = await db
      .select({
        id: benchmarkTasks.id,
        title: benchmarkTasks.title,
        difficulty: benchmarkTasks.difficulty,
      })
      .from(benchmarkTasks)
      .limit(20);

    return NextResponse.json({
      observations: {
        users: { total: Number(userCount.count) },
        benchmark_tasks: {
          total: Number(taskCount.count),
          items: tasks,
        },
        feed_posts: {
          published: Number(postCount.count),
          recent: recentPosts,
        },
        comments: { total: Number(commentCount.count) },
      },
      observed_at: new Date().toISOString(),
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
