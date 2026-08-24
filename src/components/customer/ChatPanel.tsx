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
  const msgCount = thread ? thread.msgs.length : 0;

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 9e9 });
  }, [cur, msgCount]);

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
      <div className="grid grid-cols-[1fr] h-[calc(100dvh-240px)] sm:h-[calc(100dvh-150px)] min-h-[420px] sm:min-h-[480px] bg-surface border border-line rounded-lg overflow-hidden animate-anim-fade-app">
        <div className="min-w-0 bg-bg grid place-items-center text-[var(--ink-3)]">
          <div className="text-center max-w-[340px] p-5">
            <Icons.chat size={40} />
            <h3 className="text-ink mt-3 text-lg">
              {t("No conversations yet")}
            </h3>
            <p className="mt-2 font-semibold text-sm leading-normal">
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
    <div className="grid grid-cols-[300px_1fr] max-[760px]:grid-cols-[1fr] h-[calc(100dvh-240px)] sm:h-[calc(100dvh-150px)] min-h-[420px] sm:min-h-[480px] bg-surface border border-line rounded-lg overflow-hidden animate-anim-fade-app">
      <div
        className={`border-r border-line overflow-y-auto flex flex-col [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${active ? "max-[760px]:hidden" : ""}`}
      >
        {threads.map((th) => (
          <div
            key={th.id}
            className={`flex gap-3 py-3.5 px-4 cursor-pointer border-b border-line duration-[140ms] items-center hover:bg-surface-2 ${
              cur === th.id
                ? "bg-[color-mix(in_srgb,var(--coral)_9%,transparent)] before:content-[''] before:absolute before:left-0 before:w-1 before:h-9 before:rounded-md before:bg-coral"
                : ""
            } relative`}
            onClick={() => open(th.id)}
          >
            <div className="relative">
              <Avatar name={th.who} size={42} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm whitespace-nowrap overflow-hidden flex-1 text-ellipsis">
                  {th.who}
                </span>
                <span className="text-xs text-ink-3 font-semibold flex-none">
                  {th.time}
                </span>
              </div>
              <div className="text-xs text-ink-3 font-semibold mb-1">
                {th.service}
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-xs whitespace-nowrap overflow-hidden flex-1 text-ellipsis ${th.unread ? "text-ink font-bold" : "text-ink-3 font-medium"}`}
                >
                  {th.last}
                </span>
                {th.unread > 0 && (
                  <span className="flex-none min-w-[18px] h-5 rounded-pill bg-coral text-white text-xs font-extrabold grid place-items-center py-0 px-1">
                    {th.unread}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Master/detail: one pane at a time below 760px, both side by side above
          it. Without the back arrow a phone would open the first thread and
          have no way back to the list. */}
      {thread ? (
        <div
          className={`flex flex-col min-w-0 bg-bg ${active ? "" : "max-[760px]:hidden"}`}
        >
          <div className="flex items-center gap-3 py-3.5 px-4 sm:px-5 border-b border-line bg-surface">
            <button
              aria-label={t("Back")}
              className="min-[761px]:hidden w-9 h-9 -ms-1 flex-none rounded-pill grid place-items-center text-ink-2 duration-150 cursor-pointer hover:bg-surface-2 hover:text-ink"
              onClick={() => setActive(null)}
            >
              <Icons.arrowL size={18} />
            </button>
            <Avatar name={thread.who} size={40} />
            <div className="flex-1 min-w-0">
              <div className="font-extrabold text-base truncate">
                {thread.who}
              </div>
              <div className="text-xs text-ink-3 font-semibold truncate">
                {thread.service || t("Joymap chat")}
              </div>
            </div>
            <button
              aria-label={t("Call")}
              className="w-11 h-11 flex-none rounded-pill grid place-items-center bg-surface border border-line text-ink-2 duration-150 relative cursor-pointer hover:text-ink hover:border-line-2 hover:bg-surface-2"
            >
              <Icons.phone size={17} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" ref={bodyRef}>
            {thread.msgs.length === 0 && (
              <div className="self-center text-ink-3 text-sm font-semibold py-8 px-0">
                {t("Say hello — messages are delivered instantly.")}
              </div>
            )}
            {thread.msgs.map((m, i) => (
              <div
                key={i}
                className={`max-w-[86%] sm:max-w-[74%] py-3 px-4 rounded text-sm leading-normal break-words ${
                  m.from === "me"
                    ? "self-end bg-coral text-white rounded-br-md"
                    : "self-start bg-surface border border-line rounded-bl-md text-ink"
                }`}
              >
                {m.t}
                <span className="block text-xs font-semibold mt-1.5 opacity-60">
                  {m.at}
                </span>
              </div>
            ))}
          </div>
          <div className="flex gap-2.5 py-3.5 px-4 border-t border-line bg-surface items-center">
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
              className="w-11 h-11 rounded-pill grid place-items-center duration-150 relative cursor-pointer hover:text-ink hover:border-line-2 hover:bg-surface-2 [background:var(--coral)] text-white [border:none] flex-none"
              onClick={send}
            >
              {sending ? (
                <span className="w-4 h-4 rounded-full inline-block flex-none border-[2.5px] border-solid [border-top-color:currentColor] [border-right-color:color-mix(in_srgb,currentColor_35%,transparent)] [border-bottom-color:color-mix(in_srgb,currentColor_35%,transparent)] [border-left-color:color-mix(in_srgb,currentColor_35%,transparent)] animate-jm-spin" />
              ) : (
                <Icons.send size={18} />
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="min-w-0 bg-bg grid place-items-center text-[var(--ink-3)] max-[760px]:hidden">
          <div className="text-center">
            <Icons.chat size={40} />
            <p className="mt-2.5 font-semibold">{t("Select a conversation")}</p>
          </div>
        </div>
      )}
    </div>
  );
}
