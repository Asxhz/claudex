"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { UTraceClient, parseBootstrapHash, clearBootstrapHash } from "@/lib/utrace/browser";
import { deriveRouteState } from "@/lib/utrace/route-state";
import { collectDomSummary, collectAccessibilitySummary } from "@/lib/utrace/dom-summary";

const UTraceContext = createContext<UTraceClient | null>(null);

export function useUTrace(): UTraceClient | null {
  return useContext(UTraceContext);
}

interface UTraceProviderProps {
  children: ReactNode;
}

export default function UTraceProvider({ children }: UTraceProviderProps) {
  const [client, setClient] = useState<UTraceClient | null>(null);
  const clientRef = useRef<UTraceClient | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_UTRACE_ENABLED !== "true") return;
    if (clientRef.current) return;

    const bootstrap = parseBootstrapHash();
    if (!bootstrap) return;

    clearBootstrapHash();

    const instance = new UTraceClient(bootstrap);
    instance.connect();
    clientRef.current = instance;
    setClient(instance);

    requestAnimationFrame(() => {
      const routeState = deriveRouteState(window.location.pathname);
      const targets = instance.getRouteTargets(window.location.pathname);
      instance.sendTelemetryBundle({
        route_state: routeState,
        target_registry: targets,
        dom_summary: collectDomSummary(),
        accessibility_summary: collectAccessibilitySummary(),
        meaningful: true,
      });
    });

    const handleError = (event: ErrorEvent) => {
      instance.sendTelemetryEvent("error", {
        message: event.message.slice(0, 200),
        source: "window.onerror",
      });
    };
    const handleRejection = (event: PromiseRejectionEvent) => {
      const msg = event.reason?.message ?? String(event.reason);
      instance.sendTelemetryEvent("error", {
        message: msg.slice(0, 200),
        source: "unhandledrejection",
      });
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
      instance.destroy();
      clientRef.current = null;
      setClient(null);
    };
  }, []);

  useEffect(() => {
    if (!clientRef.current || !pathname) return;
    const routeState = deriveRouteState(pathname);
    const targets = clientRef.current.getRouteTargets(pathname);
    clientRef.current.sendTelemetryBundle({
      route_state: routeState,
      target_registry: targets,
      dom_summary: collectDomSummary(),
      accessibility_summary: collectAccessibilitySummary(),
      meaningful: true,
    });
  }, [pathname]);

  return (
    <UTraceContext.Provider value={client}>
      {children}
    </UTraceContext.Provider>
  );
}
