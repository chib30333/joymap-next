import { currentProvider } from "@/lib/session";
import { providerServices } from "@/server/selectors";
import { PServices } from "@/components/provider/screens";

export default async function ProviderServicesPage() {
  const p = (await currentProvider())!;
  const svcs = (await providerServices(p.id)).map((s: any) => ({
    id: s.id,
    name: s.name,
    cat: s.cat,
    mood: s.mood,
    price: s.price,
    dur: s.dur,
    cap: s.cap,
    img: s.img,
    status: s.status,
    active: s.active,
    about: s.about,
    rating: s.rating,
    booked: s.booked,
  }));
  return <PServices svcs={svcs} />;
}
