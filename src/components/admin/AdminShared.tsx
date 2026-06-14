"use client";

import { type ReactNode } from "react";
import { Icons } from "@/components/Icons";

export function EmptyCard({ children }: { children: ReactNode }) {
  return (
    <div className="bg-surface border border-line rounded-lg p-[56px_20px] text-center text-[var(--ink-3)] font-semibold">
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
      className="inline-flex items-center gap-[5px] py-[4px] px-[10px] rounded-pill text-[12px] font-bold whitespace-nowrap [color:var(--chip-c)] [background:var(--chip-bg)] [border:var(--chip-bd)]"
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

