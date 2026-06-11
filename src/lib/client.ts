"use client";
// Thin client wrapper for the RPC gateway. Throws on error with the server
// message so components can surface it (like the prototype's useBusy()).
export async function rpc<T = any>(action: string, args?: any): Promise<T> {
  const res = await fetch("/api/rpc", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, args }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || `Request failed (${res.status})`);
  return json.data as T;
}

import { useState, useCallback } from "react";

// Mirrors the prototype's useBusy(): [busy, run, error, setError].
export function useBusy() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const run = useCallback((p: Promise<any> | (() => Promise<any>), onDone?: (r: any) => void) => {
    setBusy(true);
    setError(null);
    Promise.resolve(typeof p === "function" ? p() : p)
      .then((r) => { setBusy(false); onDone?.(r); })
      .catch((e) => { setBusy(false); setError(e.message || String(e)); });
  }, []);
  return { busy, run, error, setError };
}
