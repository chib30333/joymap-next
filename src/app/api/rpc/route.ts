import { NextRequest, NextResponse } from "next/server";
import { latency } from "@/lib/latency";
import { ApiError } from "@/lib/session";

import * as auth from "@/server/auth";
import * as account from "@/server/account";
import * as bookings from "@/server/bookings";
import * as services from "@/server/services";
import * as chat from "@/server/chat";
import * as admin from "@/server/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ACTIONS: Record<string, (...a: any[]) => Promise<any>> = {
  // auth
  signup: (a) => auth.signup(a),
  login: (a) => auth.login(a.email, a.pw),
  logout: () => auth.logout(),
  // customer account
  toggleFav: (a) => account.toggleFavorite(a.serviceId),
  updateUser: (a) => account.updateUser(a),
  topUp: (a) => account.topUp(a.amount),
  generateJoyMap: (a) => account.generateJoyMap(a?.moods),
  markNotif: (a) => account.markNotif(a.id),
  markAllNotifs: () => account.markAllNotifs(),
  // bookings
  createBooking: (a) => bookings.createBooking(a),
  cancelBooking: (a) => bookings.cancelBooking(a.id),
  rescheduleBooking: (a) => bookings.rescheduleBooking(a.id, a.day, a.time),
  setBookingStatus: (a) => bookings.setBookingStatus(a.id, a.status),
  rateBooking: (a) => bookings.rateBooking(a.id, a.stars, a.text),
  // provider services + slots
  createService: (a) => services.createService(a),
  updateService: (a) => services.updateService(a.id, a.patch),
  toggleService: (a) => services.toggleService(a.id),
  updateProvider: (a) => services.updateProvider(a),
  addSlot: (a) => services.addSlot(a.serviceId, a.day, a.time),
  moveSlot: (a) => services.moveSlot(a.slotId, a.day, a.time),
  setSlotTime: (a) => services.setSlotTime(a.slotId, a.time),
  removeSlot: (a) => services.removeSlot(a.slotId),
  replyReview: (a) => services.replyReview(a.id),
  // chat
  sendMessage: (a) => chat.sendMessage(a.threadId, a.role, a.text),
  openThread: (a) => chat.openThread(a.threadId, a.role),
  startThread: (a) => chat.startThread(a.providerId, a.service),
  // admin
  requestPayout: () => admin.requestPayout(),
  releasePayout: (a) => admin.releasePayout(a.id),
  decideProvider: (a) => admin.decideProvider(a.id, a.approve, a.reason),
  decideService: (a) => admin.decideService(a.id, a.approve, a.reason),
  resolveFlag: (a) => admin.resolveFlag(a.id),
};

export async function POST(req: NextRequest) {
  let body: { action?: string; args?: any };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const handler = body.action ? ACTIONS[body.action] : undefined;
  if (!handler) {
    return NextResponse.json({ error: `Unknown action: ${body.action}` }, { status: 404 });
  }
  try {
    await latency(); // simulated network delay, matching the prototype
    const data = await handler(body.args ?? {});
    return NextResponse.json({ data });
  } catch (e) {
    const status = e instanceof ApiError ? e.status : 500;
    const message = e instanceof Error ? e.message : "Server error";
    if (status === 500) console.error(`[rpc:${body.action}]`, e);
    return NextResponse.json({ error: message }, { status });
  }
}
