import { platformStats } from "@/server/catalog";
import {
  applications,
  pendingServices,
  providersTable,
} from "@/server/selectors";
import { ADashboard } from "@/components/admin/screens";

export default async function AdminDashboardPage() {
  const [s, apps, pend, providers] = await Promise.all([
    platformStats(),
    applications(),
    pendingServices(),
    providersTable(),
  ]);
  const top = [...providers]
    .sort((a, b) => b.gmv - a.gmv)
    .slice(0, 3)
    .map((p) => ({
      id: p.id,
      name: p.name,
      cat: p.cat,
      city: p.city,
      gmv: p.gmv,
    }));
  return (
    <ADashboard
      s={s}
      apps={apps.map((a) => ({
        id: a.id,
        name: a.name,
        cat: a.cat,
        city: a.city,
      }))}
      pend={pend.map((p) => ({
        id: p.id,
        name: p.name,
        providerName: p.providerName,
      }))}
      top={top}
    />
  );
}
