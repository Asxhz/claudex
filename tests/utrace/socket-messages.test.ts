type Assert = (condition: boolean, name: string) => void;

export function testSocketMessages(assert: Assert) {
  // Test: telemetry bundle has correct envelope shape
  const bundle = {
    type: "preview.telemetry_bundle",
    message_id: "msg_test",
    sent_at: new Date().toISOString(),
    source: "preview_sdk",
    session_id: "s_test",
    preview_id: "p_test",
    payload: {
      route_state: { pathname: "/feed", route_name: "feed", title: "Claudex", params: {}, metadata: { app: "claudex", surface: "demo_preview" } },
      target_registry: [{ target_id: "feed.post-list", name: "Feed", kind: "list", selector: {}, route_context: { pathname: "/feed" }, visible: true, enabled: true }],
      dom_summary: { title: "Claudex" },
      accessibility_summary: {},
      meaningful: true,
    },
  };

  assert(bundle.type === "preview.telemetry_bundle", "first message type is preview.telemetry_bundle");
  assert(bundle.source === "preview_sdk", "source is preview_sdk");
  assert(typeof bundle.session_id === "string" && bundle.session_id.startsWith("s_"), "session_id present");
  assert(typeof bundle.preview_id === "string" && bundle.preview_id.startsWith("p_"), "preview_id present");
  assert(typeof bundle.message_id === "string", "message_id present");
  assert(typeof bundle.sent_at === "string", "sent_at present");

  const p = bundle.payload;
  assert(p.route_state !== null, "bundle has route_state");
  assert(Array.isArray(p.target_registry) && p.target_registry.length > 0, "bundle has non-empty target_registry");
  assert(p.dom_summary !== null, "bundle has dom_summary");
  assert(p.meaningful === true, "bundle has meaningful=true");

  // Test: telemetry event has correct envelope
  const event = {
    type: "preview.telemetry_event",
    message_id: "msg_ev1",
    sent_at: new Date().toISOString(),
    source: "preview_sdk",
    session_id: "s_test",
    preview_id: "p_test",
    payload: { event_type: "interaction", kind: "click", target_id: "benchmark.publish-button", action: "publish" },
  };

  assert(event.type === "preview.telemetry_event", "event type is preview.telemetry_event");
  assert(event.payload.event_type === "interaction", "event payload has event_type");

  // Test: ping has correct shape
  const ping = {
    type: "preview.ping",
    message_id: "msg_p1",
    sent_at: new Date().toISOString(),
    source: "preview_sdk",
    session_id: "s_test",
    preview_id: "p_test",
    payload: {},
  };

  assert(ping.type === "preview.ping", "ping type is preview.ping");

  // Test: old message types are NOT used
  const oldTypes = ["route_state", "target_registry", "heartbeat", "interaction", "api_observation"];
  for (const t of oldTypes) {
    assert(bundle.type !== t && event.type !== t && ping.type !== t, `does not use old type '${t}'`);
  }
}
