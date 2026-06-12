import { prisma } from "@/lib/db";
import { Prisma, PrismaClient } from "@prisma/client";
import { currentUser, currentProvider, ApiError } from "@/lib/session";
import { notify } from "./notify";
import { nowLabel } from "@/lib/format";

type Tx = Prisma.TransactionClient | PrismaClient;

export async function ensureThread(db: Tx, customerId: string, providerId: string, service?: string) {
  const existing = await db.thread.findUnique({
    where: { customerId_providerId: { customerId, providerId } },
  });
  if (existing) {
    if (service) await db.thread.update({ where: { id: existing.id }, data: { service } });
    return existing;
  }
  return db.thread.create({ data: { customerId, providerId, service: service ?? "" } });
}

export async function startThread(providerId: string, service?: string) {
  const u = await currentUser();
  if (!u) throw new ApiError(401, "Not signed in");
  return ensureThread(prisma, u.id, providerId, service);
}

export async function sendMessage(threadId: string, fromRole: "c" | "p", text: string) {
  return prisma.$transaction(async (db) => {
    const t = await db.thread.findUnique({ where: { id: threadId } });
    if (!t) throw new ApiError(404, "Thread not found");
    await db.message.create({ data: { threadId, fromRole, text, at: nowLabel() } });
    await db.thread.update({
      where: { id: threadId },
      data: fromRole === "c" ? { unreadP: { increment: 1 }, lastAt: new Date() } : { unreadC: { increment: 1 }, lastAt: new Date() },
    });
    if (fromRole === "c") {
      const provider = await db.provider.findUnique({ where: { id: t.providerId } });
      if (provider) await notify(db, provider.ownerId, { icon: "chat", accent: "#3FA89B", title: "New message", body: text.slice(0, 80) });
    } else {
      const provider = await db.provider.findUnique({ where: { id: t.providerId } });
      await notify(db, t.customerId, { icon: "chat", accent: "#3FA89B", title: `Message from ${provider?.name ?? "Provider"}`, body: text.slice(0, 80) });
    }
    return { ok: true };
  });
}

export async function openThread(threadId: string, role: "c" | "p") {
  return prisma.thread.update({
    where: { id: threadId },
    data: role === "c" ? { unreadC: 0 } : { unreadP: 0 },
  });
}

export async function threadsFor(role: "c" | "p") {
  const u = await currentUser();
  if (!u) return [];
  let where: any;
  if (role === "c") where = { customerId: u.id };
  else {
    const p = await currentProvider();
    if (!p) return [];
    where = { providerId: p.id };
  }
  const threads = await prisma.thread.findMany({
    where,
    include: { messages: { orderBy: { createdAt: "asc" } } },
    orderBy: { lastAt: "desc" },
  });
  return Promise.all(
    threads.map(async (t) => {
      let who = "Customer";
      if (role === "c") {
        const p = await prisma.provider.findUnique({ where: { id: t.providerId } });
        who = p?.name ?? "Provider";
      } else {
        const c = await prisma.user.findUnique({ where: { id: t.customerId } });
        who = c?.name ?? "Customer";
      }
      const last = t.messages[t.messages.length - 1];
      return {
        id: t.id,
        who,
        service: t.service,
        last: last?.text ?? "Say hello 👋",
        time: last?.at ?? "",
        unread: role === "c" ? t.unreadC : t.unreadP,
        msgs: t.messages.map((m) => ({ from: m.fromRole === role ? "me" : "them", t: m.text, at: m.at })),
      };
    })
  );
}
