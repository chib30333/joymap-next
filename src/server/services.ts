import { prisma } from "@/lib/db";
import { currentProvider, ApiError } from "@/lib/session";
import { notifyAdmins } from "./notify";

async function myProvider() {
  const p = await currentProvider();
  if (!p) throw new ApiError(403, "No provider account");
  return p;
}

export async function createService(input: {
  name: string;
  cat: string;
  mood: string;
  price: number;
  dur: string;
  cap: number;
  about?: string;
  area?: string;
  tags?: string[];
}) {
  const p = await myProvider();
  const svc = await prisma.$transaction(async (db) => {
    const s = await db.service.create({
      data: {
        providerId: p.id,
        name: input.name,
        cat: input.cat,
        mood: input.mood,
        price: input.price,
        dur: input.dur,
        cap: input.cap,
        about: input.about ?? "",
        area: input.area ?? p.area,
        city: p.city,
        tags: input.tags ?? [],
        status: "review",
        active: true,
      },
    });
    await notifyAdmins(db, {
      icon: "image",
      accent: "#7B53F0",
      title: "Service awaiting review",
      body: `${p.name} submitted "${s.name}" for publication.`,
    });
    return s;
  });
  return svc;
}

export async function updateService(id: string, patch: Partial<{ name: string; cat: string; mood: string; price: number; dur: string; cap: number; about: string }>) {
  const p = await myProvider();
  const svc = await prisma.service.findUnique({ where: { id } });
  if (!svc || svc.providerId !== p.id) throw new ApiError(404, "Service not found");
  return prisma.service.update({ where: { id }, data: patch });
}

export async function toggleService(id: string) {
  const p = await myProvider();
  const svc = await prisma.service.findUnique({ where: { id } });
  if (!svc || svc.providerId !== p.id) throw new ApiError(404, "Service not found");
  return prisma.service.update({ where: { id }, data: { active: !svc.active } });
}

export async function updateProvider(patch: Partial<{ name: string; tagline: string; about: string; email: string; phone: string; site: string; address: string }>) {
  const p = await myProvider();
  return prisma.provider.update({ where: { id: p.id }, data: patch });
}

// ---- slots ----
export async function addSlot(serviceId: string, day: number, time: string) {
  const p = await myProvider();
  const svc = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!svc || svc.providerId !== p.id) throw new ApiError(404, "Service not found");
  return prisma.slot.create({ data: { serviceId, providerId: p.id, day, time, booked: 0 } });
}

export async function moveSlot(slotId: string, day: number, time?: string) {
  const p = await myProvider();
  const slot = await prisma.slot.findUnique({ where: { id: slotId } });
  if (!slot || slot.providerId !== p.id) throw new ApiError(404, "Slot not found");
  return prisma.slot.update({ where: { id: slotId }, data: { day, ...(time ? { time } : {}) } });
}

export async function setSlotTime(slotId: string, time: string) {
  const p = await myProvider();
  const slot = await prisma.slot.findUnique({ where: { id: slotId } });
  if (!slot || slot.providerId !== p.id) throw new ApiError(404, "Slot not found");
  return prisma.slot.update({ where: { id: slotId }, data: { time } });
}

export async function removeSlot(slotId: string) {
  const p = await myProvider();
  const slot = await prisma.slot.findUnique({ where: { id: slotId } });
  if (!slot || slot.providerId !== p.id) throw new ApiError(404, "Slot not found");
  await prisma.slot.delete({ where: { id: slotId } });
  return { ok: true };
}

export async function replyReview(id: string) {
  const p = await myProvider();
  const r = await prisma.review.findUnique({ where: { id } });
  if (!r || r.providerId !== p.id) throw new ApiError(404, "Review not found");
  return prisma.review.update({ where: { id }, data: { replied: true } });
}
