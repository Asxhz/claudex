import type { UTraceClient } from "./browser";

export function observePublishApi(
  client: UTraceClient,
  taskId: string,
  status: number
): void {
  client.observeApiResult({
    method: "POST",
    route_template: "/api/posts/[taskId]/publish",
    status_code: status,
    summary: `Published benchmark post for task ${taskId}`,
  });
}

export function observeFeedApi(
  client: UTraceClient,
  status: number
): void {
  client.observeApiResult({
    method: "GET",
    route_template: "/api/feed",
    status_code: status,
    summary: "Fetched feed posts",
  });
}

export function observePostDetailApi(
  client: UTraceClient,
  postId: string,
  status: number
): void {
  client.observeApiResult({
    method: "GET",
    route_template: "/api/feed/[postId]",
    status_code: status,
    summary: `Fetched post detail ${postId}`,
  });
}

export function observeCommentApi(
  client: UTraceClient,
  postId: string,
  status: number
): void {
  client.observeApiResult({
    method: "POST",
    route_template: "/api/feed/[postId]/comments",
    status_code: status,
    summary: `Submitted comment on post ${postId}`,
  });
}
