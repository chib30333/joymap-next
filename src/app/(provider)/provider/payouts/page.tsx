import { currentProvider } from "@/lib/session";
import { providerFinance, providerPayouts } from "@/server/selectors";
import { PPayouts } from "@/components/provider/PPayouts";

export default async function ProviderPayoutsPage() {
  const p = (await currentProvider())!;
  const [fin, list] = await Promise.all([
    providerFinance(p.id),
    providerPayouts(p.id),
  ]);
  return (
    <PPayouts
      fin={fin}
      list={list.map((x: any) => ({
        id: x.id,
        amount: x.amount,
        due: x.due,
        date: x.date,
        status: x.status,
      }))}
    />
  );
}
