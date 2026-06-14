"use client";

import { Icons } from "@/components/Icons";
import { useT } from "@/components/Language";

export function ProviderBanner({
  status,
  rejectReason,
}: {
  status: string;
  rejectReason?: string | null;
}) {
  const t = useT();
  const rejected = status === "rejected";
  return (
    <div
      className="border rounded-lg m-0 mb-[var(--gap)] py-[14px] px-[18px] flex gap-[13px] items-center [background:var(--bg)] [border-color:var(--bc)]"
      style={
        {
          ["--bg"]: rejected
            ? "color-mix(in srgb,#E0212F 8%,var(--surface))"
            : "color-mix(in srgb,#E89015 9%,var(--surface))",
          ["--bc"]: rejected
            ? "color-mix(in srgb,#E0212F 35%,transparent)"
            : "color-mix(in srgb,#E89015 35%,transparent)",
        } as React.CSSProperties
      }
    >
      <span
        className="w-[38px] h-[38px] rounded-[11px] flex-none grid place-items-center [background:var(--bg)] [color:var(--c)]"
        style={
          {
            ["--bg"]: rejected
              ? "rgba(224,33,47,.14)"
              : "rgba(232,144,21,.16)",
            ["--c"]: rejected ? "#E0212F" : "#E89015",
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
