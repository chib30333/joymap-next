// Customer account actions: favorites, wallet top-up, profile, Joy Map generation.
// Mirrors api.toggleFav / api.topUp / api.updateUser / api.generateJoyMap.
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { ledger, notify } from "./notify";
import { catalog } from "./catalog";
import { money } from "@/lib/format";
import { TODAY, MONTH_DAYS, WD, dow } from "@/lib/constants";

export async function toggleFavorite(serviceId: string) {
  const u = await requireUser();
  const existing = await prisma.favorite.findUnique({
    where: { userId_serviceId: { userId: u.id, serviceId } },
  });
  if (existing) {
    await prisma.favorite.delete({ where: { userId_serviceId: { userId: u.id, serviceId } } });
  } else {
    await prisma.favorite.create({ data: { userId: u.id, serviceId } });
  }
  const favs = await prisma.favorite.findMany({ where: { userId: u.id } });
  return favs.map((f) => f.serviceId);
}

export async function updateUser(patch: Partial<{ name: string; email: string; phone: string; city: string; moods: string[]; onboarded: boolean }>) {
  const u = await requireUser();
  return prisma.user.update({ where: { id: u.id }, data: patch });
}

export async function markNotif(id: string) {
  const u = await requireUser();
  await prisma.notification.updateMany({ where: { id, userId: u.id }, data: { unread: false } });
  return { ok: true };
}

export async function markAllNotifs() {
  const u = await requireUser();
  await prisma.notification.updateMany({ where: { userId: u.id }, data: { unread: false } });
  return { ok: true };
}

export async function topUp(amount: number) {
  const u = await requireUser();
  return prisma.$transaction(async (db) => {
    const updated = await db.user.update({
      where: { id: u.id },
      data: { wallet: { increment: amount } },
    });
    await ledger(db, u.id, "Top-up · Sber Pay", amount);
    await notify(db, u.id, {
      icon: "wallet",
      accent: "#1FA46E",
      title: "Balance topped up",
      body: `${money(amount)} added to your Joymap balance.`,
    });
    return updated.wallet;
  });
}

const JOY_NOTES = [
  "Start the week grounded.",
  "Shake off the midweek.",
  "Make something with your hands.",
  "End the week strong.",
  "You earned the golden hour.",
  "Reset before Monday.",
  "Try something brand new.",
];

export async function generateJoyMap(moods?: string[]) {
  const u = await requireUser();
  if (moods?.length) await prisma.user.update({ where: { id: u.id }, data: { moods } });
  const me = await prisma.user.findUnique({ where: { id: u.id } });
  const userMoods = me?.moods ?? [];

  const pool = await catalog();
  const prefer = pool.filter((e) => !userMoods.length || userMoods.includes(e.mood));
  const rest = pool.filter((e) => !prefer.includes(e));
  const ordered = [...prefer, ...rest];

  const slots = await prisma.slot.findMany();
  const used = new Set<string>();
  let ni = 0;
  const days: any[] = [];
  for (let i = 0; i < 7; i++) {
    const day = TODAY + i;
    if (day > MONTH_DAYS || i === 1) {
      days.push({ day, wd: WD[dow(((day - 1) % MONTH_DAYS) + 1)], date: `${day} Jun`, rest: true, expId: null, note: "A rest day. Breathe." });
      continue;
    }
    const pick = ordered.find((e) => !used.has(e.id));
    if (!pick) {
      days.push({ day, wd: WD[dow(day)], date: `${day} Jun`, rest: true, expId: null, note: "A rest day. Breathe." });
      continue;
    }
    used.add(pick.id);
    const slot = slots.find((s) => s.serviceId === pick.id && s.day === day);
    days.push({
      day,
      wd: WD[dow(day)],
      date: `${day} Jun`,
      expId: pick.id,
      time: slot?.time ?? ["07:30", "11:00", "18:30", "19:00", "20:00"][i % 5],
      note: JOY_NOTES[ni++ % JOY_NOTES.length],
    });
  }

  await prisma.user.update({ where: { id: u.id }, data: { joymap: days, onboarded: true } });
  return days;
}
