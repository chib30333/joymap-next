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
      className="card"
      style={{
        margin: "0 0 var(--gap)",
        padding: "14px 18px",
        display: "flex",
        gap: 13,
        alignItems: "center",
        background: rejected
          ? "color-mix(in srgb,#E0212F 8%,var(--surface))"
          : "color-mix(in srgb,#E89015 9%,var(--surface))",
        borderColor: rejected
          ? "color-mix(in srgb,#E0212F 35%,transparent)"
          : "color-mix(in srgb,#E89015 35%,transparent)",
      }}
    >
      <span
        className="w-[38px] h-[38px] rounded-[11px] flex-none grid"
        style={{
          placeItems: "center",
          background: rejected ? "rgba(224,33,47,.14)" : "rgba(232,144,21,.16)",
          color: rejected ? "#E0212F" : "#E89015",
        }}
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
