import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/session";
import { expById, providerRating, providerFinance, ratingOf } from "./catalog";
import { TODAY } from "@/constants";

export async function myBookings() {
  const u = await currentUser();
  if (!u) return { upcoming: [], past: [] };
  const all = await prisma.booking.findMany({ where: { userId: u.id }, orderBy: { createdAt: "desc" } });
  const deco = async (b: (typeof all)[number]) => ({ ...b, exp: await expById(b.serviceId) });
  const upcoming = await Promise.all(all.filter((b) => (b.status === "pending" || b.status === "confirmed") && b.day >= TODAY).map(deco));
  const past = await Promise.all(all.filter((b) => b.status === "completed" || b.status === "cancelled" || b.day < TODAY).map(deco));
  return { upcoming, past };
}

export async function myFavorites() {
  const u = await currentUser();
  if (!u) return [];
  const f = await prisma.favorite.findMany({ where: { userId: u.id } });
  return f.map((x) => x.serviceId);
}

export async function myTransactions() {
  const u = await currentUser();
  if (!u) return [];
  return prisma.transaction.findMany({ where: { userId: u.id }, orderBy: { createdAt: "desc" } });
}

export async function myNotifications() {
  const u = await currentUser();
  if (!u) return [];
  return prisma.notification.findMany({ where: { userId: u.id }, orderBy: { createdAt: "desc" } });
}

export async function unreadNotifications() {
  return (await myNotifications()).filter((n) => n.unread).length;
}

export async function providerServices(providerId: string) {
  const svcs = await prisma.service.findMany({ where: { providerId }, orderBy: { createdAt: "desc" } });
  return Promise.all(
    svcs.map(async (s) => {
      const r = await ratingOf(s.id);
      const bs = await prisma.booking.findMany({ where: { serviceId: s.id, status: { not: "cancelled" } } });
      return { ...s, rating: r.rating, reviewsN: r.reviews, booked: bs.reduce((a, b) => a + b.people, 0) };
    })
  );
}
export async function providerSlots(providerId: string) {
  return prisma.slot.findMany({ where: { providerId } });
}
export async function providerBookings(providerId: string) {
  const rows = await prisma.booking.findMany({ where: { providerId }, orderBy: { createdAt: "desc" } });
  return Promise.all(
    rows.map(async (b) => {
      const u = await prisma.user.findUnique({ where: { id: b.userId } });
      const svc = await prisma.service.findUnique({ where: { id: b.serviceId } });
      return { ...b, customer: u?.name ?? "Customer", service: svc?.name ?? "experience" };
    })
  );
}
export async function providerReviews(providerId: string) {
  return prisma.review.findMany({ where: { providerId }, orderBy: { createdAt: "desc" } });
}
export async function providerPayouts(providerId: string) {
  return prisma.payout.findMany({ where: { providerId }, orderBy: { createdAt: "desc" } });
}
export { providerRating, providerFinance };

export async function applications() {
  return prisma.provider.findMany({ where: { status: "review" } });
}
export async function pendingServices() {
  const svcs = await prisma.service.findMany({ where: { status: "review" } });
  return Promise.all(
    svcs.map(async (s) => {
      const p = await prisma.provider.findUnique({ where: { id: s.providerId } });
      return { ...s, providerName: p?.name ?? "—" };
    })
  );
}
export async function providersTable() {
  const providers = await prisma.provider.findMany();
  return Promise.all(
    providers.map(async (p) => {
      const bs = await prisma.booking.findMany({ where: { providerId: p.id, status: { not: "cancelled" } } });
      const r = await providerRating(p.id);
      return { ...p, bookings: bs.length, gmv: bs.reduce((a, b) => a + b.total, 0), rating: r.rating };
    })
  );
}
export async function customersTable() {
  const users = await prisma.user.findMany({ where: { role: "customer" } });
  return Promise.all(
    users.map(async (u) => {
      const bs = await prisma.booking.findMany({ where: { userId: u.id, status: { not: "cancelled" } } });
      const ltv = bs.reduce((a, b) => a + b.total, 0);
      return { id: u.id, name: u.name, tier: ltv > 20000 ? "vip" : bs.length ? "active" : "new", bookings: bs.length, ltv, joined: u.joined };
    })
  );
}
export async function payoutQueue() {
  return prisma.payout.findMany({ orderBy: { createdAt: "desc" } });
}

export async function slotsByService() {
  const slots = await prisma.slot.findMany({ where: { day: { gte: TODAY } }, orderBy: [{ day: "asc" }, { time: "asc" }] });
  const map: Record<string, { day: number; time: string }[]> = {};
  for (const s of slots) (map[s.serviceId] ??= []).push({ day: s.day, time: s.time });
  return map;
}
export async function flags() {
  return prisma.flag.findMany({ orderBy: { createdAt: "desc" } });
}
