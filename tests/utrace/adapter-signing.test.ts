import { createHmac } from "crypto";

type Assert = (condition: boolean, name: string) => void;

export async function testAdapterSigning(assert: Assert) {
  const secret = "test-adapter-secret-12345";
  const origSecret = process.env.UTRACE_ADAPTER_SECRET;
  process.env.UTRACE_ADAPTER_SECRET = secret;

  const { validateAdapterAuth } = require("../../src/lib/utrace/adapter-auth");

  const body = { session_id: "s_test", preview_id: "p_test", external_user_id: "user_theo" };
  const purpose = "seed-session-user";
  const expiresAt = String(Math.floor(Date.now() / 1000) + 300);
  const nonce = "nonce_" + Date.now();

  function canonicalJson(obj: unknown): string {
    if (obj === null || typeof obj !== "object") return JSON.stringify(obj);
    if (Array.isArray(obj)) return "[" + obj.map(canonicalJson).join(",") + "]";
    const sorted = Object.keys(obj as Record<string, unknown>).sort();
    const entries = sorted.map(
      (k) => JSON.stringify(k) + ":" + canonicalJson((obj as Record<string, unknown>)[k])
    );
    return "{" + entries.join(",") + "}";
  }

  const canonical = canonicalJson(body);
  const message = `${purpose}.${expiresAt}.${nonce}.${canonical}`;
  const signature = createHmac("sha256", secret).update(message).digest("hex");

  // Test: valid signature verifies
  const headers = new Headers({
    "x-utrace-purpose": purpose,
    "x-utrace-expires-at": expiresAt,
    "x-utrace-nonce": nonce,
    "x-utrace-seed-signature": signature,
    "x-utrace-client-id": "test-client",
    "x-utrace-session-id": "s_test",
  });

  try {
    const result = await validateAdapterAuth(headers, body);
    assert(result.purpose === purpose, "valid signature verifies successfully");
  } catch {
    assert(false, "valid signature verifies successfully");
  }

  // Test: reordered JSON body with same keys verifies
  const reorderedBody = { preview_id: "p_test", external_user_id: "user_theo", session_id: "s_test" };
  const nonce2 = "nonce2_" + Date.now();
  const canonical2 = canonicalJson(reorderedBody);
  const message2 = `${purpose}.${expiresAt}.${nonce2}.${canonical2}`;
  const sig2 = createHmac("sha256", secret).update(message2).digest("hex");

  const headers2 = new Headers({
    "x-utrace-purpose": purpose,
    "x-utrace-expires-at": expiresAt,
    "x-utrace-nonce": nonce2,
    "x-utrace-seed-signature": sig2,
    "x-utrace-client-id": "test-client",
    "x-utrace-session-id": "s_test",
  });

  try {
    await validateAdapterAuth(headers2, reorderedBody);
    assert(true, "reordered JSON body with same canonical form verifies");
  } catch {
    assert(false, "reordered JSON body with same canonical form verifies");
  }

  // Test: changed payload fails
  const tamperedBody = { ...body, external_user_id: "user_evil" };
  const nonce3 = "nonce3_" + Date.now();
  const headers3 = new Headers({
    "x-utrace-purpose": purpose,
    "x-utrace-expires-at": expiresAt,
    "x-utrace-nonce": nonce3,
    "x-utrace-seed-signature": signature,
    "x-utrace-client-id": "test-client",
    "x-utrace-session-id": "s_test",
  });

  try {
    await validateAdapterAuth(headers3, tamperedBody);
    assert(false, "tampered payload is rejected");
  } catch {
    assert(true, "tampered payload is rejected");
  }

  // Test: expired timestamp fails
  const expiredAt = String(Math.floor(Date.now() / 1000) - 100);
  const nonce4 = "nonce4_" + Date.now();
  const msg4 = `${purpose}.${expiredAt}.${nonce4}.${canonical}`;
  const sig4 = createHmac("sha256", secret).update(msg4).digest("hex");

  const headers4 = new Headers({
    "x-utrace-purpose": purpose,
    "x-utrace-expires-at": expiredAt,
    "x-utrace-nonce": nonce4,
    "x-utrace-seed-signature": sig4,
  });

  try {
    await validateAdapterAuth(headers4, body);
    assert(false, "expired timestamp is rejected");
  } catch {
    assert(true, "expired timestamp is rejected");
  }

  // Test: missing signature fails
  const headers5 = new Headers({
    "x-utrace-purpose": purpose,
    "x-utrace-expires-at": expiresAt,
    "x-utrace-nonce": "nonce5_" + Date.now(),
  });

  try {
    await validateAdapterAuth(headers5, body);
    assert(false, "missing signature is rejected");
  } catch {
    assert(true, "missing signature is rejected");
  }

  process.env.UTRACE_ADAPTER_SECRET = origSecret;
}
