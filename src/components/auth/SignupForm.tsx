"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";

export default function SignupForm() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [handle, setHandle] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          display_name: displayName,
          handle,
          email,
          password,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Signup failed");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="bg-[#0e0f10] border border-[#2f3336] rounded-lg p-6">
        <h2 className="text-lg font-medium text-[#e7e9ea]">Create your account</h2>
        <p className="mt-1 text-sm text-[#536471]">
          Join Claudex and start benchmarking
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="signup-name" className="block text-sm font-medium text-[#8b8d93] mb-1.5">
              Display name
            </label>
            <input
              id="signup-name"
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-lg border border-[#2f3336] bg-black px-3 py-2 text-sm text-[#e7e9ea] placeholder:text-[#536471] focus:outline-none focus:border-[#1d9bf0]/50 transition-colors duration-150"
              placeholder="Jane Doe"
            />
          </div>

          <div>
            <label htmlFor="signup-handle" className="block text-sm font-medium text-[#8b8d93] mb-1.5">
              Handle
            </label>
            <input
              id="signup-handle"
              type="text"
              required
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              className="w-full rounded-lg border border-[#2f3336] bg-black px-3 py-2 text-sm text-[#e7e9ea] placeholder:text-[#536471] focus:outline-none focus:border-[#1d9bf0]/50 transition-colors duration-150"
              placeholder="janedoe"
            />
          </div>

          <div>
            <label htmlFor="signup-email" className="block text-sm font-medium text-[#8b8d93] mb-1.5">
              Email
            </label>
            <input
              id="signup-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-[#2f3336] bg-black px-3 py-2 text-sm text-[#e7e9ea] placeholder:text-[#536471] focus:outline-none focus:border-[#1d9bf0]/50 transition-colors duration-150"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="signup-password" className="block text-sm font-medium text-[#8b8d93] mb-1.5">
              Password
            </label>
            <input
              id="signup-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-[#2f3336] bg-black px-3 py-2 text-sm text-[#e7e9ea] placeholder:text-[#536471] focus:outline-none focus:border-[#1d9bf0]/50 transition-colors duration-150"
              placeholder="********"
            />
          </div>

          {error && <p className="text-xs text-[#EF4444]">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Creating account...
              </>
            ) : (
              "Sign up"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
