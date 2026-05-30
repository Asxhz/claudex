import type { NormalizedBenchmarkResult } from "./types";
import type { UTraceClient } from "./browser";

const DRAFT_STORAGE_KEY = "utrace_pre_publish_results";

export type AgentResult = {
  agent_name: string;
  result: string;
};

function normalize(results: AgentResult[]): NormalizedBenchmarkResult[] {
  return results.map((r, i) => ({
    agent: r.agent_name,
    rank: i + 1,
    outcome: r.result === "passed" ? "winner" as const
      : r.result === "failed" ? "loser" as const
      : "neutral" as const,
  }));
}

export function captureDraftResults(taskId: string, results: AgentResult[]): void {
  if (typeof sessionStorage === "undefined") return;
  const key = `${DRAFT_STORAGE_KEY}_${taskId}`;
  sessionStorage.setItem(key, JSON.stringify(results));
}

export function getDraftResults(taskId: string): AgentResult[] | null {
  if (typeof sessionStorage === "undefined") return null;
  const key = `${DRAFT_STORAGE_KEY}_${taskId}`;
  const stored = sessionStorage.getItem(key);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as AgentResult[];
  } catch {
    return null;
  }
}

export function emitLabelAssertion(
  client: UTraceClient,
  postId: string,
  taskId: string,
  draftResults: AgentResult[],
  renderedResults: AgentResult[]
): void {
  client.assertState({
    kind: "benchmark_result_label_consistency",
    target_id: `feed.post-card.${postId}.agent-results`,
    expected: {
      source: "pre_publish_draft",
      results: normalize(draftResults),
    },
    actual: {
      source: "feed_render",
      results: normalize(renderedResults),
    },
    task_id: taskId,
    post_id: postId,
  });
}
