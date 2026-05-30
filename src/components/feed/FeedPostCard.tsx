import Link from "next/link";
import type { FeedPost, User } from "@/types";
import { timeAgo } from "@/lib/utils";
import Avatar from "@/components/ui/Avatar";
import AgentResultBadge from "@/components/feed/AgentResultBadge";

interface FeedPostCardProps {
  post: FeedPost & { author: User };
}

export default function FeedPostCard({ post }: FeedPostCardProps) {
  const published = post.published_at ?? post.created_at;

  return (
    <Link href={`/feed/${post.id}`} className="block">
      <article className="px-4 py-5 border-b border-white/[0.08] hover:bg-white/[0.02] transition-colors">
        <div className="flex items-start gap-3">
          <Avatar
            handle={post.author.handle}
            displayName={post.author.display_name}
            size="md"
          />

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-[#F4F4F5]">
                {post.author.display_name}
              </span>
              <span className="text-sm text-[rgba(244,244,245,0.40)]">
                @{post.author.handle}
              </span>
              {published && (
                <>
                  <span className="text-[rgba(244,244,245,0.40)]">&middot;</span>
                  <span className="text-sm text-[rgba(244,244,245,0.40)]">
                    {timeAgo(new Date(published))}
                  </span>
                </>
              )}
            </div>

            <p className="mt-2 text-sm text-[rgba(244,244,245,0.62)] leading-relaxed whitespace-pre-line">
              {post.body}
            </p>

            {post.agent_results.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {post.agent_results.map((ar) => (
                  <AgentResultBadge
                    key={ar.agent_name}
                    agentName={ar.agent_name}
                    result={ar.result}
                  />
                ))}
              </div>
            )}

            <div className="mt-3">
              <span className="text-xs text-[rgba(244,244,245,0.40)] hover:text-[rgba(244,244,245,0.62)] transition-colors">
                Comments
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
