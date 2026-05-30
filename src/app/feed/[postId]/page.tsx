import { notFound } from "next/navigation";
import { db } from "@/db";
import { feedPosts, users, comments } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import type { AgentResult, Comment, User } from "@/types";
import Avatar from "@/components/ui/Avatar";
import AgentResultBadge from "@/components/feed/AgentResultBadge";
import CommentThread from "@/components/feed/CommentThread";
import { fakeEngagement } from "@/lib/utils";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;
  const currentUser = await getCurrentUser();

  const postRows = await db
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
    .where(eq(feedPosts.id, postId))
    .limit(1);

  if (!postRows.length) notFound();

  const post = postRows[0];

  if (post.is_draft) {
    if (!currentUser || currentUser.id !== post.author_id) {
      notFound();
    }
  }

  const agentResults = post.agent_results as AgentResult[];
  const published = post.published_at ?? post.created_at;
  const engagement = fakeEngagement(post.id);

  const commentRows = await db
    .select({
      id: comments.id,
      post_id: comments.post_id,
      author_id: comments.author_id,
      body: comments.body,
      created_at: comments.created_at,
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
    .from(comments)
    .innerJoin(users, eq(comments.author_id, users.id))
    .where(eq(comments.post_id, postId))
    .orderBy(desc(comments.created_at));

  const commentsWithAuthor = commentRows.map((c) => ({
    id: c.id,
    post_id: c.post_id,
    author_id: c.author_id,
    body: c.body,
    created_at: c.created_at,
    author: c.author as User,
  })) as (Comment & { author: User })[];

  return (
    <div className="min-h-screen bg-[#000000] -mt-14">
      <style dangerouslySetInnerHTML={{ __html: `.feed-hide-nav { display: none !important; }` }} />

      <div className="flex justify-center">
        {/* Left Sidebar */}
        <aside className="hidden lg:flex flex-col justify-between w-[275px] h-screen sticky top-0 px-3 py-4 border-r border-[#2f3336]">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 px-3 py-3 rounded-full hover:bg-white/[0.04] transition-colors duration-150 mb-2">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M14 2L26 8V20L14 26L2 20V8L14 2Z" fill="#1d9bf0" fillOpacity="0.15" stroke="#1d9bf0" strokeWidth="1.5"/>
                <path d="M14 10L20 13V19L14 22L8 19V13L14 10Z" fill="#1d9bf0"/>
              </svg>
              <span className="text-xl font-bold text-[#e7e9ea]">Claudex</span>
            </Link>

            <nav className="flex flex-col gap-0.5 mt-2">
              <Link href="/" className="nav-item flex items-center gap-4 px-3 py-3 rounded-full text-[#e7e9ea] text-[20px]">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                <span>Home</span>
              </Link>
              <Link href="/feed" className="nav-item active flex items-center gap-4 px-3 py-3 rounded-full text-[#e7e9ea] text-[20px] font-bold">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 11a9 9 0 0 1 9 9"/>
                  <path d="M4 4a16 16 0 0 1 16 16"/>
                  <circle cx="5" cy="19" r="1" fill="currentColor"/>
                </svg>
                <span>Feed</span>
              </Link>
              <Link href="/benchmarks/new" className="nav-item flex items-center gap-4 px-3 py-3 rounded-full text-[#e7e9ea] text-[20px]">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
                </svg>
                <span>Benchmarks</span>
              </Link>
              <Link href="/dashboard" className="nav-item flex items-center gap-4 px-3 py-3 rounded-full text-[#e7e9ea] text-[20px]">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                </svg>
                <span>Dashboard</span>
              </Link>
              <Link href="/benchmarks/new" className="mt-4 flex items-center justify-center bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white font-medium text-[17px] rounded-full py-3 px-6 transition-colors duration-150">
                Run Benchmark
              </Link>
            </nav>
          </div>

          {currentUser ? (
            <Link href={`/u/${currentUser.handle}`} className="flex items-center gap-3 p-3 rounded-full hover:bg-white/[0.04] transition-colors duration-150">
              <Avatar handle={currentUser.handle} displayName={currentUser.display_name} size="md" />
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-bold text-[#e7e9ea] truncate">{currentUser.display_name}</p>
                <p className="text-[13px] text-[#8b8d93] truncate">@{currentUser.handle}</p>
              </div>
            </Link>
          ) : (
            <Link href="/login" className="flex items-center justify-center border border-white/[0.12] text-[#e7e9ea] font-medium text-[15px] rounded-full py-2.5 px-6 hover:bg-white/[0.04] transition-colors duration-150">
              Log in
            </Link>
          )}
        </aside>

        {/* Center Column */}
        <main className="w-full max-w-[600px] min-h-screen border-r border-[#2f3336]">
          {/* Header with back button */}
          <div className="sticky top-0 z-40 bg-[#000000]/80 backdrop-blur-xl border-b border-[#2f3336] px-4 py-2 flex items-center gap-6">
            <Link href="/feed" className="p-2 -ml-2 rounded-full hover:bg-white/[0.04] transition-colors duration-150">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e7e9ea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"/>
                <polyline points="12 19 5 12 12 5"/>
              </svg>
            </Link>
            <h1 className="text-[20px] font-medium text-[#e7e9ea]">Post</h1>
          </div>

          {/* Full post */}
          <article className="px-4 pt-3 pb-0" data-utrace-target={`post.detail.${postId}`}>
            {/* Author row */}
            <div className="flex items-center gap-3">
              <Avatar
                handle={post.author.handle}
                displayName={post.author.display_name}
                size="md"
              />
              <div>
                <p className="text-[15px] font-bold text-[#e7e9ea] leading-5">
                  {post.author.display_name}
                </p>
                <p className="text-[15px] text-[#8b8d93] leading-5">
                  @{post.author.handle}
                </p>
              </div>
            </div>

            {/* Post body - larger text on detail */}
            <p className="mt-3 text-[17px] text-[#e7e9ea] leading-[1.55] whitespace-pre-line">
              {post.body}
            </p>

            {/* Agent result badges */}
            {agentResults.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5" data-utrace-target={`post.detail.${postId}.agent-results`}>
                {agentResults.map((ar) => (
                  <AgentResultBadge
                    key={ar.agent_name}
                    agentName={ar.agent_name}
                    result={ar.result}
                  />
                ))}
              </div>
            )}

            {/* Timestamp */}
            {published && (
              <p className="mt-4 text-[15px] text-[#536471]">
                {new Date(published).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                {" · "}
                {new Date(published).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </p>
            )}

            {/* Views count */}
            <div className="mt-3 py-3 border-t border-[#2f3336]">
              <span className="text-[15px] font-bold text-[#e7e9ea] tabular-nums">{engagement.views}</span>
              <span className="text-[15px] text-[#536471]"> Views</span>
            </div>

            {/* Engagement stats bar */}
            <div className="py-3 border-t border-[#2f3336] flex gap-5">
              <span>
                <span className="text-[15px] font-bold text-[#e7e9ea] tabular-nums">{engagement.reposts}</span>
                <span className="text-[15px] text-[#536471]"> Reposts</span>
              </span>
              <span>
                <span className="text-[15px] font-bold text-[#e7e9ea] tabular-nums">{engagement.likes}</span>
                <span className="text-[15px] text-[#536471]"> Likes</span>
              </span>
              <span>
                <span className="text-[15px] font-bold text-[#e7e9ea] tabular-nums">{engagement.bookmarks}</span>
                <span className="text-[15px] text-[#536471]"> Bookmarks</span>
              </span>
            </div>

            {/* Action bar */}
            <div className="py-1 border-t border-[#2f3336] flex items-center justify-around">
              <button className="p-2 rounded-full action-comment transition-colors duration-150">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-[#536471]">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button className="p-2 rounded-full action-repost transition-colors duration-150">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-[#536471]">
                  <path d="M17 1l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3 11V9a4 4 0 0 1 4-4h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 23l-4-4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21 13v2a4 4 0 0 1-4 4H3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button className="p-2 rounded-full action-like transition-colors duration-150">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-[#536471]">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button className="p-2 rounded-full action-bookmark transition-colors duration-150">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-[#536471]">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button className="p-2 rounded-full action-share transition-colors duration-150">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-[#536471]">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="16,6 12,2 8,6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="12" y1="2" x2="12" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </article>

          {/* Reply input and comments */}
          <div className="border-t border-[#2f3336]" data-utrace-target={`post.detail.${postId}.comments`}>
            <CommentThread initialComments={commentsWithAuthor} postId={postId} />
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="hidden xl:block w-[350px] px-6 py-4 sticky top-0 h-screen overflow-y-auto">
          <div className="relative mb-4">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#536471" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Search Claudex"
              className="w-full bg-[#0e0f10] border border-white/[0.06] rounded-full pl-10 pr-4 py-2.5 text-[15px] text-[#e7e9ea] placeholder:text-[#536471] focus:bg-[#000000] focus:border-[#1d9bf0] transition-colors duration-150"
            />
          </div>

          <div className="bg-[#0e0f10] rounded-xl border border-white/[0.06] overflow-hidden mb-4">
            <h2 className="px-4 pt-3 pb-2 text-[20px] font-medium text-[#e7e9ea]">Trending Benchmarks</h2>
            <div className="hover:bg-white/[0.03] transition-colors duration-150 px-4 py-3 cursor-pointer">
              <p className="text-[13px] text-[#536471]">Coding Challenge</p>
              <p className="text-[15px] font-medium text-[#e7e9ea] mt-0.5">REST API Implementation</p>
              <p className="text-[13px] text-[#536471] mt-0.5">847 runs</p>
            </div>
            <div className="hover:bg-white/[0.03] transition-colors duration-150 px-4 py-3 cursor-pointer">
              <p className="text-[13px] text-[#536471]">Algorithm</p>
              <p className="text-[15px] font-medium text-[#e7e9ea] mt-0.5">Binary Tree Traversal</p>
              <p className="text-[13px] text-[#536471] mt-0.5">623 runs</p>
            </div>
            <Link href="/benchmarks/new" className="block px-4 py-3 text-[15px] text-[#1d9bf0] hover:bg-white/[0.03] transition-colors duration-150">
              Show more
            </Link>
          </div>

          <div className="mt-4 px-4 flex flex-wrap gap-x-3 gap-y-1 text-[13px] text-[#3d3f45]">
            <span>Terms of Service</span>
            <span>Privacy Policy</span>
            <span>&copy; 2026 Claudex</span>
          </div>
        </aside>
      </div>

      {/* Mobile bottom nav */}
      <nav className="mobile-bottom-nav sm:hidden">
        <div className="flex items-center justify-around py-2">
          <Link href="/" className="p-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e7e9ea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </Link>
          <Link href="/feed" className="p-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1d9bf0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </Link>
          <Link href="/benchmarks/new" className="p-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e7e9ea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
          </Link>
          <Link href="/dashboard" className="p-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e7e9ea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            </svg>
          </Link>
        </div>
      </nav>
    </div>
  );
}
