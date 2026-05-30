const dotColors = {
  passed: "bg-[#22C55E]",
  failed: "bg-[#EF4444]",
  partial: "bg-[#EAB308]",
} as const;

const textColors = {
  passed: "text-[#22C55E]",
  failed: "text-[#EF4444]",
  partial: "text-[#EAB308]",
} as const;

interface AgentResultBadgeProps {
  agentName: string;
  result: "passed" | "failed" | "partial";
}

export default function AgentResultBadge({ agentName, result }: AgentResultBadgeProps) {
  return (
    <div className="inline-flex items-center gap-2 border border-white/[0.08] rounded-lg px-3 py-2">
      <span className="text-sm font-medium text-[#F4F4F5]">{agentName}</span>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColors[result]}`} />
      <span className={`text-xs font-medium capitalize ${textColors[result]}`}>{result}</span>
    </div>
  );
}
