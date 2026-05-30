"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { UTraceClient, parseBootstrapHash, clearBootstrapHash } from "@/lib/utrace/browser";
import { deriveRouteState } from "@/lib/utrace/route-state";

const UTraceContext = createContext<UTraceClient | null>(null);

export function useUTrace(): UTraceClient | null {
  return useContext(UTraceContext);
}

interface UTraceProviderProps {
  children: ReactNode;
}

export default function UTraceProvider({ children }: UTraceProviderProps) {
  const clientRef = useRef<UTraceClient | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_UTRACE_ENABLED !== "true") return;
    if (clientRef.current) return;

    const bootstrap = parseBootstrapHash();
    if (!bootstrap) return;

    clearBootstrapHash();

    const client = new UTraceClient(bootstrap);
    client.connect();
    clientRef.current = client;

    const routeState = deriveRouteState(window.location.pathname);
    client.observeRouteState(routeState);

    const handleError = (event: ErrorEvent) => {
      client.observeError(event.message, "window.onerror");
    };
    const handleRejection = (event: PromiseRejectionEvent) => {
      const msg = event.reason?.message ?? String(event.reason);
      client.observeError(msg, "unhandledrejection");
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
      client.destroy();
      clientRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!clientRef.current || !pathname) return;
    const routeState = deriveRouteState(pathname);
    clientRef.current.observeRouteState(routeState);
  }, [pathname]);

  return (
    <UTraceContext.Provider value={clientRef.current}>
      {children}
    </UTraceContext.Provider>
  );
}
