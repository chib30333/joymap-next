// Tailwind class builder for the button system, replacing the legacy
// `.btn`/`.btn-*` rules that were scoped per portal in globals.css.
// Each portal context reproduces that context's exact computed styles:
//   lp   = landing (.lp)        auth = auth screen (.auth-wrap)
//   app  = customer (.app-top)  dash = provider/admin dashboards (.jmdash)
export type BtnCtx = "lp" | "auth" | "app" | "dash";
export type BtnVariant =
  | "primary"
  | "ghost"
  | "soft"
  | "light"
  | "glass"
  | "orange";
export type BtnSize = "lg" | "md" | "sm";

const COMMON =
  "inline-flex items-center justify-center font-bold rounded-pill whitespace-nowrap leading-none cursor-pointer [transition:0.16s] active:[transform:translateY(1px)_scale(0.99)]";

const GAP: Record<BtnCtx, string> = {
  lp: "gap-[9px]",
  auth: "gap-[9px]",
  app: "gap-[9px]",
  dash: "gap-2",
};

function fontSize(ctx: BtnCtx, size?: BtnSize) {
  const m: Record<BtnCtx, Partial<Record<BtnSize | "_", string>>> = {
    lp: { _: "text-[15px]" },
    auth: { _: "text-[14.5px]", lg: "text-[15.5px]" },
    app: { _: "text-[14.5px]", lg: "text-[15.5px]", sm: "text-[13.5px]" },
    dash: { _: "text-[14px]", lg: "text-[15px]", sm: "text-[13px]" },
  };
  return (size && m[ctx][size]) || m[ctx]._ || "";
}

function padding(ctx: BtnCtx, size?: BtnSize) {
  if (ctx === "lp") return "py-[14px] px-[26px]";
  const m: Record<string, Partial<Record<BtnSize, string>>> = {
    auth: { lg: "py-[15px] px-[26px]" },
    app: {
      lg: "py-[15px] px-[26px]",
      md: "py-[11px] px-[20px]",
      sm: "py-[8px] px-[15px]",
    },
    dash: {
      lg: "py-[14px] px-[24px]",
      md: "py-[10px] px-[18px]",
      sm: "py-[8px] px-[14px]",
    },
  };
  return (size && m[ctx]?.[size]) || "";
}

const VARIANT: Record<BtnCtx, Partial<Record<BtnVariant, string>>> = {
  lp: {
    primary:
      "bg-coral text-white shadow-coral hover:bg-coral-deep hover:[transform:translateY(-2px)] hover:shadow-[0_14px_32px_rgba(224,33,47,0.42)]",
    light:
      "bg-white text-[#241016] hover:[transform:translateY(-2px)] hover:shadow-[0_14px_32px_rgba(0,0,0,0.18)]",
    glass:
      "bg-white/[0.14] text-white backdrop-blur-[6px] border border-white/25 hover:bg-white/[0.24]",
    ghost: "bg-surface text-ink border border-line-2 hover:border-ink-3",
  },
  auth: {
    primary:
      "bg-coral text-white shadow-coral enabled:hover:bg-coral-deep enabled:hover:[transform:translateY(-1px)] enabled:hover:shadow-[0_12px_30px_rgba(224,33,47,0.42)] disabled:cursor-not-allowed",
  },
  app: {
    primary:
      "bg-coral text-white shadow-coral hover:bg-coral-deep hover:shadow-[0_12px_30px_rgba(240,83,45,0.4)] hover:[transform:translateY(-1px)]",
    ghost:
      "bg-surface text-ink border border-line-2 hover:border-ink-3 hover:bg-surface-2",
    soft: "bg-[color-mix(in_srgb,var(--red)_16%,transparent)] text-coral hover:bg-[color-mix(in_srgb,var(--red)_26%,transparent)]",
  },
  dash: {
    primary:
      "bg-coral text-white shadow-coral hover:bg-coral-deep hover:[transform:translateY(-1px)]",
    orange: "bg-orange text-[#1a0a04] hover:bg-orange-deep",
    ghost:
      "bg-surface text-ink border border-line-2 hover:border-ink-3 hover:bg-surface-2",
    soft: "bg-[color-mix(in_srgb,var(--red)_14%,transparent)] text-coral hover:bg-[color-mix(in_srgb,var(--red)_24%,transparent)]",
  },
};

export function btnCls(
  ctx: BtnCtx,
  variant?: BtnVariant,
  size?: BtnSize,
  block?: boolean,
) {
  return [
    COMMON,
    GAP[ctx],
    padding(ctx, size),
    fontSize(ctx, size),
    (variant && VARIANT[ctx][variant]) || "",
    block ? "w-full" : "",
  ]
    .filter(Boolean)
    .join(" ");
}
