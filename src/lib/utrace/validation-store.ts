export type TokenEntry = {
  sessionId: string;
  previewId: string;
  clientId: string;
  expiresAt: Date;
};

export const tokenStore = new Map<string, TokenEntry>();
