import { cookies } from "next/headers";
import { currentUser } from "@/lib/session";
import { catalog } from "@/server/catalog";
import { myBookings, myFavorites, slotsByService } from "@/server/selectors";
import { JoyMapScreen } from "@/components/customer/JoyMapScreen";
import { Onboarding } from "@/components/customer/Onboarding";

export default async function JoyMapPage({
  searchParams,
}: {
  searchParams: { new?: string };
}) {
  const user = await currentUser();
  // First run, or the "New" button asking to build the week from a fresh
  // conversation rather than reshuffling the moods already on file.
  if (user && (!user.onboarded || searchParams.new !== undefined))
    return <Onboarding />;
  const city = cookies().get("jm_city")?.value || user?.city || "Moscow";
  const [list, bookings, favs, slots] = await Promise.all([
    catalog(city),
    myBookings(),
    myFavorites(),
    slotsByService(),
  ]);
  const map = (user?.joymap as any[]) ?? [];

  return (
    <JoyMapScreen
      map={map}
      bookings={bookings.upcoming.map((b) => ({
        serviceId: b.serviceId,
        day: b.day,
        time: b.time,
        status: b.status,
      }))}
      catalog={list}
      favs={favs}
      userName={user?.name ?? ""}
      userMoods={user?.moods ?? []}
      slotsByService={slots}
      wallet={user?.wallet ?? 0}
    />
  );
}
