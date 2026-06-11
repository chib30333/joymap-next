export function latency(ms?: number) {
  const base = Number(process.env.API_LATENCY_MS ?? 450);
  const wait = ms ?? base;
  if (!wait) return Promise.resolve();
  return new Promise<void>((r) => setTimeout(r, wait));
}
