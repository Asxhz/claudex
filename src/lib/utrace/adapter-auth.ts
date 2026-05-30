import { createHmac, timingSafeEqual } from "crypto";

export type AdapterAuthResult = {
  clientId: string;
  sessionId: string;
  purpose: string;
};

const seenNonces = new Set<string>();

export async function validateAdapterAuth(
  headers: Headers,
  body: Record<string, unknown>
): Promise<AdapterAuthResult> {
  const sandboxMode = process.env.UTRACE_SANDBOX_MODE;
  if (sandboxMode !== "true") {
    throw new AdapterAuthError("Sandbox mode is not enabled", 403);
  }

  const clientId = headers.get("x-utrace-client-id");
  const sessionId = headers.get("x-utrace-session-id");
  const purpose = headers.get("x-utrace-purpose");
  const expiresAt = headers.get("x-utrace-expires-at");
  const nonce = headers.get("x-utrace-nonce");
  const signature = headers.get("x-utrace-seed-signature");

  if (!clientId || !sessionId || !purpose || !expiresAt || !nonce || !signature) {
    throw new AdapterAuthError("Missing required adapter headers", 400);
  }

  const expiry = new Date(expiresAt);
  if (isNaN(expiry.getTime()) || expiry < new Date()) {
    throw new AdapterAuthError("Request has expired", 401);
  }

  if (seenNonces.has(nonce)) {
    throw new AdapterAuthError("Nonce already used", 401);
  }

  const secret = process.env.UTRACE_SANDBOX_ADAPTER_SHARED_SECRET;
  if (!secret) {
    throw new AdapterAuthError("Adapter secret not configured", 500);
  }

  const canonicalBody = JSON.stringify(body, Object.keys(body).sort());
  const payload = `${purpose}${expiresAt}${nonce}${canonicalBody}`;
  const expectedSignature = createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  const sigBuf = Buffer.from(signature, "hex");
  const expectedBuf = Buffer.from(expectedSignature, "hex");
  if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
    throw new AdapterAuthError("Invalid signature", 401);
  }

  seenNonces.add(nonce);

  return { clientId, sessionId, purpose };
}

export class AdapterAuthError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AdapterAuthError";
    this.status = status;
  }
}
