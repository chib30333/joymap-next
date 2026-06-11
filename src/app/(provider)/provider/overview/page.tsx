import { currentProvider } from "@/lib/session";
import { providerBookings, providerFinance, providerRating, providerServices, providerSlots } from "@/server/selectors";
import { POverview } from "@/components/provider/screens";

const TODAY = 10;
export default async function ProviderOverviewPage() {
  const p = (await currentProvider())!;
  const [bookings, fin, rating, svcs, slots] = await Promise.all([
    providerBookings(p.id), providerFinance(p.id), providerRating(p.id), providerServices(p.id), providerSlots(p.id),
  ]);
  const clean = (b: any) => ({ id: b.id, customer: b.customer, service: b.service, day: b.day, date: b.date, time: b.time, people: b.people, total: b.total, status: b.status, code: b.code });
  const cleanSvc = (s: any) => ({ id: s.id, name: s.name, mood: s.mood, cap: s.cap });
  return (
    <POverview
      bookings={bookings.map(clean)}
      fin={fin}
      todaySlots={slots.filter((s) => s.day === TODAY).map((s) => ({ serviceId: s.serviceId, time: s.time, booked: s.booked }))}
      svcs={svcs.map(cleanSvc)}
      rating={rating}
    />
  );
}
