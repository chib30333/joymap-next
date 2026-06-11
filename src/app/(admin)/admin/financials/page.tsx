import { platformStats } from "@/server/catalog";
import { payoutQueue } from "@/server/selectors";
import { AFinancials } from "@/components/admin/screens";

export default async function AdminFinancialsPage() {
  const [s, queue] = await Promise.all([platformStats(), payoutQueue()]);
  return (
    <AFinancials
      s={s}
      queue={queue.map((p) => ({
        id: p.id,
        providerName: p.providerName,
        amount: p.amount,
        due: p.due,
        status: p.status,
      }))}
    />
  );
}
