import { currentUser } from "@/lib/session";
import { catalog } from "@/server/catalog";
import { myFavorites, slotsByService } from "@/server/selectors";
import { CCorporate } from "@/components/customer/CCorporate";

export default async function CorporatePage() {
  const user = await currentUser();
  const [list, favs, slots] = await Promise.all([
    catalog(),
    myFavorites(),
    slotsByService(),
  ]);
  return (
    <CCorporate
      catalog={list}
      favs={favs}
      slotsByService={slots}
      wallet={user?.wallet ?? 0}
    />
  );
}
