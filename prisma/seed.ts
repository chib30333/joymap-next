// Seeds the demo marketplace — mirrors JM.seedDemo() in the prototype.
// Run: npm run db:seed   (wipes & repopulates all tables)
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { TODAY, MONTH_DAYS, WD, dow, COMMISSION } from "../src/lib/constants";

const prisma = new PrismaClient();
const dateLabel = (d: number) => `${WD[dow(Math.max(Math.min(d, MONTH_DAYS), 1))]} ${d} Jun`;
const code = () => "JM-" + Math.random().toString(36).slice(2, 7).toUpperCase();

type Demo = {
  id: string; title: string; provider: string; cat: string; mood: string;
  price: number; dur: string; city: string; area: string; img?: string;
  spots: number; tags: string[]; about: string; rating: number; reviews: number;
};
// Image URLs are the same assets the design uses, now served from /public/images.
// Experiences the design renders with a gradient (no .jpg) keep img undefined.

const DEMO: Demo[] = [
  { id: "e1", title: "Sunrise Rooftop Yoga", provider: "Aether Studio", cat: "Wellness", mood: "calm", price: 1500, dur: "60 min", city: "Moscow", area: "Patriarch Ponds", img: "/images/activity-yoga.jpg", spots: 8, tags: ["Outdoor", "All levels", "Mat included"], about: "Greet the day with gentle vinyasa flow on a sunrise rooftop overlooking the ponds.", rating: 4.9, reviews: 212 },
  { id: "e2", title: "Neon Drift Karting", provider: "Apex Circuit", cat: "Thrill", mood: "energy", price: 2900, dur: "45 min", city: "Moscow", area: "Avtozavodskaya", img: "/images/activity-drifting.jpg", spots: 12, tags: ["Indoor", "Gear provided", "Group"], about: "High-grip electric karts on a glowing indoor circuit. Adrenaline guaranteed.", rating: 4.8, reviews: 540 },
  { id: "e3", title: "Wheel-Throwing Pottery", provider: "Clayhaus", cat: "Creative", mood: "focus", price: 2200, dur: "120 min", city: "Kazan", area: "Artplay", img: "/images/activity-pottery.jpg", spots: 6, tags: ["Beginner", "Take it home", "Cozy"], about: "Centre the clay and throw your first bowls on the wheel. Glaze choices included.", rating: 4.9, reviews: 178 },
  { id: "e4", title: "Helicopter City Flight", provider: "SkyLine Aero", cat: "Adventure", mood: "adventure", price: 14900, dur: "30 min", city: "Moscow", area: "Myachkovo", img: "/images/activity-helicopter.jpg", spots: 3, tags: ["Iconic", "Photo op", "Premium"], about: "Lift off for a panoramic loop over the river, the towers and the golden domes.", rating: 5.0, reviews: 96 },
  { id: "e5", title: "Candlelit Dance Jam", provider: "Move Collective", cat: "Movement", mood: "joy", price: 1200, dur: "75 min", city: "Moscow", area: "Flacon", spots: 16, tags: ["No experience", "Social", "Live DJ"], about: "A judgement-free dance floor with a live DJ, warm lighting and a guide.", rating: 4.7, reviews: 301 },
  { id: "e6", title: "Forest Sound Bath", provider: "Stillwell", cat: "Wellness", mood: "calm", price: 1800, dur: "90 min", city: "Moscow", area: "Serebryany Bor", img: "/images/exp-yoga.jpg", spots: 10, tags: ["Outdoor", "Meditation", "Restorative"], about: "Lie back among the pines as singing bowls and gongs wash over you.", rating: 4.9, reviews: 144 },
  { id: "e7", title: "Watercolor & Wine", provider: "Pigment Bar", cat: "Creative", mood: "connect", price: 2400, dur: "120 min", city: "Moscow", area: "Kuznetsky Most", img: "/images/exp-wine.jpg", spots: 8, tags: ["Date idea", "Drinks", "Beginner"], about: "A relaxed evening of loose watercolor with a glass in hand. Perfect for a date.", rating: 4.8, reviews: 267 },
  { id: "e8", title: "Indoor Climbing Intro", provider: "Vertical Lab", cat: "Movement", mood: "energy", price: 1700, dur: "90 min", city: "Saint Petersburg", area: "Khamovniki", spots: 6, tags: ["Gear provided", "Coached", "Beginner"], about: "Learn the ropes — a certified coach covers safety, movement and your first routes.", rating: 4.8, reviews: 389 },
  { id: "e9", title: "VR Galaxy Escape", provider: "HoloRoom", cat: "Thrill", mood: "adventure", price: 2100, dur: "60 min", city: "Moscow", area: "Tverskaya", spots: 4, tags: ["Team", "Immersive", "Indoor"], about: "Step into a free-roam VR adventure across a derelict space station.", rating: 4.6, reviews: 430 },
  { id: "e10", title: "Pasta From Scratch", provider: "Tavola", cat: "Creative", mood: "connect", price: 3200, dur: "150 min", city: "Moscow", area: "Danilovsky", img: "/images/exp-cooking.jpg", spots: 10, tags: ["Dinner included", "Social", "Hands-on"], about: "Knead, roll and shape three fresh pasta types, then sit down to eat what you made.", rating: 4.9, reviews: 198 },
  { id: "e11", title: "Breath & Ice Bath", provider: "Coldwell", cat: "Wellness", mood: "focus", price: 2600, dur: "75 min", city: "Moscow", area: "Presnensky", spots: 6, tags: ["Guided", "Resilience", "Intense"], about: "A Wim Hof-style session: guided breathwork, the science of cold, then a plunge.", rating: 4.7, reviews: 120 },
  { id: "e12", title: "Golden Hour Sailing", provider: "Harbor & Co", cat: "Adventure", mood: "joy", price: 4800, dur: "120 min", city: "Moscow", area: "Khimki Reservoir", img: "/images/exp-kayak.jpg", spots: 8, tags: ["Sunset", "Drinks", "Small group"], about: "Cast off for a calm evening sail as the sun drops over the water.", rating: 5.0, reviews: 74 },
  { id: "e13", title: "Tandem Skydive", provider: "Freefall Moscow", cat: "Adventure", mood: "adventure", price: 18500, dur: "180 min", city: "Moscow", area: "Aerograd Kolomna", img: "/images/gen-skydive.jpg", spots: 4, tags: ["Tandem", "Instructor", "Video add-on"], about: "Jump from 4,000 metres strapped to a certified instructor. No experience needed.", rating: 5.0, reviews: 64 },
  { id: "e14", title: "Aerobatic Plane Flight", provider: "SkyLine Aero", cat: "Thrill", mood: "adventure", price: 12500, dur: "45 min", city: "Moscow", area: "Myachkovo Airfield", img: "/images/gen-aviation.jpg", spots: 2, tags: ["Loops & rolls", "Pilot-guided", "G-force"], about: "Take the front seat of a light aerobatic plane and pull loops, rolls and wingovers.", rating: 4.9, reviews: 88 },
  { id: "e15", title: "Imperial Gallery Tour", provider: "Hermitage Guides", cat: "Creative", mood: "focus", price: 2300, dur: "90 min", city: "Saint Petersburg", area: "Volkhonka", img: "/images/exp-art.jpg", spots: 12, tags: ["Skip-the-line", "Expert guide", "Indoor"], about: "Walk the gilded halls with an art historian who brings the Old Masters to life.", rating: 4.9, reviews: 156 },
  { id: "e16", title: "Alpine Foothills Hike", provider: "Trailhead Collective", cat: "Adventure", mood: "energy", price: 3400, dur: "300 min", city: "Kazan", area: "Day trip · Aktru", img: "/images/exp-hiking.jpg", spots: 10, tags: ["Guided", "Lunch included", "All levels"], about: "A guided day hike through wildflower meadows beneath snow-capped peaks.", rating: 4.8, reviews: 112 },
];

