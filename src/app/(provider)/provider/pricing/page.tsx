import { currentProvider } from "@/lib/session";
import { providerServices } from "@/server/selectors";
import { PPricing } from "@/components/provider/extra";

export default async function ProviderPricingPage() {
  const p = (await currentProvider())!;
  const svcs = (await providerServices(p.id)).map((s: any) => ({ id: s.id, name: s.name, dur: s.dur, cap: s.cap, price: s.price }));
  return <PPricing svcs={svcs} />;
}
