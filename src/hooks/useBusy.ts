"use client";

import { useState, useCallback } from "react";

export function useBusy() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const run = useCallback(
    (p: Promise<any> | (() => Promise<any>), onDone?: (r: any) => void) => {
      setBusy(true);
      setError(null);
      Promise.resolve(typeof p === "function" ? p() : p)
        .then((r) => {
          setBusy(false);
          onDone?.(r);
        })
        .catch((e) => {
          setBusy(false);
          setError(e.message || String(e));
        });
    },
    [],
  );
  return { busy, run, error, setError };
}
