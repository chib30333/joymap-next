import { myNotifications } from "@/server/selectors";
import { CNotifications } from "@/components/customer/CNotifications";

export default async function NotificationsPage() {
  const items = (await myNotifications()).map((n) => ({ id: n.id, icon: n.icon, accent: n.accent, title: n.title, body: n.body, time: n.time, unread: n.unread }));
  return <CNotifications items={items} />;
}
