import { prisma } from "@/lib/db";
import { requireUser, ApiError } from "@/lib/session";
import { ledger, notify } from "./notify";
import { ensureThread } from "./chat";
import { dateLabel } from "@/lib/constants";
import { bookingCode } from "@/lib/format";

export async function createBooking(input: {
  serviceId: string;
  day: number;
  time: string;
  people: number;
  pay: "card" | "sber" | "wallet";
}) {
  const u = await requireUser();
  const svc = await prisma.service.findUnique({ where: { id: input.serviceId } });
  if (!svc) throw new ApiError(404, "Service not found");
  const total = svc.price * input.people;

  return prisma.$transaction(async (db) => {
    if (input.pay === "wallet") {
      const me = await db.user.findUnique({ where: { id: u.id } });
      if ((me?.wallet ?? 0) < total) throw new ApiError(400, "Not enough balance. Top up your wallet first.");
      await db.user.update({ where: { id: u.id }, data: { wallet: { decrement: total } } });
      await ledger(db, u.id, svc.name, -total);
    }

    const slot = await db.slot.findFirst({ where: { serviceId: svc.id, day: input.day, time: input.time } });
    if (slot) await db.slot.update({ where: { id: slot.id }, data: { booked: { increment: input.people } } });

    const booking = await db.booking.create({
      data: {
        userId: u.id,
        serviceId: svc.id,
        providerId: svc.providerId,
        day: input.day,
        date: dateLabel(input.day),
        time: input.time,
        people: input.people,
        total,
        pay: input.pay,
        status: "pending",
        code: bookingCode(),
      },
    });

    const provider = await db.provider.findUnique({ where: { id: svc.providerId } });
    if (provider) {
      await notify(db, provider.ownerId, {
        icon: "calendar",
        accent: "#E89015",
        title: "New booking request",
        body: `${u.name} · ${svc.name} · ${booking.date}, ${booking.time} · ${input.people} spot${input.people > 1 ? "s" : ""}`,
      });
      await ensureThread(db, u.id, provider.id, svc.name);
    }
    await notify(db, u.id, {
      icon: "check",
      accent: "#1FA46E",
      title: "Booking request sent",
      body: `${svc.name} · ${booking.date}, ${booking.time}. The provider will confirm shortly.`,
    });
    return booking;
  });
}

export async function cancelBooking(id: string) {
  return prisma.$transaction(async (db) => {
    const b = await db.booking.findUnique({ where: { id } });
    if (!b) throw new ApiError(404, "Booking not found");
    await db.booking.update({ where: { id }, data: { status: "cancelled" } });

    const slot = await db.slot.findFirst({ where: { serviceId: b.serviceId, day: b.day, time: b.time } });
    if (slot) await db.slot.update({ where: { id: slot.id }, data: { booked: { decrement: Math.min(b.people, slot.booked) } } });

    const svc = await db.service.findUnique({ where: { id: b.serviceId } });
    if (b.pay === "wallet") {
      await db.user.update({ where: { id: b.userId }, data: { wallet: { increment: b.total } } });
      await ledger(db, b.userId, `Refund · ${svc?.name ?? "experience"}`, b.total);
    }
    const provider = await db.provider.findUnique({ where: { id: b.providerId } });
    const customer = await db.user.findUnique({ where: { id: b.userId } });
    if (provider) {
      await notify(db, provider.ownerId, {
        icon: "close",
        accent: "#E0212F",
        title: "Booking cancelled",
        body: `${customer?.name ?? "A customer"} cancelled ${svc?.name ?? "a booking"} · ${b.date}.`,
      });
    }
    return { ok: true };
  });
}

export async function rescheduleBooking(id: string, day: number, time: string) {
  return prisma.$transaction(async (db) => {
    const b = await db.booking.findUnique({ where: { id } });
    if (!b) throw new ApiError(404, "Booking not found");
    const updated = await db.booking.update({
      where: { id },
      data: { day, date: dateLabel(day), time, status: "pending" },
    });
    const svc = await db.service.findUnique({ where: { id: b.serviceId } });
    const provider = await db.provider.findUnique({ where: { id: b.providerId } });
    if (provider) {
      await notify(db, provider.ownerId, {
        icon: "clock",
        accent: "#E89015",
        title: "Booking rescheduled",
        body: `${svc?.name ?? "A booking"} moved to ${updated.date}, ${time} — please re-confirm.`,
      });
    }
    return updated;
  });
}

const STATUS_NOTE: Record<string, [string, string, string]> = {
  confirmed: ["Booking confirmed", "#1FA46E", "check"],
  cancelled: ["Booking declined", "#E0212F", "close"],
  completed: ["Session completed", "#5563D6", "sparkle"],
};

export async function setBookingStatus(id: string, status: "confirmed" | "cancelled" | "completed") {
  return prisma.$transaction(async (db) => {
    const b = await db.booking.findUnique({ where: { id } });
    if (!b) throw new ApiError(404, "Booking not found");
    const updated = await db.booking.update({ where: { id }, data: { status } });
    const svc = await db.service.findUnique({ where: { id: b.serviceId } });
    const note = STATUS_NOTE[status];
    if (note) {
      await notify(db, b.userId, {
        icon: note[2],
        accent: note[1],
        title: note[0],
        body: `${svc?.name ?? "Your booking"} · ${b.date}, ${b.time}${status === "completed" ? " — how was it? Leave a rating!" : ""}`,
      });
    }
    return updated;
  });
}

export async function rateBooking(id: string, stars: number, text?: string) {
  return prisma.$transaction(async (db) => {
    const b = await db.booking.findUnique({ where: { id } });
    if (!b) throw new ApiError(404, "Booking not found");
    await db.booking.update({ where: { id }, data: { rated: stars } });
    const u = await db.user.findUnique({ where: { id: b.userId } });
    const svc = await db.service.findUnique({ where: { id: b.serviceId } });
    await db.review.create({
      data: {
        bookingId: id,
        userId: b.userId,
        name: u?.name ?? "Customer",
        providerId: b.providerId,
        serviceId: b.serviceId,
        serviceName: svc?.name ?? "",
        rating: stars,
        text: text ?? "",
      },
    });
    const provider = await db.provider.findUnique({ where: { id: b.providerId } });
    if (provider) {
      await notify(db, provider.ownerId, {
        icon: "star",
        accent: "#F4A52B",
        title: `New ${stars}-star review`,
        body: `${u?.name ?? "A customer"} rated ${svc?.name ?? "an experience"}.`,
      });
    }
    return { ok: true };
  });
}
