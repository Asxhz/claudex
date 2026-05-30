import Link from "next/link";
import { db } from "@/db";
import { feedPosts, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import type { FeedPost, User } from "@/types";
import FeedPostCard from "@/components/feed/FeedPostCard";
import Button from "@/components/ui/Button";

export default async function Home() {
  const recentPosts = await db
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
        email: users.email,
        display_name: users.display_name,
        handle: users.handle,
        avatar_seed: users.avatar_seed,
        bio: users.bio,
        created_at: users.created_at,
      },
    })
    .from(feedPosts)
    .innerJoin(users, eq(feedPosts.author_id, users.id))
    .where(eq(feedPosts.is_draft, false))
    .orderBy(desc(feedPosts.published_at))
    .limit(4);

  return (
    <div className="min-h-screen">
      <section className="max-w-3xl mx-auto px-4 pt-24 pb-16 text-center">
        <h1 className="text-[36px] font-bold tracking-tight text-[#F4F4F5]">
          Benchmark AI Coding Agents
        </h1>
        <p className="mt-4 text-lg text-[rgba(244,244,245,0.62)] max-w-xl mx-auto">
          Run standardized benchmarks, compare agent performance, and share
          results with the community.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link href="/feed">
            <Button variant="primary">Browse Feed</Button>
          </Link>
          <Link href="/benchmarks/new">
            <Button variant="secondary">Run a Benchmark</Button>
          </Link>
        </div>
      </section>

      {recentPosts.length > 0 && (
        <section className="max-w-2xl mx-auto px-4 pb-16">
          <h2 className="text-lg font-semibold text-[#F4F4F5] mb-4">
            Recent Benchmarks
          </h2>
          <div className="border border-white/[0.08] rounded-xl overflow-hidden">
            {recentPosts.map((row) => (
              <FeedPostCard
                key={row.id}
                post={
                  {
                    id: row.id,
                    author_id: row.author_id,
                    task_id: row.task_id,
                    body: row.body,
                    agent_results: row.agent_results as FeedPost["agent_results"],
                    is_draft: row.is_draft,
                    published_at: row.published_at,
                    created_at: row.created_at,
                    author: row.author as User,
                  } as FeedPost & { author: User }
                }
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
