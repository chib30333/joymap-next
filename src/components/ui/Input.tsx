import { forwardRef } from "react";
import { clsx } from "@/lib/cx";

// Shared input skin (surface, border colour, focus ring) used by every
// variant. `field` layers on the standard text-field box; `bare` leaves
// sizing/layout to the caller (e.g. the OTP digit boxes in CodeInput).
const SKIN =
  "bg-surface text-ink rounded-sm border-line-2 outline-none duration-150 focus:border-coral focus:shadow-[0_0_0_3px_var(--coral-soft)]";
const FIELD =
  "w-full px-4 py-3.5 border text-base [.auth-wrap_&]:placeholder:text-ink-3 [.jmdash_&]:px-3.5 [.jmdash_&]:py-3 [.jmdash_&]:text-sm";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  variant?: "field" | "bare";
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { variant = "field", className, ...p },
  ref,
) {
  return (
    <input
      ref={ref}
      {...p}
      className={clsx(SKIN, variant === "field" && FIELD, className)}
    />
  );
});
