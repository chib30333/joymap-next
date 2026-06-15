"use client";

import { Icons } from "@/components/Icons";
import { useT } from "@/components/Language";

type BannerVariant = {
  containerBg: string;
  containerBorder: string;
  iconBg: string;
  iconColor: string;
};

const BANNER_VARIANTS: Record<"rejected" | "review", BannerVariant> = {
  rejected: {
    containerBg: "color-mix(in srgb,#E0212F 8%,var(--surface))",
    containerBorder: "color-mix(in srgb,#E0212F 35%,transparent)",
    iconBg: "rgba(224,33,47,.14)",
    iconColor: "#E0212F",
  },
  review: {
    containerBg: "color-mix(in srgb,#E89015 9%,var(--surface))",
    containerBorder: "color-mix(in srgb,#E89015 35%,transparent)",
    iconBg: "rgba(232,144,21,.16)",
    iconColor: "#E89015",
  },
};

export function ProviderBanner({
  status,
  rejectReason,
}: {
  status: string;
  rejectReason?: string | null;
}) {
  const t = useT();
  const rejected = status === "rejected";
  const variant = rejected ? BANNER_VARIANTS.rejected : BANNER_VARIANTS.review;
  return (
    <div
      className="border rounded-lg m-0 mb-[var(--gap)] py-[14px] px-[18px] flex gap-[13px] items-center [background:var(--bg)] [border-color:var(--bc)]"
      style={
        {
          ["--bg"]: variant.containerBg,
          ["--bc"]: variant.containerBorder,
        } as React.CSSProperties
      }
    >
      <span
        className="w-[38px] h-[38px] rounded-[11px] flex-none grid place-items-center [background:var(--bg)] [color:var(--c)]"
        style={
          {
            ["--bg"]: variant.iconBg,
            ["--c"]: variant.iconColor,
          } as React.CSSProperties
        }
      >
        {rejected ? <Icons.close size={19} /> : <Icons.clock size={19} />}
      </span>
      <div className="flex-1 min-w-0">
        <div className="font-extrabold text-[14.5px]">
          {rejected ? t("Application rejected") : t("Application under review")}
        </div>
        <div className="text-[13px] text-ink-2 font-semibold">
          {rejected
            ? (rejectReason || t("Requirements not met")) +
              t(" — contact support to re-apply.")
            : t(
                "The platform team is verifying your documents. You can prepare services & schedule meanwhile — they go live once you’re approved.",
              )}
        </div>
      </div>
    </div>
  );
}
