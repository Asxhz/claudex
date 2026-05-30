"use client";

import { useState } from "react";
import type { User } from "@/types";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

interface ProductLinkCardProps {
  user: User;
  state: string;
  callbackUrl: string;
}

export default function ProductLinkCard({ user, state, callbackUrl }: ProductLinkCardProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleConnect() {
    if (status === "loading") return;

    setStatus("loading");
    setErrorMessage(null);

    try {
      const res = await fetch(callbackUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          handle: user.handle,
          state,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Connection failed");
      }

      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <Card className="max-w-md mx-auto">
      <div className="flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-xl bg-[rgba(99,102,241,0.10)] flex items-center justify-center mb-4">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#6366F1"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
        </div>

        <h3 className="text-base font-semibold text-[#F4F4F5]">Connect Claudex to uTrace</h3>
        <p className="mt-1 text-sm text-[rgba(244,244,245,0.40)]">
          Link your account to enable tracing and analytics
        </p>

        <div className="mt-5 flex items-center gap-3 rounded-lg border border-white/[0.08] px-4 py-3 w-full">
          <Avatar handle={user.handle} displayName={user.display_name} size="sm" />
          <div className="text-left min-w-0">
            <p className="text-sm font-medium text-[#F4F4F5] truncate">{user.display_name}</p>
            <p className="text-xs text-[rgba(244,244,245,0.40)]">@{user.handle}</p>
          </div>
        </div>

        {status === "success" ? (
          <div className="mt-5 w-full rounded-lg bg-[rgba(34,197,94,0.10)] px-4 py-3">
            <p className="text-sm font-medium text-[#22C55E]">Connected successfully</p>
          </div>
        ) : (
          <>
            <Button
              className="mt-5 w-full"
              onClick={handleConnect}
              disabled={status === "loading"}
            >
              {status === "loading" ? "Connecting..." : "Connect"}
            </Button>

            {status === "error" && errorMessage && (
              <p className="mt-3 text-xs text-[#EF4444]">{errorMessage}</p>
            )}
          </>
        )}
      </div>
    </Card>
  );
}
