"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Icons } from "@/components/Icons";
import { rpc } from "@/lib/client";
import { Avatar } from "./primitives";
import { Input } from "@/components/ui";
import { useT } from "@/components/Language";

type Message = { from: string; t: string; at: string };

type Thread = {
  id: string;
  who: string;
  service: string;
  last: string;
  time: string;
  unread: number;
  msgs: Message[];
};

export function ChatPanel({
  threads,
  role = "c",
}: {
  threads: Thread[];
  role?: "c" | "p";
}) {
  const t = useT();
  const router = useRouter();
  const [active, setActive] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const cur = active || (threads[0] ? threads[0].id : null);
  const thread = threads.find((th) => th.id === cur);

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
      <div className="grid grid-cols-[1fr] h-[calc(100vh-150px)] min-h-[480px] bg-surface border border-line rounded-lg overflow-hidden animate-anim-fade-app">
        <div className="min-w-0 bg-bg grid place-items-center text-[var(--ink-3)]">
          <div className="text-center max-w-[340px] p-[20px]">
            <Icons.chat size={40} />
            <h3 className="text-ink mt-[12px] text-[18px]">
              {t("No conversations yet")}
            </h3>
            <p className="mt-[8px] font-semibold text-[13.5px] leading-[1.5]">
              {role === "c"
                ? t(
                    "Book an experience and a chat with the provider opens automatically.",
                  )
                : t(
                    "When customers book your experiences, their chats appear here.",
                  )}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[300px_1fr] max-[760px]:grid-cols-[1fr] h-[calc(100vh-150px)] min-h-[480px] bg-surface border border-line rounded-lg overflow-hidden animate-anim-fade-app">
      <div
        className={`border-r border-line overflow-y-auto flex flex-col [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${cur ? "max-[760px]:hidden" : ""}`}
      >
        {threads.map((th) => (
          <div
            key={th.id}
            className={`flex gap-[11px] py-[14px] px-4 cursor-pointer border-b border-line [transition:0.14s] items-center hover:bg-surface-2 ${
              cur === th.id
                ? "bg-[color-mix(in_srgb,var(--coral)_9%,transparent)] before:content-[''] before:absolute before:left-0 before:w-[3px] before:h-[38px] before:rounded-[9px] before:bg-coral"
                : ""
            } relative`}
            onClick={() => open(th.id)}
          >
            <div className="relative">
              <Avatar name={th.who} size={42} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-[6px]">
                <span className="font-bold text-[14px] whitespace-nowrap overflow-hidden flex-1 text-ellipsis">
                  {th.who}
                </span>
                <span className="text-[11px] text-ink-3 font-semibold flex-none">
                  {th.time}
                </span>
              </div>
              <div className="text-[12px] text-ink-3 font-semibold mb-[3px]">
                {th.service}
              </div>
              <div className="flex items-center gap-[6px]">
                <span
                  className="text-[12.5px] whitespace-nowrap overflow-hidden flex-1 text-ellipsis [color:var(--last-c)] [font-weight:var(--last-fw)]"
                  style={
                    {
                      ["--last-c"]: th.unread ? "var(--ink)" : "var(--ink-3)",
                      ["--last-fw"]: th.unread ? 700 : 500,
                    } as React.CSSProperties
                  }
                >
                  {th.last}
                </span>
                {th.unread > 0 && (
                  <span className="flex-none min-w-[18px] h-[18px] rounded-[99px] bg-coral text-[#fff] text-[11px] font-extrabold grid place-items-center py-0 px-[5px]">
                    {th.unread}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {thread ? (
        <div className="flex flex-col min-w-0 bg-bg">
          <div className="flex items-center gap-[12px] py-[14px] px-[18px] border-b border-line bg-surface">
            <Avatar name={thread.who} size={40} />
            <div className="flex-1 min-w-0">
              <div className="font-extrabold text-[15px]">{thread.who}</div>
              <div className="text-[12.5px] text-ink-3 font-semibold">
                {thread.service || t("Joymap chat")}
              </div>
            </div>
            <button className="w-[42px] h-[42px] rounded-pill grid place-items-center bg-surface border border-line text-ink-2 [transition:0.15s] relative cursor-pointer hover:text-ink hover:border-line-2 hover:bg-surface-2">
              <Icons.phone size={17} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-[12px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" ref={bodyRef}>
            {thread.msgs.length === 0 && (
              <div className="self-center text-ink-3 text-[13px] font-semibold py-[30px] px-0">
                {t("Say hello — messages are delivered instantly.")}
              </div>
            )}
            {thread.msgs.map((m, i) => (
              <div
                key={i}
                className={`max-w-[74%] py-[11px] px-[15px] rounded-[16px] text-[14px] leading-[1.5] ${
                  m.from === "me"
                    ? "self-end bg-coral text-[#fff] rounded-br-[5px]"
                    : "self-start bg-surface border border-line rounded-bl-[5px] text-ink"
                }`}
              >
                {m.t}
                <span className="block text-[10.5px] font-semibold mt-[5px] opacity-60">
                  {m.at}
                </span>
              </div>
            ))}
          </div>
          <div className="flex gap-[10px] py-[14px] px-4 border-t border-line bg-surface items-center">
            <Input
              placeholder={t("Write a message…")}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") send();
              }}
              className="[border-radius:var(--r-pill)]"
            />
            <button
              className="w-[42px] h-[42px] rounded-pill grid place-items-center [transition:0.15s] relative cursor-pointer hover:text-ink hover:border-line-2 hover:bg-surface-2 [background:var(--coral)] text-[#fff] [border:none] flex-none"
              onClick={send}
            >
              {sending ? (
                <span className="w-[17px] h-[17px] rounded-full inline-block flex-none border-[2.5px] border-solid [border-top-color:currentColor] [border-right-color:color-mix(in_srgb,currentColor_35%,transparent)] [border-bottom-color:color-mix(in_srgb,currentColor_35%,transparent)] [border-left-color:color-mix(in_srgb,currentColor_35%,transparent)] animate-jm-spin" />
              ) : (
                <Icons.send size={18} />
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="min-w-0 bg-bg grid place-items-center text-[var(--ink-3)]">
          <div className="text-center">
            <Icons.chat size={40} />
            <p className="mt-[10px] font-semibold">{t("Select a conversation")}</p>
          </div>
        </div>
      )}
    </div>
  );
}
