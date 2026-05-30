import Link from "next/link";
import type { User } from "@/types";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";

interface TopNavProps {
  user?: User | null;
}

export default function TopNav({ user }: TopNavProps) {
  return (
    <header className="fixed top-0 inset-x-0 z-50 h-12 bg-[#000000]/80 backdrop-blur-xl border-b border-white/[0.04] feed-hide-nav">
      <nav className="h-full max-w-5xl mx-auto px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-[15px] font-bold text-[#e7e9ea] tracking-tight group-hover:text-[#1d9bf0] transition-colors duration-150">
            Claudex
          </span>
        </Link>

        <div className="flex items-center gap-1">
          <Link
            href="/feed"
            className="rounded-full px-3 py-1.5 text-sm text-[#8b8d93] hover:text-[#e7e9ea] hover:bg-white/[0.04] transition-colors duration-150"
          >
            Feed
          </Link>
          <Link
            href="/dashboard"
            className="rounded-full px-3 py-1.5 text-sm text-[#8b8d93] hover:text-[#e7e9ea] hover:bg-white/[0.04] transition-colors duration-150"
          >
            Dashboard
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <Link href={`/u/${user.handle}`} className="flex items-center gap-2 group">
              <Avatar handle={user.handle} displayName={user.display_name} size="sm" />
              <span className="hidden sm:inline text-sm text-[#8b8d93] group-hover:text-[#e7e9ea] transition-colors duration-150">
                @{user.handle}
              </span>
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" className="text-xs">Log in</Button>
              </Link>
              <Link href="/signup">
                <Button variant="primary" className="text-xs !rounded-full">Sign up</Button>
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
