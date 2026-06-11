"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Icons } from "@/components/Icons";
import { rpc } from "@/lib/client";
import { Avatar } from "./primitives";
import { Input } from "@/components/ui";

type Thread = {
  id: string;
  who: string;
  service: string;
  last: string;
  time: string;
  unread: number;
  msgs: { from: string; t: string; at: string }[];
};

export function ChatPanel({
  threads,
  role = "c",
}: {
  threads: Thread[];
  role?: "c" | "p";
}) {
  const router = useRouter();
  const [active, setActive] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const cur = active || (threads[0] ? threads[0].id : null);
  const thread = threads.find((t) => t.id === cur);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 9e9 });
  }, [cur, thread ? thread.msgs.length : 0]);

  const open = (id: string) => {
    setActive(id);
    rpc("openThread", { threadId: id, role }).then(() => router.refresh());
  };
  const send = () => {
    const txt = draft.trim();
    if (!txt || !thread || sending) return;
    setSending(true);
    setDraft("");
    rpc("sendMessage", { threadId: thread.id, role, text: txt }).then(() => {
      setSending(false);
      router.refresh();
    });
  };

  if (threads.length === 0) {
    return (
      <div
        className="chat-wrap anim-fade"
        style={{ gridTemplateColumns: "1fr" }}
      >
        <div
          className="chat-main"
          style={{
            display: "grid",
            placeItems: "center",
            color: "var(--ink-3)",
          }}
        >
          <div className="text-center max-w-[340px] p-[20px]">
            <Icons.chat size={40} />
            <h3 className="text-ink mt-[12px] text-[18px]">
              No conversations yet
            </h3>
            <p className="mt-[8px] font-semibold text-[13.5px] leading-[1.5]">
              {role === "c"
                ? "Book an experience and a chat with the provider opens automatically."
                : "When customers book your experiences, their chats appear here."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`chat-wrap anim-fade ${cur ? "has-active" : ""}`}>
      <div className="chat-list no-scrollbar">
        {threads.map((t) => (
          <div
            key={t.id}
            className={`chat-li ${cur === t.id ? "on" : ""}`}
            style={{ position: "relative" }}
            onClick={() => open(t.id)}
          >
            <div className="relative">
              <Avatar name={t.who} size={42} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-[6px]">
                <span
                  className="font-bold text-[14px] whitespace-nowrap overflow-hidden flex-1"
                  style={{ textOverflow: "ellipsis" }}
                >
                  {t.who}
                </span>
                <span className="text-[11px] text-ink-3 font-semibold flex-none">
                  {t.time}
                </span>
              </div>
              <div className="text-[12px] text-ink-3 font-semibold mb-[3px]">
                {t.service}
              </div>
              <div className="flex items-center gap-[6px]">
                <span
                  className="text-[12.5px] whitespace-nowrap overflow-hidden flex-1"
                  style={{
                    color: t.unread ? "var(--ink)" : "var(--ink-3)",
                    fontWeight: t.unread ? 700 : 500,
                    textOverflow: "ellipsis",
                  }}
                >
                  {t.last}
                </span>
                {t.unread > 0 && (
                  <span className="flex-none min-w-[18px] h-[18px] rounded-[99px] bg-coral text-[#fff] text-[11px] font-extrabold grid place-items-center py-0 px-[5px]">
                    {t.unread}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {thread ? (
        <div className="chat-main">
          <div className="chat-head">
            <Avatar name={thread.who} size={40} />
            <div className="flex-1 min-w-0">
              <div className="font-extrabold text-[15px]">{thread.who}</div>
              <div className="text-[12.5px] text-ink-3 font-semibold">
                {thread.service || "Joymap chat"}
              </div>
            </div>
            <button className="icon-btn">
              <Icons.phone size={17} />
            </button>
          </div>
          <div className="chat-body no-scrollbar" ref={bodyRef}>
            {thread.msgs.length === 0 && (
              <div className="self-center text-ink-3 text-[13px] font-semibold py-[30px] px-0">
                Say hello — messages are delivered instantly.
              </div>
            )}
            {thread.msgs.map((m, i) => (
              <div key={i} className={`msg ${m.from}`}>
                {m.t}
                <span className="at">{m.at}</span>
              </div>
            ))}
          </div>
          <div className="chat-input">
            <Input
              placeholder="Write a message…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") send();
              }}
              style={{ borderRadius: "var(--r-pill)" }}
            />
            <button
              className="icon-btn"
              style={{
                background: "var(--coral)",
                color: "#fff",
                border: "none",
                flex: "none",
              }}
              onClick={send}
            >
              {sending ? (
                <span className="jm-spin" />
              ) : (
                <Icons.send size={18} />
              )}
            </button>
          </div>
        </div>
      ) : (
        <div
          className="chat-main"
          style={{
            display: "grid",
            placeItems: "center",
            color: "var(--ink-3)",
          }}
        >
          <div className="text-center">
            <Icons.chat size={40} />
            <p className="mt-[10px] font-semibold">Select a conversation</p>
          </div>
        </div>
      )}
    </div>
  );
}
