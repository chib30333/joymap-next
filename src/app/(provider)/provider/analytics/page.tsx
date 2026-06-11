import { currentProvider } from "@/lib/session";
import { providerBookings, providerServices } from "@/server/selectors";
import { PAnalytics } from "@/components/provider/PAnalytics";

export default async function ProviderAnalyticsPage() {
  const p = (await currentProvider())!;
  const [bookings, svcs] = await Promise.all([
    providerBookings(p.id),
    providerServices(p.id),
  ]);
  const clean = (b: any) => ({
    id: b.id,
    day: b.day,
    time: b.time,
    total: b.total,
    status: b.status,
  });
  const cleanSvc = (s: any) => ({
    id: s.id,
    name: s.name,
    mood: s.mood,
    booked: s.booked,
  });
  return (
    <PAnalytics bookings={bookings.map(clean)} svcs={svcs.map(cleanSvc)} />
  );
}
