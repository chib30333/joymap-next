import { currentUser } from "@/lib/session";
import { myTransactions } from "@/server/selectors";
import { Wallet } from "@/components/customer/Wallet";

export default async function WalletPage() {
  const user = await currentUser();
  const tx = await myTransactions();
  return (
    <Wallet
      wallet={user?.wallet ?? 0}
      tx={tx.map((t) => ({
        id: t.id,
        label: t.label,
        amount: t.amount,
        date: t.date,
      }))}
    />
  );
}
