"use client";

import { type ReactNode } from "react";
import { Icons } from "@/components/Icons";

export function EmptyCard({ children }: { children: ReactNode }) {
  return (
    <div
      className="bg-surface border border-line rounded-lg"
      style={{
        padding: "56px 20px",
        textAlign: "center",
        color: "var(--ink-3)",
        fontWeight: 600,
      }}
    >
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
      className="inline-flex items-center gap-[5px] py-[4px] px-[10px] rounded-pill text-[12px] font-bold whitespace-nowrap"
      style={{ color, background: bg, border }}
    >
      {children}
    </span>
  );
}

