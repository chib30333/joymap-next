import { customersTable } from "@/server/selectors";
import { ACustomers } from "@/components/admin/screens";

export default async function AdminCustomersPage() {
  const list = (await customersTable()).map((c) => ({
    id: c.id,
    name: c.name,
    tier: c.tier,
    bookings: c.bookings,
    ltv: c.ltv,
    joined: c.joined,
  }));
  return <ACustomers list={list} />;
}
