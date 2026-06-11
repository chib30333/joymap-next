import { threadsFor } from "@/server/chat";
import { ChatPanel } from "@/components/customer/ChatPanel";

export default async function ProviderMessagesPage() {
  const threads = await threadsFor("p");
  return <ChatPanel threads={threads as any} role="p" />;
}
