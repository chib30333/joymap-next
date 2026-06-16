import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { currentUser } from "@/lib/session";
import { myBookings, unreadNotifications } from "@/server/selectors";
import { threadsFor } from "@/server/chat";
import { TopNav } from "@/components/customer/TopNav";

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();
  if (!user) redirect("/auth");
  if (user.role !== "customer")
    redirect(user.role === "provider" ? "/provider" : "/admin");

  const [bookings, threads, unread] = await Promise.all([
    myBookings(),
    threadsFor("c"),
    unreadNotifications(),
  ]);
  const badges = {
    bookings: bookings.upcoming.length || null,
    messages: threads.reduce((a, t) => a + (t.unread || 0), 0) || null,
  };
  const city = cookies().get("jm_city")?.value || user.city || "Moscow";

  return (
    <div className="app-top fx">
      <TopNav
        user={{ name: user.name, plan: user.plan || "Joy Map" }}
        badges={badges}
        unread={unread}
        city={city}
      />
      <div className="pt-7 px-[var(--pad)] pb-16 max-w-7xl w-full mx-auto">
        {children}
      </div>
    </div>
  );
}
