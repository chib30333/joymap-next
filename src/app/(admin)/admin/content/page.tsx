import { flags } from "@/server/selectors";
import { AContent } from "@/components/admin/screens";

export default async function AdminContentPage() {
  const items = (await flags()).map((f) => ({
    id: f.id,
    type: f.type,
    author: f.author,
    target: f.target,
    text: f.text,
    grad: f.grad,
    reason: f.reason,
    time: f.time,
  }));
  return <AContent items={items} />;
}
