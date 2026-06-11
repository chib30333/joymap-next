import { Icons } from "@/components/Icons";

// Provider review banner — 1:1 with provider-app.jsx PReviewBanner.
export function ProviderBanner({ status, rejectReason }: { status: string; rejectReason?: string | null }) {
  const rejected = status === "rejected";
  return (
    <div className="card" style={{ margin: "0 0 var(--gap)", padding: "14px 18px", display: "flex", gap: 13, alignItems: "center", background: rejected ? "color-mix(in srgb,#E0212F 8%,var(--surface))" : "color-mix(in srgb,#E89015 9%,var(--surface))", borderColor: rejected ? "color-mix(in srgb,#E0212F 35%,transparent)" : "color-mix(in srgb,#E89015 35%,transparent)" }}>
      <span style={{ width: 38, height: 38, borderRadius: 11, flex: "none", display: "grid", placeItems: "center", background: rejected ? "rgba(224,33,47,.14)" : "rgba(232,144,21,.16)", color: rejected ? "#E0212F" : "#E89015" }}>
        {rejected ? <Icons.close size={19} /> : <Icons.clock size={19} />}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 800, fontSize: 14.5 }}>{rejected ? "Application rejected" : "Application under review"}</div>
        <div style={{ fontSize: 13, color: "var(--ink-2)", fontWeight: 600 }}>
          {rejected ? (rejectReason || "Requirements not met") + " — contact support to re-apply." : "The platform team is verifying your documents. You can prepare services & schedule meanwhile — they go live once you’re approved."}
        </div>
      </div>
    </div>
  );
}
