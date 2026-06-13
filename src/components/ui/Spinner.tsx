import { type CSSProperties } from "react";

export function Spinner({ style }: { style?: CSSProperties }) {
  return (
    <span
      className="w-[17px] h-[17px] rounded-full inline-block flex-none border-[2.5px] border-solid [border-top-color:currentColor] [border-right-color:color-mix(in_srgb,currentColor_35%,transparent)] [border-bottom-color:color-mix(in_srgb,currentColor_35%,transparent)] [border-left-color:color-mix(in_srgb,currentColor_35%,transparent)] animate-jm-spin"
      style={{ color: "var(--ink-3)", ...style }}
    />
  );
}
