import { cookies } from "next/headers";
import { createHmac } from "crypto";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

const SECRET = process.env.AUTH_SECRET || "dev-insecure-secret-change-me";
const KEY = new TextEncoder().encode(SECRET);
const COOKIE = "zako_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 jours

// --- OTP -------------------------------------------------------------------

export function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000)); // 6 chiffres
}

export function hashOtp(code: string, phone: string): string {
  return createHmac("sha256", SECRET).update(`${phone}:${code}`).digest("hex");
}

// --- Session (JWT en cookie httpOnly) --------------------------------------

export async function createSession(userId: string): Promise<void> {
  const token = await new SignJWT({ uid: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(KEY);

  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession(): Promise<void> {
  (await cookies()).delete(COOKIE);
}

export async function getSessionUserId(): Promise<string | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, KEY);
    return (payload.uid as string) ?? null;
  } catch {
    return null;
  }
}

// Renvoie l'utilisateur connecté (ou null). Bloque les comptes bannis.
export async function getCurrentUser() {
  const uid = await getSessionUserId();
  if (!uid) return null;
  try {
    const user = await prisma.user.findUnique({ where: { id: uid } });
    if (!user || user.isBlocked) return null;
    return user;
  } catch {
    return null;
  }
}
