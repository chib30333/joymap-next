import { currentUser } from "@/lib/session";
import { catalog } from "@/server/catalog";
import { myFavorites, slotsByService } from "@/server/selectors";
import { Favorites } from "@/components/customer/Favorites";

export default async function FavoritesPage() {
  const user = await currentUser();
  const [list, favs, slots] = await Promise.all([
    catalog(),
    myFavorites(),
    slotsByService(),
  ]);
  const favList = list.filter((e) => favs.includes(e.id));
  return (
    <Favorites
      list={favList}
      favs={favs}
      slotsByService={slots}
      wallet={user?.wallet ?? 0}
    />
  );
}
