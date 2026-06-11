import { prisma } from "@/lib/db";
import { currentProvider, requireRole, ApiError } from "@/lib/session";
import { notify, notifyAdmins } from "./notify";
import { providerFinance } from "./catalog";
import { money } from "@/lib/format";
import { dateLabel, TODAY, MONTH_DAYS } from "@/lib/constants";

export async function requestPayout() {
  const p = await currentProvider();
  if (!p) throw new ApiError(403, "No provider account");
  const fin = await providerFinance(p.id);
  if (fin.available <= 0) throw new ApiError(400, "Nothing to withdraw yet.");
  return prisma.$transaction(async (db) => {
    const po = await db.payout.create({
      data: {
        providerId: p.id,
        providerName: p.name,
        amount: fin.available,
        due: dateLabel(Math.min(TODAY + 6, MONTH_DAYS)),
        date: dateLabel(TODAY),
        status: "pending",
      },
    });
    await notifyAdmins(db, { icon: "wallet", accent: "#5563D6", title: "Payout requested", body: `${p.name} requested ${money(fin.available)}.` });
    return po;
  });
}

export async function releasePayout(id: string) {
  await requireRole("admin");
  return prisma.$transaction(async (db) => {
    const po = await db.payout.findUnique({ where: { id } });
    if (!po) throw new ApiError(404, "Payout not found");
    const updated = await db.payout.update({ where: { id }, data: { status: "paid" } });
    const provider = await db.provider.findUnique({ where: { id: po.providerId } });
    if (provider) {
      await notify(db, provider.ownerId, {
        icon: "wallet",
        accent: "#1FA46E",
        title: "Payout released",
        body: `${money(po.amount)} is on the way to your bank account.`,
      });
    }
    return updated;
  });
}

export async function decideProvider(id: string, approve: boolean, reason?: string) {
  await requireRole("admin");
  return prisma.$transaction(async (db) => {
    const p = await db.provider.findUnique({ where: { id } });
    if (!p) throw new ApiError(404, "Provider not found");
    const updated = await db.provider.update({
      where: { id },
      data: { status: approve ? "active" : "rejected", rejectReason: approve ? null : reason ?? null },
    });
    await notify(
      db,
      p.ownerId,
      approve
        ? { icon: "checkCirc", accent: "#1FA46E", title: "You’re approved! 🎉", body: `${p.name} is now live on the Joymap marketplace.` }
        : { icon: "close", accent: "#E0212F", title: "Application rejected", body: `${reason ?? "Requirements not met"}. You can re-apply anytime.` }
    );
    return updated;
  });
}

export async function decideService(id: string, approve: boolean, reason?: string) {
  await requireRole("admin");
  return prisma.$transaction(async (db) => {
    const s = await db.service.findUnique({ where: { id } });
    if (!s) throw new ApiError(404, "Service not found");
    const updated = await db.service.update({
      where: { id },
      data: { status: approve ? "active" : "rejected", rejectReason: approve ? null : reason ?? null },
    });
    const provider = await db.provider.findUnique({ where: { id: s.providerId } });
    if (provider) {
      await notify(
        db,
        provider.ownerId,
        approve
          ? { icon: "checkCirc", accent: "#1FA46E", title: "Service published", body: `"${s.name}" is now visible to customers.` }
          : { icon: "close", accent: "#E0212F", title: "Service rejected", body: `"${s.name}" — ${reason ?? "requirements not met"}.` }
      );
    }
    return updated;
  });
}

export async function resolveFlag(id: string) {
  await requireRole("admin");
  await prisma.flag.delete({ where: { id } }).catch(() => { });
  return { ok: true };
}
