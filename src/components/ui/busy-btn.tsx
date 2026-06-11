import { type ButtonHTMLAttributes, type ReactNode } from "react";

export function BusyBtn({
  busy,
  children,
  icon,
  className = "btn btn-primary btn-md",
  disabled,
  ...p
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  busy?: boolean;
  icon?: ReactNode;
}) {
  return (
    <button className={className} disabled={busy || disabled} {...p}>
      {busy ? <span className="jm-spin" /> : icon}
      {children}
    </button>
  );
}
