import { threadsFor } from "@/server/chat";
import { ChatPanel } from "@/components/customer/ChatPanel";

export default async function MessagesPage() {
  const threads = await threadsFor("c");
  return <ChatPanel threads={threads as any} role="c" />;
}
