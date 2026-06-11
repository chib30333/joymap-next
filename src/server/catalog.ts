// Read-side projections: turn DB rows into the shapes the UI expects.
// Mirrors expOf / ratingOf / providerFinance / platformStats in backend.js.
import { prisma } from "@/lib/db";
import { moodGradient, TODAY, COMMISSION } from "@/lib/constants";
import type { Service } from "@prisma/client";

export type Experience = {
  id: string;
  title: string;
  provider: string;
  providerId: string;
  cat: string;
  mood: string;
  price: number;
  rating: number | null;
  reviews: number;
  dur: string;
  city: string;
  area: string;
  gradient: string;
  img: string | null;
  spots: number;
  tags: string[];
  about: string;
};

export async function ratingOf(serviceId: string) {
  const svc = await prisma.service.findUnique({ where: { id: serviceId } });
  const rs = await prisma.review.findMany({ where: { serviceId } });
  const seedN = svc?.seedReviews ?? 0;
  const seedR = svc?.seedRating ?? 0;
  const n = rs.length + seedN;
  if (!n) return { rating: null as number | null, reviews: 0 };
  const sum = rs.reduce((a, r) => a + r.rating, 0) + seedR * seedN;
  return { rating: Math.round((sum / n) * 10) / 10, reviews: n };
}

export async function expOf(svc: Service): Promise<Experience> {
  const provider = await prisma.provider.findUnique({ where: { id: svc.providerId } });
  const r = await ratingOf(svc.id);
  return {
    id: svc.id,
    title: svc.name,
    provider: provider?.name ?? "Provider",
    providerId: svc.providerId,
    cat: svc.cat,
    mood: svc.mood,
    price: svc.price,
    rating: r.rating,
    reviews: r.reviews,
    dur: svc.dur,
    city: svc.city,
    area: svc.area,
    gradient: moodGradient(svc.mood),
    img: svc.img,
    spots: svc.cap,
    tags: svc.tags,
    about: svc.about,
  };
}

export async function catalog(city?: string): Promise<Experience[]> {
  const svcs = await prisma.service.findMany({
    where: { status: "active", active: true, ...(city ? { city } : {}) },
    orderBy: { createdAt: "desc" },
  });
  return Promise.all(svcs.map(expOf));
}

export async function expById(id: string): Promise<Experience | null> {
  const svc = await prisma.service.findUnique({ where: { id } });
  return svc ? expOf(svc) : null;
}

export async function providerRating(providerId: string) {
  const svcs = await prisma.service.findMany({ where: { providerId } });
  let tot = 0;
  let cnt = 0;
  for (const s of svcs) {
    const r = await ratingOf(s.id);
    if (r.rating) {
      tot += r.rating * r.reviews;
      cnt += r.reviews;
    }
  }
  return cnt ? { rating: Math.round((tot / cnt) * 10) / 10, reviews: cnt } : { rating: null, reviews: 0 };
}

export async function providerFinance(providerId: string) {
  const provider = await prisma.provider.findUnique({ where: { id: providerId } });
  const commission = provider?.commission ?? COMMISSION;
  const ok = await prisma.booking.findMany({
    where: { providerId, status: { in: ["confirmed", "completed"] } },
  });
  const gross = ok.reduce((a, b) => a + b.total, 0);
  const net = Math.round(gross * (1 - commission / 100));
  const payouts = await prisma.payout.findMany({ where: { providerId } });
  const withdrawn = payouts.reduce((a, p) => a + p.amount, 0);
  return { gross, net, withdrawn, available: Math.max(net - withdrawn, 0), commission };
}

export async function platformStats() {
  const ok = await prisma.booking.findMany({
    where: { status: { in: ["confirmed", "completed"] } },
    include: { service: true },
  });
  const gmv = ok.reduce((a, b) => a + b.total, 0);
  const byDay: Record<number, number> = {};
  const byCat: Record<string, number> = {};
  for (const b of ok) {
    byDay[b.day] = (byDay[b.day] ?? 0) + b.total;
    const c = b.service?.cat ?? "Other";
    byCat[c] = (byCat[c] ?? 0) + b.total;
  }
  const [activeProviders, bookings, customers, payouts] = await Promise.all([
    prisma.provider.count({ where: { status: "active" } }),
    prisma.booking.count({ where: { status: { not: "cancelled" } } }),
    prisma.user.count({ where: { role: "customer" } }),
    prisma.payout.findMany({ where: { status: "pending" } }),
  ]);
  return {
    gmv,
    revenue: Math.round((gmv * COMMISSION) / 100),
    activeProviders,
    bookings,
    customers,
    pendingPayouts: payouts.reduce((a, p) => a + p.amount, 0),
    byDay,
    byCat,
  };
}

// Customer calendar sessions = provider slots, projected with remaining spots.
export async function sessions(city?: string) {
  const slots = await prisma.slot.findMany({ include: { service: true } });
  return slots
    .filter((s) => s.service && s.service.status === "active" && s.service.active && (!city || s.service.city === city))
    .map((s) => {
      const h = parseInt(s.time, 10);
      return {
        id: s.id,
        expId: s.serviceId,
        day: s.day,
        time: s.time,
        tod: h < 12 ? "morning" : h < 17 ? "afternoon" : "evening",
        spots: Math.max(s.service!.cap - s.booked, 0),
      };
    })
    .sort((a, b) => a.day - b.day || a.time.localeCompare(b.time));
}

// Slots available for a single service from today forward (booking flow).
export async function serviceSlots(serviceId: string) {
  return prisma.slot.findMany({
    where: { serviceId, day: { gte: TODAY } },
    orderBy: [{ day: "asc" }, { time: "asc" }],
  });
}
