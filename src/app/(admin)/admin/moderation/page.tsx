import { applications, pendingServices } from "@/server/selectors";
import { AModeration } from "@/components/admin/screens";

export default async function AdminModerationPage() {
  const [apps, svcs] = await Promise.all([applications(), pendingServices()]);
  return (
    <AModeration
      apps={apps.map((a) => ({
        id: a.id,
        name: a.name,
        cat: a.cat,
        city: a.city,
        email: a.email,
        docs: a.docs,
      }))}
      svcs={svcs.map((s) => ({
        id: s.id,
        name: s.name,
        mood: s.mood,
        cat: s.cat,
        price: s.price,
        about: s.about,
        providerName: s.providerName,
      }))}
    />
  );
}
