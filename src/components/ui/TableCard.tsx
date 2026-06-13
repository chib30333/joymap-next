import { type ReactNode, type CSSProperties } from "react";

export function TableCard({
  scroll,
  style,
  children,
}: {
  scroll?: boolean;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <div
      className="bg-surface border border-line rounded-lg"
      style={{ overflow: "hidden", ...style }}
    >
      {scroll ? <div style={{ overflowX: "auto" }}>{children}</div> : children}
    </div>
  );
}