async function reset() {
  // Order matters for FK constraints; deleteMany on every table.
  await prisma.$transaction([
    prisma.message.deleteMany(),
    prisma.thread.deleteMany(),
    prisma.review.deleteMany(),
    prisma.booking.deleteMany(),
    prisma.slot.deleteMany(),
    prisma.favorite.deleteMany(),
    prisma.transaction.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.payout.deleteMany(),
    prisma.flag.deleteMany(),
    prisma.service.deleteMany(),
    prisma.provider.deleteMany(),
    prisma.user.deleteMany(),
  ]);
}

async function main() {
  await reset();
  const hash = (pw: string) => bcrypt.hash(pw, 10);

  // --- platform team ---
  await prisma.user.create({ data: { name: "Admin", email: "admin@joymap.ru", pwHash: await hash("admin123"), role: "admin", joined: "Jan 2026" } });

  // --- customer ---
  const mira = await prisma.user.create({
    data: { name: "Mira", email: "mira@joymap.ru", pwHash: await hash("joy123"), role: "customer", city: "Moscow", joined: "Jan 2026", plan: "Joy Map+", wallet: 3450, moods: ["calm", "joy", "focus"], onboarded: true },
  });

  // --- providers + owners (one per unique provider name) ---
  const provByName: Record<string, { id: string; ownerId: string }> = {};
  let pi = 0;
  for (const e of DEMO) {
    if (provByName[e.provider]) continue;
    const isAether = e.provider === "Aether Studio";
    const owner = await prisma.user.create({
      data: {
        name: isAether ? "Alex (Aether Studio)" : `${e.provider} Owner`,
        email: isAether ? "aether@joymap.ru" : `${e.provider.toLowerCase().replace(/[^a-z]+/g, "")}@joymap.ru`,
        pwHash: await hash("joy123"),
        role: "provider",
        city: e.city,
        joined: "Mar 2026",
      },
    });
    const provider = await prisma.provider.create({
      data: { ownerId: owner.id, name: e.provider, cat: e.cat, city: e.city, area: e.area, email: owner.email, status: "active", commission: COMMISSION, joined: "Mar 2026" },
    });
    provByName[e.provider] = { id: provider.id, ownerId: owner.id };
    pi++;
  }

  // --- services ---
  for (const e of DEMO) {
    await prisma.service.create({
      data: {
        id: e.id, providerId: provByName[e.provider].id, name: e.title, cat: e.cat, mood: e.mood,
        price: e.price, dur: e.dur, cap: e.spots + 4, city: e.city, area: e.area, img: e.img ?? null, tags: e.tags,
        about: e.about, status: "active", active: true, seedRating: e.rating, seedReviews: e.reviews,
      },
    });
  }

  // --- slots: deterministic spread across June ---
  const times = ["07:30", "09:00", "11:00", "13:00", "15:00", "17:00", "18:30", "20:00"];
  let seed = 424242;
  const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  const services = await prisma.service.findMany();
  for (let day = 1; day <= MONTH_DAYS; day++) {
    const used = new Set<string>();
    const n = 2 + Math.floor(rnd() * 4);
    for (let k = 0; k < n; k++) {
      const svc = services[Math.floor(rnd() * services.length)];
      const t = times[Math.floor(rnd() * times.length)];
      if (used.has(svc.id + t)) continue;
      used.add(svc.id + t);
      await prisma.slot.create({ data: { serviceId: svc.id, providerId: svc.providerId, day, time: t, booked: Math.floor(rnd() * 4) } });
    }
  }

  // --- bookings for Mira ---
  const mk = async (svcId: string, day: number, time: string, people: number, status: any, rated?: number) => {
    const svc = services.find((s) => s.id === svcId);
    if (!svc) return;
    await prisma.booking.create({
      data: { userId: mira.id, serviceId: svcId, providerId: svc.providerId, day, date: dateLabel(day), time, people, total: svc.price * people, pay: "card", status, code: code(), rated: rated ?? null },
    });
  };
  await mk("e1", 13, "07:30", 1, "confirmed");
  await mk("e5", 12, "19:00", 2, "pending");
  await mk("e9", 2, "20:00", 1, "completed", 5);
  await mk("e7", 5, "18:30", 2, "completed", 4);
  await mk("e2", 7, "15:00", 1, "completed");

  // --- a review, wallet ledger, favorites, a chat thread, notifications ---
  const aether = provByName["Aether Studio"];
  await prisma.review.create({ data: { userId: mira.id, name: mira.name, providerId: aether.id, serviceId: "e1", serviceName: "Sunrise Rooftop Yoga", rating: 5, text: "Magical way to start the day. The rooftop view at sunrise is unreal.", date: "2 days ago" } });
  await prisma.transaction.createMany({ data: [
    { userId: mira.id, label: "Top-up · Sber Pay", amount: 5000, date: dateLabel(TODAY) },
    { userId: mira.id, label: "VR Galaxy Escape", amount: -2100, date: dateLabel(TODAY) },
  ] });
  await prisma.favorite.createMany({ data: [ { userId: mira.id, serviceId: "e4" }, { userId: mira.id, serviceId: "e12" } ] });

  const thread = await prisma.thread.create({ data: { customerId: mira.id, providerId: aether.id, service: "Sunrise Rooftop Yoga", unreadC: 1 } });
  await prisma.message.createMany({ data: [
    { threadId: thread.id, fromRole: "p", text: "Hi Mira! Thanks for booking the sunrise session 🌅", at: "18:04" },
    { threadId: thread.id, fromRole: "c", text: "So excited! Do I need to bring my own mat?", at: "18:20" },
    { threadId: thread.id, fromRole: "p", text: "Mats and props are all provided — just bring a light layer.", at: "18:22" },
  ] });
  await prisma.notification.create({ data: { userId: mira.id, icon: "sparkle", accent: "#7B53F0", title: "Your Joy Map is ready", body: "A new week of experiences is ready to explore.", time: "2h ago" } });

  // --- flagged content for the admin content queue ---
  await prisma.flag.createMany({ data: [
    { type: "review", author: "Pavel N.", target: "Apex Circuit", text: "Absolute waste of money, staff were rude.", reason: "Reported · abusive", time: "1h ago" },
    { type: "review", author: "Anonymous", target: "SkyLine Aero", text: "Best ever!!! Check @promo_deals_777 for cheaper flights!!!", reason: "Auto-flag · spam / contact", time: "5h ago" },
    { type: "promo", author: "Coldwell", target: "Promo banner", text: "GUARANTEED weight loss in 3 sessions — medically proven!", reason: "Reported · false claim", time: "1d ago" },
  ] });

  console.log(`Seeded: 1 admin, ${pi} providers, ${DEMO.length} services, demo customer Mira (mira@joymap.ru / joy123).`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
