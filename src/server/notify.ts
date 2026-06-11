import { Prisma, PrismaClient } from "@prisma/client";
import { dateLabel, TODAY } from "@/lib/constants";

type Tx = Prisma.TransactionClient | PrismaClient;

export async function notify(
  db: Tx,
  userId: string,
  n: { icon?: string; accent?: string; title: string; body: string }
) {
  await db.notification.create({
    data: {
      userId,
      icon: n.icon ?? "bell",
      accent: n.accent ?? "#5563D6",
      title: n.title,
      body: n.body,
    },
  });
}

export async function notifyAdmins(
  db: Tx,
  n: { icon?: string; accent?: string; title: string; body: string }
) {
  const admins = await db.user.findMany({ where: { role: "admin" }, select: { id: true } });
  await Promise.all(admins.map((a) => notify(db, a.id, n)));
}

export async function ledger(db: Tx, userId: string, label: string, amount: number) {
  await db.transaction.create({
    data: { userId, label, amount, date: dateLabel(TODAY) },
  });
}
