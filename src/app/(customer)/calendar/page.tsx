import { cookies } from "next/headers";
import { currentUser } from "@/lib/session";
import { catalog, sessions } from "@/server/catalog";
import { myFavorites, slotsByService } from "@/server/selectors";
import { CCalendar } from "@/components/customer/CCalendar";

export default async function CalendarPage() {
  const user = await currentUser();
  const city = cookies().get("jm_city")?.value || user?.city || "Moscow";
  const [list, sess, favs, slots] = await Promise.all([catalog(city), sessions(city), myFavorites(), slotsByService()]);
  return <CCalendar sessions={sess} catalog={list} favs={favs} slotsByService={slots} wallet={user?.wallet ?? 0} />;
}
