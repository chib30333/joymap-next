import { myBookings } from "@/server/selectors";
import { Bookings } from "@/components/customer/Bookings";

export default async function BookingsPage() {
  const { upcoming, past } = await myBookings();
  const clean = (b: any) => ({ id: b.id, serviceId: b.serviceId, day: b.day, date: b.date, time: b.time, total: b.total, pay: b.pay, status: b.status, code: b.code, rated: b.rated, exp: b.exp });
  return <Bookings upcoming={upcoming.map(clean)} past={past.map(clean)} />;
}
