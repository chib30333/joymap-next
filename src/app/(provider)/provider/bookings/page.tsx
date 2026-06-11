import { currentProvider } from "@/lib/session";
import { providerBookings } from "@/server/selectors";
import { PBookings } from "@/components/provider/PBookings";

export default async function ProviderBookingsPage() {
  const p = (await currentProvider())!;
  const rows = (await providerBookings(p.id)).map((b: any) => ({
    id: b.id,
    customer: b.customer,
    service: b.service,
    day: b.day,
    date: b.date,
    time: b.time,
    people: b.people,
    total: b.total,
    status: b.status,
    code: b.code,
  }));
  return <PBookings rows={rows} />;
}
