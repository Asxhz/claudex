import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";

interface AgentResultCardProps {
  agentName: string;
  agentModel?: string;
  result: string;
  explanation: string;
  durationMs?: number;
  tokensUsed?: number;
}

function normalizeResult(result: string): "passed" | "failed" | "partial" {
  if (result === "passed" || result === "failed" || result === "partial") return result;
  return "partial";
}

export default function AgentResultCard({
  agentName,
  agentModel,
  result,
  explanation,
  durationMs,
  tokensUsed,
}: AgentResultCardProps) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-[#e7e9ea] truncate">{agentName}</p>
          {agentModel && (
            <p className="text-xs text-[#536471] mt-0.5">{agentModel}</p>
          )}
        </div>
        <Badge result={normalizeResult(result)} />
      </div>

      <p className="mt-3 text-sm text-[#8b8d93] leading-relaxed">{explanation}</p>

      {(durationMs != null || tokensUsed != null) && (
        <div className="mt-4 flex items-center gap-4 text-xs text-[#536471]">
          {durationMs != null && (
            <span>{(durationMs / 1000).toFixed(1)}s</span>
          )}
          {tokensUsed != null && (
            <span>{tokensUsed.toLocaleString()} tokens</span>
          )}
        </div>
      )}
    </Card>
  );
}
