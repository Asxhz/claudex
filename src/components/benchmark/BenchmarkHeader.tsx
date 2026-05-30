import type { BenchmarkTask, User } from "@/types";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";

const difficultyColors: Record<string, string> = {
  easy: "text-[#22C55E] bg-[rgba(34,197,94,0.10)]",
  medium: "text-[#EAB308] bg-[rgba(234,179,8,0.10)]",
  hard: "text-[#EF4444] bg-[rgba(239,68,68,0.10)]",
};

interface BenchmarkHeaderProps {
  task: BenchmarkTask;
  author: User;
}

export default function BenchmarkHeader({ task, author }: BenchmarkHeaderProps) {
  const difficultyStyle =
    task.difficulty && difficultyColors[task.difficulty.toLowerCase()]
      ? difficultyColors[task.difficulty.toLowerCase()]
      : "text-[rgba(244,244,245,0.62)] bg-white/[0.06]";

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#F4F4F5] tracking-tight">{task.title}</h1>

      <p className="mt-3 text-sm text-[rgba(244,244,245,0.62)] leading-relaxed">
        {task.description}
      </p>

      <div className="mt-4 flex items-center gap-3">
        <Avatar handle={author.handle} displayName={author.display_name} size="sm" />
        <div>
          <span className="text-sm font-medium text-[#F4F4F5]">{author.display_name}</span>
          <span className="ml-2 text-sm text-[rgba(244,244,245,0.40)]">@{author.handle}</span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {task.difficulty && (
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${difficultyStyle}`}
          >
            {task.difficulty}
          </span>
        )}
        {task.tags?.map((tag) => (
          <span
            key={tag}
            className="rounded-full px-2.5 py-0.5 text-xs font-medium text-[rgba(244,244,245,0.62)] bg-white/[0.06]"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
