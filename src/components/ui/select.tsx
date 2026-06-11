// Select — dropdown primitive. Renders the design's `.field` class (scoped per
// portal). Forwards all native props; compose <option>s as children.
// Replaces hand-rolled `<select className="field">` in feature code (guideline 02).
import { clsx } from "@/lib/cx";

export function Select({ className, children, ...p }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...p} className={clsx("field", className)}>
      {children}
    </select>
  );
}
