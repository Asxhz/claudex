export interface UTraceBootstrap {
  ws_url: string;
  session_id: string;
  preview_id: string;
  client_id: string;
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

export type UTraceMessage =
  | { type: "route_state"; payload: RouteState; timestamp: string }
  | { type: "target_registry"; payload: TargetEntry[]; timestamp: string }
  | { type: "interaction"; payload: InteractionEvent; timestamp: string }
  | { type: "api_observation"; payload: ApiObservation; timestamp: string }
  | { type: "state_assertion_observed"; payload: StateAssertion & { matched: boolean }; timestamp: string }
  | { type: "error"; payload: { message: string; stack_hash: string; source: string }; timestamp: string }
  | { type: "dom_summary"; payload: Record<string, unknown>; timestamp: string }
  | { type: "heartbeat"; payload: { uptime_ms: number }; timestamp: string };
