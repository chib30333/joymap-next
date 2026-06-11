import { currentUser } from "@/lib/session";
import { myBookings } from "@/server/selectors";
import { CProfile } from "@/components/customer/CProfile";

export default async function ProfilePage() {
  const user = await currentUser();
  const { upcoming, past } = await myBookings();
  const clean = (b: any) => ({
    id: b.id,
    date: b.date,
    total: b.total,
    status: b.status,
    rated: b.rated,
    exp: b.exp,
  });
  return (
    <CProfile
      user={{
        name: user?.name ?? "",
        email: user?.email ?? "",
        phone: user?.phone ?? undefined,
        city: user?.city ?? "Moscow",
        plan: user?.plan ?? undefined,
        moods: user?.moods ?? [],
      }}
      bookings={{ upcoming: upcoming.map(clean), past: past.map(clean) }}
    />
  );
}
