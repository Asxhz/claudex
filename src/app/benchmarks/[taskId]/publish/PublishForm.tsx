"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { BenchmarkTask, BenchmarkRun } from "@/types";
import RunCard from "@/components/benchmark/RunCard";
import BarChart from "@/components/benchmark/BarChart";
import Button from "@/components/ui/Button";
import { useUTrace } from "@/components/UTraceProvider";
import { benchmarkTargets } from "@/lib/utrace/targets";
import { observePublishApi } from "@/lib/utrace/api-observations";
import { captureDraftResults } from "@/lib/utrace/assertions";
import { deriveRouteState } from "@/lib/utrace/route-state";
import { collectDomSummary, collectAccessibilitySummary } from "@/lib/utrace/dom-summary";

const resultColor: Record<string, string> = {
  passed: "#22C55E",
  failed: "#EF4444",
  partial: "#EAB308",
};

interface PublishFormProps {
  taskId: string;
  task: BenchmarkTask;
  runs: BenchmarkRun[];
  draftBody: string;
}

export default function PublishForm({
  taskId,
  task,
  runs,
  draftBody,
}: PublishFormProps) {
  const router = useRouter();
  const utrace = useUTrace();

  useEffect(() => {
    if (!utrace) return;
    const agents = runs.map((r) => r.agent_name);
    const pathname = window.location.pathname;
    utrace.sendTelemetryBundle({
      route_state: deriveRouteState(pathname),
      target_registry: benchmarkTargets(pathname, taskId, agents),
      dom_summary: collectDomSummary(),
      accessibility_summary: collectAccessibilitySummary(),
      meaningful: true,
    });
    captureDraftResults(taskId, runs.map((r) => ({ agent_name: r.agent_name, result: r.result })));
  }, [utrace, taskId, runs]);

  const [body, setBody] = useState(
    draftBody ||
      `Benchmark results for "${task.title}"\n\n${runs
        .map((r) => `${r.agent_name}: ${r.result}`)
        .join("\n")}`
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const barChartItems = runs.map((run) => ({
    label: run.agent_name,
    value: (run.duration_ms ?? 0) / 1000,
    maxValue: Math.max(...runs.map((r) => r.duration_ms ?? 0)) / 1000,
    color: resultColor[run.result] || "#EAB308",
  }));

  async function handlePublish(e: React.SyntheticEvent) {
    e.preventDefault();
    if (loading || !body.trim()) return;

    setLoading(true);
    setError(null);

    try {
      utrace?.observeInteraction({
        kind: "click",
        target_id: "benchmark.publish-button",
        action: "publish_benchmark_post",
        metadata: { task_id: taskId, source_route: "benchmark_publish" },
      });

      const res = await fetch(`/api/posts/${taskId}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: body.trim() }),
      });

      if (utrace) observePublishApi(utrace, taskId, res.status);

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Failed to publish");
      }

      const data = await res.json();
      router.push(`/feed/${data.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Page header */}
      <div className="animate-fade-in">
        <h1 className="text-2xl font-medium text-[#e7e9ea] tracking-tight">
          Publish to Feed
        </h1>
        <p className="mt-2 text-sm text-[#536471]">
          Preview and publish your benchmark results for &ldquo;{task.title}
          &rdquo;
        </p>
      </div>

      {/* Chart Preview */}
      {runs.length > 0 && (
        <div className="mt-6 bg-[#0e0f10] border border-white/[0.04] rounded-lg p-5 animate-fade-in stagger-1">
          <h2 className="text-xs font-medium uppercase tracking-wider text-[#8b8d93] mb-3">
            Chart Preview
          </h2>
          <BarChart items={barChartItems} unit="s" />
          <div className="mt-3 flex items-center gap-4 justify-center">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
              <span className="text-[10px] text-[#536471]">
                Passed
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
              <span className="text-[10px] text-[#536471]">
                Failed
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#EAB308]" />
              <span className="text-[10px] text-[#536471]">
                Partial
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Feed Post Preview */}
      <div className="mt-6 animate-fade-in stagger-2">
        <h2 className="text-xs font-medium uppercase tracking-wider text-[#8b8d93] mb-3">
          Post Preview
        </h2>
        <div className="bg-[#0e0f10] border border-white/[0.04] rounded-lg p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-[#1d9bf0] flex items-center justify-center text-xs font-bold text-white">
              Y
            </div>
            <div>
              <span className="text-sm font-medium text-[#e7e9ea]">You</span>
              <span className="ml-2 text-xs text-[#3d3f45]">
                just now
              </span>
            </div>
          </div>
          <p className="text-sm text-[#8b8d93] leading-relaxed whitespace-pre-line">
            {body || "Your post body will appear here..."}
          </p>
          {runs.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {runs.map((run) => {
                const color = resultColor[run.result] || "#EAB308";
                return (
                  <span
                    key={run.id}
                    className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium"
                    style={{
                      color,
                      backgroundColor: `${color}15`,
                      borderColor: `${color}30`,
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    {run.agent_name}: {run.result}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Agent Results */}
      {runs.length > 0 && (
        <div className="mt-6 animate-fade-in stagger-3" data-utrace-target="benchmark.draft-results">
          <h2 className="text-xs font-medium uppercase tracking-wider text-[#8b8d93] mb-3">
            Agent Results
          </h2>
          <div className="grid gap-4">
            {runs.map((run) => (
              <div key={run.id} data-utrace-target={`benchmark.draft-result-row.${run.agent_name}`}>
                <RunCard run={run} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Publish Form */}
      <form
        onSubmit={handlePublish}
        className="mt-8 animate-fade-in stagger-4"
      >
        <label
          htmlFor="publish-body"
          className="block text-sm font-medium text-[#8b8d93] mb-1.5"
        >
          Post body
        </label>
        <textarea
          id="publish-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={8}
          className="w-full resize-none rounded-lg border border-white/[0.06] bg-[#000000] px-4 py-3 text-sm text-[#e7e9ea] placeholder:text-[#536471] focus:outline-none focus:border-[#1d9bf0]/50 transition-colors duration-150"
          placeholder="Write about your benchmark results..."
        />

        {/* Warning */}
        <div className="mt-3 flex items-start gap-2 rounded-lg bg-[rgba(234,179,8,0.06)] border border-[rgba(234,179,8,0.12)] px-3 py-2.5">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#EAB308"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mt-0.5 shrink-0"
          >
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          <p className="text-xs text-[rgba(234,179,8,0.8)]">
            This will be visible to all users once published.
          </p>
        </div>

        {error && (
          <p className="mt-3 text-xs text-[#EF4444] flex items-center gap-1.5">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            {error}
          </p>
        )}

        <div className="mt-5 flex items-center gap-3">
          <Button type="submit" disabled={loading || !body.trim()} data-utrace-target="benchmark.publish-button">
            {loading ? (
              <>
                <svg
                  className="animate-spin mr-1.5 h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Publishing...
              </>
            ) : (
              <>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-1.5"
                >
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                  <polyline points="16,6 12,2 8,6" />
                  <line x1="12" y1="2" x2="12" y2="15" />
                </svg>
                Publish to Feed
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
