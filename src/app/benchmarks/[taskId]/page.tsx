import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/db";
import { benchmarkTasks, benchmarkRuns, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import type { BenchmarkTask, BenchmarkRun, User } from "@/types";
import BenchmarkHeader from "@/components/benchmark/BenchmarkHeader";
import RunCard from "@/components/benchmark/RunCard";
import Button from "@/components/ui/Button";

export default async function BenchmarkDetailPage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { taskId } = await params;

  const taskRows = await db
    .select()
    .from(benchmarkTasks)
    .where(eq(benchmarkTasks.id, taskId))
    .limit(1);

  if (!taskRows.length) notFound();

  const task = taskRows[0] as BenchmarkTask;

  const authorRows = await db
    .select({
      id: users.id,
      email: users.email,
      display_name: users.display_name,
      handle: users.handle,
      avatar_seed: users.avatar_seed,
      bio: users.bio,
      created_at: users.created_at,
    })
    .from(users)
    .where(eq(users.id, task.author_id!))
    .limit(1);

  if (!authorRows.length) notFound();

  const author = authorRows[0] as User;

  const runs = (await db
    .select()
    .from(benchmarkRuns)
    .where(eq(benchmarkRuns.task_id, taskId))
    .orderBy(desc(benchmarkRuns.created_at))) as BenchmarkRun[];

  const currentUser = await getCurrentUser();
  const isAuthor = currentUser?.id === author.id;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <BenchmarkHeader task={task} author={author} />

      {isAuthor && (
        <div className="mt-6">
          <Link href={`/benchmarks/${taskId}/publish`}>
            <Button variant="primary">Publish to Feed</Button>
          </Link>
        </div>
      )}

      {runs.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-[#F4F4F5] mb-4">
            Runs
          </h2>
          <div className="grid gap-3">
            {runs.map((run) => (
              <RunCard key={run.id} run={run} />
            ))}
          </div>
        </div>
      )}

      {runs.length === 0 && (
        <p className="mt-8 text-sm text-[rgba(244,244,245,0.40)]">
          No benchmark runs yet.
        </p>
      )}
    </div>
  );
}
