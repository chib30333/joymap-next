"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { clsx } from "@/lib/cx";

export function Reveal({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={clsx(
        "opacity-0 translate-y-5 [transition:opacity_0.7s_cubic-bezier(0.22,1,0.36,1),transform_0.7s_cubic-bezier(0.22,1,0.36,1)] [&.in]:opacity-100 [&.in]:translate-y-0 motion-reduce:opacity-100 motion-reduce:translate-y-0",
        className,
      )}
      id={id}
      data-reveal
    >
      {children}
    </div>
  );
}
