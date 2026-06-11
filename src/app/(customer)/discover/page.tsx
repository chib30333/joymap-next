import { cookies } from "next/headers";
import { currentUser } from "@/lib/session";
import { catalog } from "@/server/catalog";
import { myFavorites, slotsByService } from "@/server/selectors";
import { Catalog } from "@/components/customer/Catalog";

// Discover — browseable catalog + booking flow.
export default async function DiscoverPage({ searchParams }: { searchParams: { q?: string } }) {
  const user = await currentUser();
  const city = cookies().get("jm_city")?.value || user?.city || "Moscow";
  const [list, favs, slots] = await Promise.all([catalog(city), myFavorites(), slotsByService()]);
  return <Catalog list={list} favs={favs} city={city} slotsByService={slots} wallet={user?.wallet ?? 0} initialQuery={searchParams.q} />;
}
