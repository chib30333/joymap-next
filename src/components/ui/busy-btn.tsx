// BusyBtn — the CSS-class busy button used inside the ported design markup.
// Distinct from `Button` (Tailwind) by design: this one resolves to the design's
// `.btn .btn-<variant> .btn-<size>` classes for pixel-fidelity inside the portals,
// and is the single shared copy (previously duplicated verbatim in the customer and
// dash primitive files — see guideline 02). Renders a spinner while `busy`.
import { type ButtonHTMLAttributes, type ReactNode } from "react";

export function BusyBtn({ busy, children, icon, className = "btn btn-primary btn-md", disabled, ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { busy?: boolean; icon?: ReactNode }) {
  return <button className={className} disabled={busy || disabled} {...p}>{busy ? <span className="jm-spin" /> : icon}{children}</button>;
}
