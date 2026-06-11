// Input — single-line text-entry primitive. Renders the design's `.field` class
// (scoped per portal) so every form across the three portals looks and behaves
// identically. Forwards all native props; merge extra classes via `className`.
// Replaces the hand-rolled `<input className="field">` in feature code (guideline 02).
import { clsx } from "@/lib/cx";

export function Input({ className, ...p }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...p} className={clsx("field", className)} />;
}
