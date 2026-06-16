import Link from "next/link";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";
import { btnCls, type BtnCtx, type BtnVariant, type BtnSize } from "@/lib/btn";

/**
 * The single button primitive for the whole app.
 *
 * Styling is driven by the shared `btnCls` engine, so for any given
 * (ctx, variant, size, block) this renders the exact same classes the codebase
 * used before consolidation. It can render as a real <button> or, when `href`
 * is provided, as a Next.js <Link> — covering the landing-page CTAs too.
 *
 * Extras folded in from the old BusyBtn / ExportBtn / Btn helpers:
 *  - `busy`  → shows a spinner and disables the button
 *  - `icon`  → leading node (replaced by the spinner while busy)
 *  - `iconR` → trailing node
 */
type ButtonBaseProps = {
  ctx?: BtnCtx;
  variant?: BtnVariant;
  size?: BtnSize;
  block?: boolean;
  busy?: boolean;
  icon?: ReactNode;
  iconR?: ReactNode;
  className?: string;
  children?: ReactNode;
};

type ButtonAsButton = ButtonBaseProps & {
  href?: undefined;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonBaseProps>;

type ButtonAsLink = ButtonBaseProps & {
  href: string;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof ButtonBaseProps | "href">;

export type ButtonProps = ButtonAsButton | ButtonAsLink;

const Spinner = (
  <span className="w-4 h-4 rounded-full inline-block flex-none border-2 border-solid [border-top-color:currentColor] [border-right-color:color-mix(in_srgb,currentColor_35%,transparent)] [border-bottom-color:color-mix(in_srgb,currentColor_35%,transparent)] [border-left-color:color-mix(in_srgb,currentColor_35%,transparent)] animate-jm-spin" />
);

export function Button({
  ctx = "dash",
  variant,
  size,
  block,
  busy,
  icon,
  iconR,
  className,
  children,
  ...rest
}: ButtonProps) {
  const cls = [btnCls(ctx, variant, size, block), className]
    .filter(Boolean)
    .join(" ");

  const inner = (
    <>
      {busy ? Spinner : icon}
      {children}
      {iconR}
    </>
  );

  if ("href" in rest && rest.href != null) {
    const { href, ...anchor } = rest as ButtonAsLink;
    return (
      <Link href={href} className={cls} {...anchor}>
        {inner}
      </Link>
    );
  }

  const button = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button {...button} className={cls} disabled={busy || button.disabled}>
      {inner}
    </button>
  );
}
