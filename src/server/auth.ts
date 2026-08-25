import bcrypt from "bcryptjs";
import type { User } from "@prisma/client";
import { prisma } from "@/lib/db";
import { ApiError, createSession, clearSession } from "@/lib/session";
import { notifyAdmins } from "./notify";
import { COMMISSION } from "@/constants";

/**
 * What the browser is allowed to see after signing in. The whole `User` row was
 * being returned straight down the RPC, which put `pwHash` in the login
 * response body; the caller only ever reads `role` to pick a landing page.
 */
function publicUser(u: User) {
  return { id: u.id, name: u.name, role: u.role };
}

export async function signup(input: {
  name: string;
  email: string;
  pw: string;
  role: "customer" | "provider";
  biz?: string;
  city?: string;
}) {
  const email = input.email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new ApiError(409, "An account with this email already exists. Try logging in.");

  const pwHash = await bcrypt.hash(input.pw, 10);

  const user = await prisma.$transaction(async (db) => {
    const u = await db.user.create({
      data: {
        name: input.name,
        email,
        pwHash,
        role: input.role,
        city: input.city ?? "Moscow",
        plan: input.role === "customer" ? "Joy Map" : null,
      },
    });
    if (input.role === "provider") {
      const p = await db.provider.create({
        data: {
          ownerId: u.id,
          name: input.biz || input.name,
          city: u.city,
          email,
          status: "review",
          commission: COMMISSION,
        },
      });
      await notifyAdmins(db, {
        icon: "checkCirc",
        accent: "#E89015",
        title: "New provider application",
        body: `${p.name} applied to join the marketplace.`,
      });
    }
    return u;
  });

  await createSession(user.id);
  return publicUser(user);
}

export async function login(email: string, pw: string) {
  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (!user) throw new ApiError(404, "No account found with this email. Create one first.");
  const ok = await bcrypt.compare(pw, user.pwHash);
  if (!ok) throw new ApiError(401, "Wrong password. Try again.");
  await createSession(user.id);
  return publicUser(user);
}

export async function logout() {
  clearSession();
  return { ok: true };
}
