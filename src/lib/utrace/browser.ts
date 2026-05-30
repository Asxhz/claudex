import type {
  UTraceBootstrap,
  PreviewMessage,
  TelemetryBundlePayload,
  TargetEntry,
} from "./types";
import { deriveRouteTargets } from "./targets";

let msgCounter = 0;
function nextMessageId(): string {
  return `msg_${Date.now().toString(36)}_${(++msgCounter).toString(36)}`;
}

export class UTraceClient {
  private ws: WebSocket | null = null;
  private bootstrap: UTraceBootstrap;
  private queue: string[] = [];
  private pingTimer: ReturnType<typeof setInterval> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private destroyed = false;

  constructor(bootstrap: UTraceBootstrap) {
    this.bootstrap = bootstrap;
  }

  connect(): void {
    if (this.destroyed) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_UTRACE_API_URL || "https://api.utrace.dev";
      const base = new URL(apiUrl);
      const wsProtocol = base.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${wsProtocol}//${base.host}${this.bootstrap.websocketPath}`;

      this.ws = new WebSocket(wsUrl, this.bootstrap.previewSocketToken);

      this.ws.onopen = () => {
        for (const msg of this.queue) {
          this.ws?.send(msg);
        }
        this.queue = [];

        this.pingTimer = setInterval(() => {
          this.sendRaw({
            type: "preview.ping",
            message_id: nextMessageId(),
            sent_at: new Date().toISOString(),
            source: "preview_sdk",
            session_id: this.bootstrap.sessionId,
            preview_id: this.bootstrap.previewId,
            payload: {},
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

  private sendRaw(message: PreviewMessage): void {
    const serialized = JSON.stringify(message);
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(serialized);
    } else {
      this.queue.push(serialized);
    }
  }

  private clearTimers(): void {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  sendTelemetryBundle(payload: TelemetryBundlePayload): void {
    this.sendRaw({
      type: "preview.telemetry_bundle",
      message_id: nextMessageId(),
      sent_at: new Date().toISOString(),
      source: "preview_sdk",
      session_id: this.bootstrap.sessionId,
      preview_id: this.bootstrap.previewId,
      payload,
    });
  }

  sendTelemetryEvent(eventType: string, payload: Record<string, unknown>): void {
    this.sendRaw({
      type: "preview.telemetry_event",
      message_id: nextMessageId(),
      sent_at: new Date().toISOString(),
      source: "preview_sdk",
      session_id: this.bootstrap.sessionId,
      preview_id: this.bootstrap.previewId,
      payload: { event_type: eventType, ...payload },
    });
  }

  observeInteraction(event: { kind: string; target_id: string; action: string; metadata?: Record<string, unknown> }): void {
    this.sendTelemetryEvent("interaction", event);
  }

  observeApiResult(observation: { method: string; route_template: string; status_code: number; summary: string }): void {
    this.sendTelemetryEvent("api_observation", observation);
  }

  assertState(assertion: Record<string, unknown>): void {
    const expected = assertion.expected as { results: unknown[] } | undefined;
    const actual = assertion.actual as { results: unknown[] } | undefined;
    const matched = JSON.stringify(expected?.results) === JSON.stringify(actual?.results);
    this.sendTelemetryEvent("state_assertion_observed", { ...assertion, matched });
  }

  getRouteTargets(pathname: string): TargetEntry[] {
    return deriveRouteTargets(pathname);
  }

  destroy(): void {
    this.destroyed = true;
    this.clearTimers();
    this.ws?.close();
    this.ws = null;
    this.queue = [];
  }
}

const TRUSTED_HOSTS = [
  "api.utrace.dev",
  "ws.utrace.dev",
  "preview.utrace.dev",
  "localhost",
  "127.0.0.1",
];

export function parseBootstrapHash(): UTraceBootstrap | null {
  if (typeof window === "undefined") return null;

  const hash = window.location.hash;
  const prefix = "#utracePreviewBootstrap=";
  if (!hash.startsWith(prefix)) return null;

  try {
    const encoded = hash.slice(prefix.length);
    const decoded = atob(encoded);
    const parsed = JSON.parse(decoded);

    if (!parsed.sessionId || !parsed.previewId || !parsed.websocketPath || !parsed.previewSocketToken) {
      return null;
    }

    const apiUrl = process.env.NEXT_PUBLIC_UTRACE_API_URL || "https://api.utrace.dev";
    try {
      const base = new URL(apiUrl);
      if (!TRUSTED_HOSTS.includes(base.hostname)) return null;
    } catch {
      return null;
    }

    return parsed as UTraceBootstrap;
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
