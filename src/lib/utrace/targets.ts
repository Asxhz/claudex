import type { TargetEntry } from "./types";

function target(
  id: string,
  name: string,
  kind: string,
  pathname: string,
  routeName?: string,
  params?: Record<string, unknown>,
  opts?: { visible?: boolean; enabled?: boolean }
): TargetEntry {
  return {
    target_id: id,
    name,
    kind,
    selector: { test_id: id },
    route_context: { pathname, route_name: routeName, params },
    visible: opts?.visible ?? true,
    enabled: opts?.enabled ?? true,
  };
}

export function benchmarkTargets(
  pathname: string,
  taskId: string,
  agents: string[]
): TargetEntry[] {
  const targets: TargetEntry[] = [
    target("benchmark.draft-results", "Draft Results", "list", pathname, "benchmark_publish", { taskId }),
    target("benchmark.publish-button", "Publish Button", "button", pathname, "benchmark_publish", { taskId }),
  ];

  for (const agent of agents) {
    targets.push(
      target(
        `benchmark.draft-result-row.${agent}`,
        `${agent} Result`,
        "result_row",
        pathname,
        "benchmark_publish",
        { taskId, agent }
      )
    );
  }

  return targets;
}

export function feedTargets(
  pathname: string,
  posts: Array<{ id: string; agents: string[] }>
): TargetEntry[] {
  const targets: TargetEntry[] = [
    target("feed.post-list", "Feed Post List", "list", pathname, "feed"),
  ];

  for (const post of posts) {
    targets.push(
      target(`feed.post-card.${post.id}`, "Post Card", "card", pathname, "feed", { postId: post.id })
    );
    targets.push(
      target(`feed.post-card.${post.id}.agent-results`, "Agent Results", "list", pathname, "feed", { postId: post.id })
    );
    for (const agent of post.agents) {
      targets.push(
        target(
          `feed.post-card.${post.id}.agent-result-row.${agent}`,
          `${agent} Result`,
          "result_row",
          pathname,
          "feed",
          { postId: post.id, agent }
        )
      );
    }
  }

  return targets;
}

export function postDetailTargets(
  pathname: string,
  postId: string,
  agents: string[]
): TargetEntry[] {
  const targets: TargetEntry[] = [
    target(`post.detail.${postId}`, "Post Detail", "card", pathname, "post_detail", { postId }),
    target(`post.detail.${postId}.agent-results`, "Agent Results", "list", pathname, "post_detail", { postId }),
    target(`post.detail.${postId}.comment-composer`, "Comment Composer", "form", pathname, "post_detail", { postId }),
    target(`post.detail.${postId}.comment-submit`, "Submit Comment", "button", pathname, "post_detail", { postId }),
  ];

  for (const agent of agents) {
    targets.push(
      target(
        `post.detail.${postId}.agent-result-row.${agent}`,
        `${agent} Result`,
        "result_row",
        pathname,
        "post_detail",
        { postId, agent }
      )
    );
  }

  return targets;
}

export function authTargets(pathname: string): TargetEntry[] {
  return [
    target("auth.sign-in-form", "Sign In Form", "form", pathname, "auth"),
    target("auth.email-input", "Email Input", "form", pathname, "auth"),
    target("auth.submit-button", "Submit Button", "button", pathname, "auth"),
  ];
}

export function dashboardTargets(pathname: string): TargetEntry[] {
  return [
    target("profile.current-user", "Current User", "card", pathname, "dashboard"),
  ];
}

export function deriveRouteTargets(pathname: string): TargetEntry[] {
  const benchmarkPublish = pathname.match(/^\/benchmarks\/([^/]+)\/publish$/);
  if (benchmarkPublish) {
    return benchmarkTargets(pathname, benchmarkPublish[1], []);
  }

  if (pathname === "/feed") {
    return [target("feed.post-list", "Feed Post List", "list", pathname, "feed")];
  }

  const postDetail = pathname.match(/^\/feed\/([^/]+)$/);
  if (postDetail) {
    return postDetailTargets(pathname, postDetail[1], []);
  }

  if (pathname === "/login" || pathname === "/signup") {
    return authTargets(pathname);
  }

  if (pathname === "/dashboard") {
    return dashboardTargets(pathname);
  }

  return [];
}
