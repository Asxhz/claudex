import { notFound } from "next/navigation";
import { db } from "@/db";
import { users, feedPosts } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import type { FeedPost, User } from "@/types";
import Avatar from "@/components/ui/Avatar";
import FeedPostCard from "@/components/feed/FeedPostCard";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;

  const userRows = await db
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
    .where(eq(users.handle, handle))
    .limit(1);

  if (!userRows.length) notFound();

  const user = userRows[0] as User;

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
    })
    .from(feedPosts)
    .where(
      and(eq(feedPosts.author_id, user.id), eq(feedPosts.is_draft, false))
    )
    .orderBy(desc(feedPosts.published_at));

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex flex-col items-center text-center">
        <Avatar handle={user.handle} displayName={user.display_name} size="lg" />
        <h1 className="mt-4 text-xl font-bold text-[#F4F4F5]">
          {user.display_name}
        </h1>
        <p className="mt-1 text-sm text-[rgba(244,244,245,0.40)]">
          @{user.handle}
        </p>
        {user.bio && (
          <p className="mt-3 text-sm text-[rgba(244,244,245,0.62)] max-w-md">
            {user.bio}
          </p>
        )}
        {user.created_at && (
          <p className="mt-2 text-xs text-[rgba(244,244,245,0.40)]">
            Joined{" "}
            {new Date(user.created_at).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </p>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-[#F4F4F5] mb-4">
          Published Posts
        </h2>
        {posts.length === 0 ? (
          <p className="text-sm text-[rgba(244,244,245,0.40)]">
            No published posts yet.
          </p>
        ) : (
          <div className="border border-white/[0.08] rounded-xl overflow-hidden">
            {posts.map((row) => (
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
                    author: user,
                  } as FeedPost & { author: User }
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
