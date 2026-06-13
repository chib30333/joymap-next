import { type ButtonHTMLAttributes, type ReactNode } from "react";
import { btnCls } from "@/lib/btn";

export function BusyBtn({
  busy,
  children,
  icon,
  className = btnCls("dash", "primary", "md"),
  disabled,
  ...p
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  busy?: boolean;
  icon?: ReactNode;
}) {
  return (
    <button className={className} disabled={busy || disabled} {...p}>
      {busy ? <span className="w-[17px] h-[17px] rounded-full inline-block flex-none border-[2.5px] border-solid [border-top-color:currentColor] [border-right-color:color-mix(in_srgb,currentColor_35%,transparent)] [border-bottom-color:color-mix(in_srgb,currentColor_35%,transparent)] [border-left-color:color-mix(in_srgb,currentColor_35%,transparent)] animate-jm-spin" /> : icon}
      {children}
    </button>
  );
}
