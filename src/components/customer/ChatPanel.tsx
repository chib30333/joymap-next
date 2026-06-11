"use client";
// ChatPanel — 1:1 port of chat.jsx (customer ↔ provider messaging).
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Icons } from "@/components/Icons";
import { rpc } from "@/lib/client";
import { Avatar } from "./primitives";

type Thread = { id: string; who: string; service: string; last: string; time: string; unread: number; msgs: { from: string; t: string; at: string }[] };

export function ChatPanel({ threads, role = "c" }: { threads: Thread[]; role?: "c" | "p" }) {
  const router = useRouter();
  const [active, setActive] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const cur = active || (threads[0] ? threads[0].id : null);
  const thread = threads.find((t) => t.id === cur);

  useEffect(() => { bodyRef.current?.scrollTo({ top: 9e9 }); }, [cur, thread ? thread.msgs.length : 0]);

  const open = (id: string) => { setActive(id); rpc("openThread", { threadId: id, role }).then(() => router.refresh()); };
  const send = () => {
    const txt = draft.trim();
    if (!txt || !thread || sending) return;
    setSending(true); setDraft("");
    rpc("sendMessage", { threadId: thread.id, role, text: txt }).then(() => { setSending(false); router.refresh(); });
  };

  if (threads.length === 0) {
    return (
      <div className="chat-wrap anim-fade" style={{ gridTemplateColumns: "1fr" }}>
        <div className="chat-main" style={{ display: "grid", placeItems: "center", color: "var(--ink-3)" }}>
          <div style={{ textAlign: "center", maxWidth: 340, padding: 20 }}>
            <Icons.chat size={40} />
            <h3 style={{ color: "var(--ink)", marginTop: 12, fontSize: 18 }}>No conversations yet</h3>
            <p style={{ marginTop: 8, fontWeight: 600, fontSize: 13.5, lineHeight: 1.5 }}>{role === "c" ? "Book an experience and a chat with the provider opens automatically." : "When customers book your experiences, their chats appear here."}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`chat-wrap anim-fade ${cur ? "has-active" : ""}`}>
      <div className="chat-list no-scrollbar">
        {threads.map((t) => (
          <div key={t.id} className={`chat-li ${cur === t.id ? "on" : ""}`} style={{ position: "relative" }} onClick={() => open(t.id)}>
            <div style={{ position: "relative" }}><Avatar name={t.who} size={42} /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontWeight: 700, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flex: 1 }}>{t.who}</span>
                <span style={{ fontSize: 11, color: "var(--ink-3)", fontWeight: 600, flex: "none" }}>{t.time}</span>
              </div>
              <div style={{ fontSize: 12, color: "var(--ink-3)", fontWeight: 600, marginBottom: 3 }}>{t.service}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 12.5, color: t.unread ? "var(--ink)" : "var(--ink-3)", fontWeight: t.unread ? 700 : 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flex: 1 }}>{t.last}</span>
                {t.unread > 0 && <span style={{ flex: "none", minWidth: 18, height: 18, borderRadius: 99, background: "var(--coral)", color: "#fff", fontSize: 11, fontWeight: 800, display: "grid", placeItems: "center", padding: "0 5px" }}>{t.unread}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {thread ? (
        <div className="chat-main">
          <div className="chat-head">
            <Avatar name={thread.who} size={40} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: 15 }}>{thread.who}</div>
              <div style={{ fontSize: 12.5, color: "var(--ink-3)", fontWeight: 600 }}>{thread.service || "Joymap chat"}</div>
            </div>
            <button className="icon-btn"><Icons.phone size={17} /></button>
          </div>
          <div className="chat-body no-scrollbar" ref={bodyRef}>
            {thread.msgs.length === 0 && <div style={{ alignSelf: "center", color: "var(--ink-3)", fontSize: 13, fontWeight: 600, padding: "30px 0" }}>Say hello — messages are delivered instantly.</div>}
            {thread.msgs.map((m, i) => <div key={i} className={`msg ${m.from}`}>{m.t}<span className="at">{m.at}</span></div>)}
          </div>
          <div className="chat-input">
            <input className="field" placeholder="Write a message…" value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") send(); }} style={{ borderRadius: "var(--r-pill)" }} />
            <button className="icon-btn" style={{ background: "var(--coral)", color: "#fff", border: "none", flex: "none" }} onClick={send}>{sending ? <span className="jm-spin" /> : <Icons.send size={18} />}</button>
          </div>
        </div>
      ) : (
        <div className="chat-main" style={{ display: "grid", placeItems: "center", color: "var(--ink-3)" }}>
          <div style={{ textAlign: "center" }}><Icons.chat size={40} /><p style={{ marginTop: 10, fontWeight: 600 }}>Select a conversation</p></div>
        </div>
      )}
    </div>
  );
}
