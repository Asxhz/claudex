const styles = {
  passed: "text-[#22C55E] bg-[rgba(34,197,94,0.10)]",
  failed: "text-[#EF4444] bg-[rgba(239,68,68,0.10)]",
  partial: "text-[#EAB308] bg-[rgba(234,179,8,0.10)]",
} as const;

const labels = {
  passed: "Passed",
  failed: "Failed",
  partial: "Partial",
} as const;

interface BadgeProps {
  result: "passed" | "failed" | "partial";
}

export default function Badge({ result }: BadgeProps) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[result]}`}>
      {labels[result]}
    </span>
  );
}
