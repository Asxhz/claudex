export interface UTraceBootstrap {
  version: number;
  sessionId: string;
  previewId: string;
  websocketPath: string;
  previewSocketToken: string;
  expiresAt: string;
}

export interface RouteState {
  pathname: string;
  route_name: string | null;
  title: string;
  params: Record<string, string>;
  metadata: { app: string; surface: string };
}

export interface TargetSelector {
  test_id?: string;
  css?: string;
  role?: string;
  name?: string;
  text?: string;
  metadata?: Record<string, unknown>;
}

export interface TargetEntry {
  target_id: string;
  name: string;
  kind: string;
  selector: TargetSelector;
  route_context: {
    pathname: string;
    route_name?: string;
    params?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
  };
  visible: boolean;
  enabled: boolean;
}

export interface InteractionEvent {
  kind: "click" | "submit" | "navigate" | string;
  target_id: string;
  action: string;
  metadata?: Record<string, unknown>;
}

export interface ApiObservation {
  method: string;
  route_template: string;
  status_code: number;
  summary: string;
}

export interface NormalizedBenchmarkResult {
  agent: string;
  rank?: number;
  outcome?: "winner" | "loser" | "neutral";
  score?: number | null;
}

export interface StateAssertion {
  kind: string;
  target_id: string;
  expected: {
    source: string;
    results: NormalizedBenchmarkResult[];
  };
  actual: {
    source: string;
    results: NormalizedBenchmarkResult[];
  };
  metadata?: Record<string, unknown>;
}

export interface TelemetryBundlePayload {
  route_state: RouteState | null;
  target_registry: TargetEntry[];
  dom_summary: Record<string, unknown> | null;
  accessibility_summary: Record<string, unknown> | null;
  meaningful: boolean;
}

export interface PreviewMessage {
  type: string;
  message_id: string;
  sent_at: string;
  source: "preview_sdk";
  session_id: string;
  preview_id: string;
  payload: unknown;
}
