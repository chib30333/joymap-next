import { redirect } from "next/navigation";
import { currentUser } from "@/lib/session";
import {
  applications,
  pendingServices,
  flags,
  unreadNotifications,
} from "@/server/selectors";
import { AdminSidebar, AdminTopbar } from "@/components/admin/AdminShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();
  if (!user) redirect("/auth");
  if (user.role !== "admin")
    redirect(user.role === "provider" ? "/provider" : "/joymap");

  const [apps, pend, fl, unread] = await Promise.all([
    applications(),
    pendingServices(),
    flags(),
    unreadNotifications(),
  ]);
  const badges = {
    moderation: apps.length + pend.length || null,
    content: fl.length || null,
  };

  return (
    <div className="app jmdash fx">
      <AdminSidebar badges={badges} />
      <div className="min-w-0 flex flex-col">
        <AdminTopbar name={user.name || "Admin"} unread={unread} />
        <div className="pt-6 px-[var(--pad)] pb-16 max-w-[1280px] w-full mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
