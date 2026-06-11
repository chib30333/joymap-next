import { providersTable } from "@/server/selectors";
import { AProviders } from "@/components/admin/screens";

export default async function AdminProvidersPage() {
  const rows = (await providersTable()).map((p) => ({
    id: p.id,
    name: p.name,
    cat: p.cat,
    city: p.city,
    bookings: p.bookings,
    gmv: p.gmv,
    rating: p.rating,
    status: p.status,
    commission: p.commission,
    joined: p.joined,
  }));
  return <AProviders rows={rows} />;
}
