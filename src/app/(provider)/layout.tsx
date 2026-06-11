import { redirect } from "next/navigation";
import { currentUser, currentProvider } from "@/lib/session";
import { providerBookings } from "@/server/selectors";
import { threadsFor } from "@/server/chat";
import { ProviderNav } from "@/components/provider/ProviderNav";
import { ProviderBanner } from "@/components/provider/ProviderBanner";
import "../dash.css";

// Server guard + shell for the Provider (Partner) portal.
export default async function ProviderLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  if (!user) redirect("/auth");
  if (user.role !== "provider") redirect(user.role === "admin" ? "/admin" : "/joymap");
  const provider = await currentProvider();
  if (!provider) redirect("/auth");

  const [bookings, threads] = await Promise.all([providerBookings(provider.id), threadsFor("p")]);
  const badges = {
    bookings: bookings.filter((b) => b.status === "pending").length || null,
    messages: threads.reduce((a, t) => a + (t.unread || 0), 0) || null,
  };

  return (
    <div className="app-top jmdash fx">
      <ProviderNav name={provider.name} providerName={provider.name} badges={badges} />
      <div className="content-top">
        {provider.status !== "active" && <ProviderBanner status={provider.status} rejectReason={provider.rejectReason} />}
        {children}
      </div>
    </div>
  );
}
