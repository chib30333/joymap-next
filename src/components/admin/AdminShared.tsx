"use client";

import { type ReactNode } from "react";
import { Icons } from "@/components/Icons";

export function EmptyCard({ children }: { children: ReactNode }) {
  return (
    <div className="bg-surface border border-line rounded-lg px-5 py-14 text-center text-[var(--ink-3)] font-semibold">
      {children}
    </div>
  );
}

export function EmptyState({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="text-center p-16 text-ink-3">
      <Icons.checkCirc size={40} />
      <h3 className="text-ink mt-3">{title}</h3>
      <p>{children}</p>
    </div>
  );
}

export function Chip({
  color,
  bg,
  border,
  children,
}: {
  color?: string;
  bg?: string;
  border?: string;
  children: ReactNode;
}) {
  return (
    <span
      className="inline-flex items-center gap-1 py-1 px-2.5 rounded-pill text-xs font-bold whitespace-nowrap [color:var(--chip-c)] [background:var(--chip-bg)] [border:var(--chip-bd)]"
      style={
        {
          "--chip-c": color,
          "--chip-bg": bg,
          "--chip-bd": border,
        } as React.CSSProperties
      }
    >
      {children}
    </span>
  );
}

