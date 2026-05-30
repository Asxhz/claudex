import type { RouteState } from "./types";

const ROUTE_MAP: Array<{ pattern: RegExp; name: string; paramKeys: string[] }> = [
  { pattern: /^\/benchmarks\/([^/]+)\/publish$/, name: "benchmark_publish", paramKeys: ["taskId"] },
  { pattern: /^\/benchmarks\/([^/]+)$/, name: "benchmark_task", paramKeys: ["taskId"] },
  { pattern: /^\/benchmarks\/new$/, name: "benchmark_new", paramKeys: [] },
  { pattern: /^\/feed\/([^/]+)$/, name: "post_detail", paramKeys: ["postId"] },
  { pattern: /^\/feed$/, name: "feed", paramKeys: [] },
  { pattern: /^\/dashboard$/, name: "dashboard", paramKeys: [] },
  { pattern: /^\/u\/([^/]+)$/, name: "profile", paramKeys: ["handle"] },
  { pattern: /^\/login$/, name: "auth", paramKeys: [] },
  { pattern: /^\/signup$/, name: "auth", paramKeys: [] },
  { pattern: /^\/$/, name: "landing", paramKeys: [] },
];

export function deriveRouteState(pathname: string): RouteState {
  const params: Record<string, string> = {};
  let routeName: string | null = null;

  for (const { pattern, name, paramKeys } of ROUTE_MAP) {
    const match = pathname.match(pattern);
    if (match) {
      routeName = name;
      paramKeys.forEach((key, i) => {
        if (match[i + 1]) params[key] = match[i + 1];
      });
      break;
    }
  }

  return {
    pathname,
    route_name: routeName,
    title: typeof document !== "undefined" ? document.title : "",
    params,
    metadata: { app: "claudex", surface: "demo_preview" },
  };
}
