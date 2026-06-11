import { currentProvider } from "@/lib/session";
import { providerServices, providerSlots } from "@/server/selectors";
import { PCalendar } from "@/components/provider/PCalendar";

export default async function ProviderCalendarPage() {
  const p = (await currentProvider())!;
  const [svcs, slots] = await Promise.all([providerServices(p.id), providerSlots(p.id)]);
  const cleanSvc = (s: any) => ({ id: s.id, name: s.name, mood: s.mood, cap: s.cap, dur: s.dur, status: s.status, active: s.active });
  const cleanSlot = (s: any) => ({ id: s.id, serviceId: s.serviceId, day: s.day, time: s.time, booked: s.booked });
  return <PCalendar svcs={svcs.map(cleanSvc)} slots={slots.map(cleanSlot)} />;
}
