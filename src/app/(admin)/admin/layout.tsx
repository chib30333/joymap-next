import { redirect } from "next/navigation";
import { currentUser } from "@/lib/session";
import { applications, pendingServices, flags, unreadNotifications } from "@/server/selectors";
import { AdminSidebar, AdminTopbar } from "@/components/admin/AdminShell";
import "../../dash.css";

// Server guard + shell for the Admin (Platform) panel — sidebar layout.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  if (!user) redirect("/auth");
  if (user.role !== "admin") redirect(user.role === "provider" ? "/provider" : "/joymap");

  const [apps, pend, fl, unread] = await Promise.all([applications(), pendingServices(), flags(), unreadNotifications()]);
  const badges = { moderation: apps.length + pend.length || null, content: fl.length || null };

  return (
    <div className="app jmdash fx">
      <AdminSidebar badges={badges} />
      <div className="main">
        <AdminTopbar name={user.name || "Admin"} unread={unread} />
        <div className="content">{children}</div>
      </div>
    </div>
  );
}
