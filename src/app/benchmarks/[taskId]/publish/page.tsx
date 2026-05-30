import { notFound, redirect } from "next/navigation";
import { db } from "@/db";
import { benchmarkTasks, benchmarkRuns, feedPosts, users } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import type { BenchmarkTask, BenchmarkRun } from "@/types";
import PublishForm from "./PublishForm";

export default async function PublishPage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { taskId } = await params;

  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");

  const taskRows = await db
    .select()
    .from(benchmarkTasks)
    .where(eq(benchmarkTasks.id, taskId))
    .limit(1);

  if (!taskRows.length) notFound();

  const task = taskRows[0] as BenchmarkTask;

  if (task.author_id !== currentUser.id) notFound();

  const runs = (await db
    .select()
    .from(benchmarkRuns)
    .where(eq(benchmarkRuns.task_id, taskId))
    .orderBy(desc(benchmarkRuns.created_at))) as BenchmarkRun[];

  const draftRows = await db
    .select({ body: feedPosts.body })
    .from(feedPosts)
    .where(
      and(eq(feedPosts.task_id, taskId), eq(feedPosts.is_draft, true))
    )
    .limit(1);

  const draftBody = draftRows.length ? draftRows[0].body : "";

  return (
    <PublishForm
      taskId={taskId}
      task={task}
      runs={runs}
      draftBody={draftBody}
    />
  );
}
