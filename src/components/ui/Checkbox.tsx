"use client";

import { Icons } from "@/components/Icons";
import { clsx } from "@/lib/cx";

// Custom checkbox: a visually-hidden native input drives an adjacent styled
// box via Tailwind's `peer-checked:` so the control stays accessible while
// matching the app's look. `align` flips center vs top alignment for
// single-line vs multi-line labels.
export function Checkbox({
  checked,
  onChange,
  children,
  align = "center",
  className,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children?: React.ReactNode;
  align?: "center" | "start";
  className?: string;
}) {
  return (
    <label
      className={clsx(
        "flex gap-2 text-sm font-semibold text-ink-2 cursor-pointer",
        align === "start" ? "items-start" : "items-center",
        className,
      )}
    >
      <input
        type="checkbox"
        className="peer absolute opacity-0 w-0 h-0"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="w-5 h-5 mt-px rounded-md border-2 border-line-2 grid place-items-center text-white flex-none duration-150 peer-checked:bg-coral peer-checked:border-coral [&_svg]:opacity-0 [&_svg]:duration-150 peer-checked:[&_svg]:opacity-100">
        <Icons.check size={12} />
      </span>
      {children}
    </label>
  );
}
