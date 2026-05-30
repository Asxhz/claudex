import { db } from "@/db";
import { feedPosts, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import type { FeedPost, User } from "@/types";
import FeedPostCard from "@/components/feed/FeedPostCard";

export default async function FeedPage() {
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
    .orderBy(desc(feedPosts.published_at));

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-[#F4F4F5] tracking-tight mb-6">
        Feed
      </h1>
      <div className="border border-white/[0.08] rounded-xl overflow-hidden">
        {posts.length === 0 ? (
          <p className="px-4 py-12 text-center text-sm text-[rgba(244,244,245,0.40)]">
            No posts yet.
          </p>
        ) : (
          posts.map((row) => (
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
          ))
        )}
      </div>
    </div>
  );
}
