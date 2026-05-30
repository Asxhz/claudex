type Assert = (condition: boolean, name: string) => void;

export function testBootstrap(assert: Assert) {
  // Simulate browser globals for testing
  const origWindow = globalThis.window;
  const origProcess = process.env.NEXT_PUBLIC_UTRACE_API_URL;

  // Valid uTrace bootstrap payload
  const validPayload = {
    version: 1,
    sessionId: "s_test123",
    previewId: "p_test456",
    websocketPath: "/ws/preview/p_test456",
    previewSocketToken: "tok_abc",
    expiresAt: "2099-01-01T00:00:00Z",
  };

  const encoded = Buffer.from(JSON.stringify(validPayload)).toString("base64");

  // Test: parses uTrace's actual bootstrap shape
  process.env.NEXT_PUBLIC_UTRACE_API_URL = "https://api.utrace.dev";
  (globalThis as Record<string, unknown>).window = {
    location: {
      hash: `#utracePreviewBootstrap=${encoded}`,
      pathname: "/",
      search: "",
    },
  };

  // Dynamic import to pick up the mocked globals
  const { parseBootstrapHash } = require("../../src/lib/utrace/browser");

  const result = parseBootstrapHash();
  assert(result !== null, "accepts valid uTrace bootstrap payload");
  assert(result?.sessionId === "s_test123", "parses sessionId correctly");
  assert(result?.previewId === "p_test456", "parses previewId correctly");
  assert(result?.websocketPath === "/ws/preview/p_test456", "parses websocketPath correctly");
  assert(result?.previewSocketToken === "tok_abc", "parses previewSocketToken correctly");

  // Test: rejects old ws_url-style bootstrap
  const oldPayload = {
    ws_url: "wss://evil.example.com/ws",
    session_id: "s_123",
    preview_id: "p_456",
    client_id: "test",
  };
  const oldEncoded = Buffer.from(JSON.stringify(oldPayload)).toString("base64");
  (globalThis as Record<string, unknown>).window = {
    location: {
      hash: `#utracePreviewBootstrap=${oldEncoded}`,
      pathname: "/",
      search: "",
    },
  };
  const oldResult = parseBootstrapHash();
  assert(oldResult === null, "rejects old ws_url-style bootstrap");

  // Test: rejects malformed bootstrap
  (globalThis as Record<string, unknown>).window = {
    location: {
      hash: "#utracePreviewBootstrap=not-valid-base64!!!",
      pathname: "/",
      search: "",
    },
  };
  const malformed = parseBootstrapHash();
  assert(malformed === null, "rejects malformed base64");

  // Test: returns null when no hash present
  (globalThis as Record<string, unknown>).window = {
    location: {
      hash: "",
      pathname: "/",
      search: "",
    },
  };
  const noHash = parseBootstrapHash();
  assert(noHash === null, "returns null when no bootstrap hash");

  // Test: rejects untrusted API URL
  process.env.NEXT_PUBLIC_UTRACE_API_URL = "https://evil.example.com";
  (globalThis as Record<string, unknown>).window = {
    location: {
      hash: `#utracePreviewBootstrap=${encoded}`,
      pathname: "/",
      search: "",
    },
  };
  const untrusted = parseBootstrapHash();
  assert(untrusted === null, "rejects untrusted API URL origin");

  // Cleanup
  if (origWindow === undefined) {
    delete (globalThis as Record<string, unknown>).window;
  } else {
    (globalThis as Record<string, unknown>).window = origWindow;
  }
  process.env.NEXT_PUBLIC_UTRACE_API_URL = origProcess;
}
