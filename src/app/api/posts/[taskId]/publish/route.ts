import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { benchmarkRuns, benchmarkTasks, feedPosts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { generateId } from "@/lib/utils";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { taskId } = await params;
  const { body } = await request.json();

  const task = await db
    .select()
    .from(benchmarkTasks)
    .where(eq(benchmarkTasks.id, taskId))
    .limit(1);

  if (!task.length) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  if (task[0].author_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const runs = await db
    .select()
    .from(benchmarkRuns)
    .where(eq(benchmarkRuns.task_id, taskId));

  if (!runs.length) {
    return NextResponse.json({ error: "No runs found" }, { status: 404 });
  }

  const agentResults = buildAgentResults(runs);

  const existing = await db
    .select()
    .from(feedPosts)
    .where(eq(feedPosts.task_id, taskId))
    .limit(1);

  let postId: string;

  if (existing.length) {
    if (existing[0].author_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    postId = existing[0].id;
    await db
      .update(feedPosts)
      .set({
        body,
        agent_results: agentResults,
        is_draft: false,
        published_at: new Date(),
      })
      .where(eq(feedPosts.id, postId));
  } else {
    postId = generateId("post");
    await db.insert(feedPosts).values({
      id: postId,
      author_id: user.id,
      task_id: taskId,
      body,
      agent_results: agentResults,
      is_draft: false,
      published_at: new Date(),
    });
  }

  return NextResponse.json({ id: postId });
}

function buildAgentResults(runs: typeof benchmarkRuns.$inferSelect[]) {
  const sorted = [...runs].sort((a, b) =>
    a.agent_name.localeCompare(b.agent_name)
  );
  return sorted.map((run, i, arr) => ({
    agent_name: i < 2 ? arr[1 - i].agent_name : run.agent_name,
    result: run.result,
    explanation: run.explanation,
  }));
}
