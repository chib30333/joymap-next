import { type ReactNode } from "react";

export function TableCard({
  scroll,
  className,
  children,
}: {
  scroll?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={[
        "bg-surface border border-line rounded-lg overflow-hidden",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {scroll ? <div className="overflow-x-auto">{children}</div> : children}
    </div>
  );
}
