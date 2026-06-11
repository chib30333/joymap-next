// Session = signed JWT stored in an httpOnly cookie. Replaces the prototype's
// localStorage "jm_session" with a real server-side auth check.
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "./db";
import type { User } from "@prisma/client";

const COOKIE = "jm_session";
const ALG = "HS256";

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 16) {
    throw new Error("SESSION_SECRET is missing or too short (set it in .env)");
  }
  return new TextEncoder().encode(s);
}

export async function createSession(userId: string) {
  const token = await new SignJWT({ uid: userId })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret());
  cookies().set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function clearSession() {
  cookies().delete(COOKIE);
}

export async function getUserId(): Promise<string | null> {
  const token = cookies().get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return (payload.uid as string) ?? null;
  } catch {
    return null;
  }
}

export async function currentUser(): Promise<User | null> {
  const id = await getUserId();
  if (!id) return null;
  return prisma.user.findUnique({ where: { id } });
}

export async function requireUser(): Promise<User> {
  const u = await currentUser();
  if (!u) throw new ApiError(401, "Not signed in");
  return u;
}

export async function requireRole(role: User["role"]): Promise<User> {
  const u = await requireUser();
  if (u.role !== role) throw new ApiError(403, `Requires ${role} account`);
  return u;
}

export async function currentProvider() {
  const u = await currentUser();
  if (!u || u.role !== "provider") return null;
  return prisma.provider.findUnique({ where: { ownerId: u.id } });
}

// Tiny typed error so route handlers can map to HTTP status codes.
export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
