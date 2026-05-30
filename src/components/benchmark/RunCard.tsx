import type { BenchmarkRun } from "@/types";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";

function normalizeResult(result: string): "passed" | "failed" | "partial" {
  if (result === "passed" || result === "failed" || result === "partial") return result;
  return "partial";
}

interface RunCardProps {
  run: BenchmarkRun;
}

export default function RunCard({ run }: RunCardProps) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#F4F4F5] truncate">{run.agent_name}</p>
          {run.agent_model && (
            <p className="text-xs text-[rgba(244,244,245,0.40)] mt-0.5">{run.agent_model}</p>
          )}
        </div>
        <Badge result={normalizeResult(run.result)} />
      </div>

      <p className="mt-3 text-sm text-[rgba(244,244,245,0.62)] leading-relaxed">
        {run.explanation}
      </p>

      {(run.duration_ms != null || run.tokens_used != null) && (
        <div className="mt-4 flex items-center gap-4 text-xs text-[rgba(244,244,245,0.40)]">
          {run.duration_ms != null && (
            <span>{(run.duration_ms / 1000).toFixed(1)}s</span>
          )}
          {run.tokens_used != null && (
            <span>{run.tokens_used.toLocaleString()} tokens</span>
          )}
        </div>
      )}
    </Card>
  );
}
