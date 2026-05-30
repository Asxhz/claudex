import Link from "next/link";
import type { User } from "@/types";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";

interface TopNavProps {
  user?: User | null;
}

export default function TopNav({ user }: TopNavProps) {
  return (
    <header className="fixed top-0 inset-x-0 z-50 h-14 bg-[#09090B]/80 backdrop-blur-xl border-b border-white/[0.06]">
      <nav className="h-full max-w-7xl mx-auto px-4 flex items-center justify-between">
        <Link href="/" className="text-[#6366F1] font-bold text-lg tracking-tight">
          Claudex
        </Link>

        <div className="flex items-center gap-6">
          <Link
            href="/feed"
            className="text-sm text-[rgba(244,244,245,0.62)] hover:text-[#F4F4F5] transition-colors"
          >
            Feed
          </Link>
          <Link
            href="/benchmarks"
            className="text-sm text-[rgba(244,244,245,0.62)] hover:text-[#F4F4F5] transition-colors"
          >
            Benchmarks
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <Link href={`/@${user.handle}`} className="flex items-center gap-2 group">
              <Avatar handle={user.handle} displayName={user.display_name} size="sm" />
              <span className="text-sm text-[rgba(244,244,245,0.62)] group-hover:text-[#F4F4F5] transition-colors">
                @{user.handle}
              </span>
            </Link>
          ) : (
            <Link href="/login">
              <Button variant="secondary">Login</Button>
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
