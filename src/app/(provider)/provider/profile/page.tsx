import { currentProvider } from "@/lib/session";
import { PBusinessProfile } from "@/components/provider/PBusinessProfile";

export default async function ProviderProfilePage() {
  const p = (await currentProvider())!;
  const provider = {
    name: p.name,
    tagline: p.tagline,
    about: p.about,
    email: p.email,
    phone: p.phone,
    site: p.site,
    address: p.address,
    area: p.area,
    city: p.city,
    cat: p.cat,
    status: p.status,
    joined: p.joined,
  };
  return <PBusinessProfile provider={provider} />;
}
