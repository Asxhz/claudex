import type {
  UTraceBootstrap,
  UTraceMessage,
  RouteState,
  TargetEntry,
  InteractionEvent,
  ApiObservation,
  StateAssertion,
} from "./types";

export class UTraceClient {
  private ws: WebSocket | null = null;
  private bootstrap: UTraceBootstrap;
  private queue: string[] = [];
  private startTime = Date.now();
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private destroyed = false;

  constructor(bootstrap: UTraceBootstrap) {
    this.bootstrap = bootstrap;
  }

  connect(): void {
    if (this.destroyed) return;

    try {
      const url = new URL(this.bootstrap.ws_url);
      url.searchParams.set("session_id", this.bootstrap.session_id);
      url.searchParams.set("preview_id", this.bootstrap.preview_id);
      url.searchParams.set("client_id", this.bootstrap.client_id);

      this.ws = new WebSocket(url.toString());

      this.ws.onopen = () => {
        for (const msg of this.queue) {
          this.ws?.send(msg);
        }
        this.queue = [];

        this.heartbeatTimer = setInterval(() => {
          this.send({
            type: "heartbeat",
            payload: { uptime_ms: Date.now() - this.startTime },
            timestamp: new Date().toISOString(),
          });
        }, 15_000);
      };

      this.ws.onclose = () => {
        this.clearTimers();
        if (!this.destroyed) {
          this.reconnectTimer = setTimeout(() => this.connect(), 3000);
        }
      };

      this.ws.onerror = () => {
        this.ws?.close();
      };
    } catch {
      // malformed URL — silently fail
    }
  }

  private send(message: UTraceMessage): void {
    const serialized = JSON.stringify(message);
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(serialized);
    } else {
      this.queue.push(serialized);
    }
  }

  private clearTimers(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  observeRouteState(state: RouteState): void {
    this.send({
      type: "route_state",
      payload: state,
      timestamp: new Date().toISOString(),
    });
  }

  registerTargets(targets: TargetEntry[]): void {
    this.send({
      type: "target_registry",
      payload: targets,
      timestamp: new Date().toISOString(),
    });
  }

  observeInteraction(event: InteractionEvent): void {
    this.send({
      type: "interaction",
      payload: event,
      timestamp: new Date().toISOString(),
    });
  }

  observeApiResult(observation: ApiObservation): void {
    this.send({
      type: "api_observation",
      payload: observation,
      timestamp: new Date().toISOString(),
    });
  }

  assertState(assertion: StateAssertion): void {
    const matched =
      JSON.stringify(assertion.expected.results) ===
      JSON.stringify(assertion.actual.results);

    this.send({
      type: "state_assertion_observed",
      payload: { ...assertion, matched },
      timestamp: new Date().toISOString(),
    });
  }

  observeError(message: string, source: string): void {
    let hash = 0;
    for (let i = 0; i < message.length; i++) {
      hash = (hash << 5) - hash + message.charCodeAt(i);
      hash |= 0;
    }
    this.send({
      type: "error",
      payload: {
        message: message.slice(0, 200),
        stack_hash: Math.abs(hash).toString(16),
        source,
      },
      timestamp: new Date().toISOString(),
    });
  }

  destroy(): void {
    this.destroyed = true;
    this.clearTimers();
    this.ws?.close();
    this.ws = null;
    this.queue = [];
  }
}

export function parseBootstrapHash(): UTraceBootstrap | null {
  if (typeof window === "undefined") return null;

  const hash = window.location.hash;
  const prefix = "#utracePreviewBootstrap=";
  if (!hash.startsWith(prefix)) return null;

  try {
    const encoded = hash.slice(prefix.length);
    const decoded = atob(encoded);
    const parsed = JSON.parse(decoded) as UTraceBootstrap;

    if (!parsed.ws_url || !parsed.session_id || !parsed.preview_id) {
      return null;
    }

    const TRUSTED_HOSTS = [
      "api.utrace.dev",
      "ws.utrace.dev",
      "preview.utrace.dev",
      "localhost",
      "127.0.0.1",
    ];

    try {
      const wsUrl = new URL(parsed.ws_url);
      if (!["wss:", "ws:"].includes(wsUrl.protocol)) return null;
      if (wsUrl.protocol === "ws:" && wsUrl.hostname !== "localhost" && wsUrl.hostname !== "127.0.0.1") return null;
      if (!TRUSTED_HOSTS.includes(wsUrl.hostname)) return null;
    } catch {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function clearBootstrapHash(): void {
  if (typeof window === "undefined") return;
  if (window.location.hash.startsWith("#utracePreviewBootstrap=")) {
    history.replaceState(null, "", window.location.pathname + window.location.search);
  }
}
