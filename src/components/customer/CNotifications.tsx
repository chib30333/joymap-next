"use client";
// CNotifications — 1:1 port of customer-extra.jsx Notifications.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icons } from "@/components/Icons";
import { rpc } from "@/lib/client";

type N = { id: string; icon: string; accent: string; title: string; body: string; time: string; unread: boolean };

export function CNotifications({ items }: { items: N[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const unread = items.filter((n) => n.unread).length;
  const list = filter === "all" ? items : items.filter((n) => n.unread);
  const mark = (id: string) => rpc("markNotif", { id }).then(() => router.refresh());
  const markAll = () => rpc("markAllNotifs").then(() => router.refresh());

  return (
    <div className="anim-fade" style={{ maxWidth: 640 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 6, background: "var(--surface-2)", padding: 5, borderRadius: "var(--r-pill)", border: "1px solid var(--line)" }}>
          {([["all", "All"], ["unread", `Unread${unread ? ` · ${unread}` : ""}`]] as const).map(([k, l]) => (
            <button key={k} className="btn btn-sm" onClick={() => setFilter(k as "all" | "unread")} style={filter === k ? { background: "var(--surface)", color: "var(--ink)", boxShadow: "var(--sh-sm)" } : { color: "var(--ink-3)" }}>{l}</button>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <button className="btn btn-ghost btn-sm" onClick={markAll}><Icons.checkCirc size={15} />Mark all read</button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {list.map((n) => {
          const I = Icons[n.icon] || Icons.bell;
          return (
            <div key={n.id} className="card" onClick={() => mark(n.id)} style={{ padding: "15px 17px", display: "flex", gap: 13, cursor: "pointer", borderColor: n.unread ? "color-mix(in srgb,var(--coral) 32%,transparent)" : "var(--line)" }}>
              <span style={{ width: 40, height: 40, borderRadius: 12, flex: "none", display: "grid", placeItems: "center", background: `color-mix(in srgb,${n.accent} 15%,transparent)`, color: n.accent }}><I size={19} /></span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 14.5 }}>{n.title}</span>
                  {n.unread && <span style={{ width: 8, height: 8, borderRadius: 99, background: "var(--coral)", flex: "none" }} />}
                  <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--ink-3)", fontWeight: 600, flex: "none" }}>{n.time}</span>
                </div>
                <p style={{ margin: "3px 0 0", fontSize: 13.5, color: "var(--ink-2)", lineHeight: 1.45 }}>{n.body}</p>
              </div>
            </div>
          );
        })}
        {list.length === 0 && <div style={{ textAlign: "center", padding: 50, color: "var(--ink-3)" }}><Icons.checkCirc size={36} /><p style={{ marginTop: 10, fontWeight: 600 }}>You&apos;re all caught up.</p></div>}
      </div>
    </div>
  );
}
