import { createHash, pbkdf2Sync, randomBytes, timingSafeEqual } from "node:crypto";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { db } from "@/server/db/client";

const ADMIN_SESSION_COOKIE = "laikao_admin_session";
const SESSION_TTL_DAYS = 14;
const PBKDF2_ITERATIONS = 120_000;
const PBKDF2_KEY_LENGTH = 64;
const PBKDF2_DIGEST = "sha512";

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function derivePasswordHash(password: string, salt: string) {
  return pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, PBKDF2_KEY_LENGTH, PBKDF2_DIGEST).toString("hex");
}

function compareHex(left: string, right: string) {
  const leftBuffer = Buffer.from(left, "hex");
  const rightBuffer = Buffer.from(right, "hex");

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function createPasswordHash(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = derivePasswordHash(password, salt);
  return { salt, hash };
}

export async function createAdminSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);
  const requestHeaders = await headers();

  await db.adminSession.create({
    data: {
      id: `adsess-${randomBytes(10).toString("hex")}`,
      userId,
      tokenHash,
      expiresAt,
      ipAddress: requestHeaders.get("x-forwarded-for") ?? undefined,
      userAgent: requestHeaders.get("user-agent") ?? undefined
    }
  });

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (token) {
    const tokenHash = hashToken(token);
    await db.adminSession.updateMany({
      where: {
        tokenHash,
        revokedAt: null
      },
      data: {
        revokedAt: new Date()
      }
    });
  }

  cookieStore.delete(ADMIN_SESSION_COOKIE);
}

export async function authenticateAdmin(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await db.adminUser.findUnique({
    where: { email: normalizedEmail }
  });

  if (!user || !user.active) {
    return { ok: false as const, reason: "invalid_credentials" as const };
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    return { ok: false as const, reason: "temporarily_locked" as const };
  }

  const derivedHash = derivePasswordHash(password, user.passwordSalt);
  if (!compareHex(derivedHash, user.passwordHash)) {
    const failedLoginCount = user.failedLoginCount + 1;
    const lockedUntil = failedLoginCount >= 8 ? new Date(Date.now() + 15 * 60 * 1000) : null;

    await db.adminUser.update({
      where: { id: user.id },
      data: {
        failedLoginCount,
        lockedUntil
      }
    });

    return { ok: false as const, reason: "invalid_credentials" as const };
  }

  await db.adminUser.update({
    where: { id: user.id },
    data: {
      failedLoginCount: 0,
      lockedUntil: null,
      lastLoginAt: new Date()
    }
  });

  return {
    ok: true as const,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  };
}

export async function getAdminSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }

  const tokenHash = hashToken(token);
  const session = await db.adminSession.findUnique({
    where: { tokenHash },
    include: { user: true }
  });

  if (!session || session.revokedAt || session.expiresAt <= new Date() || !session.user.active) {
    cookieStore.delete(ADMIN_SESSION_COOKIE);
    return null;
  }

  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    role: session.user.role
  };
}

export async function requireAdminSession() {
  const user = await getAdminSessionUser();
  if (!user) {
    redirect("/admin/login");
  }

  return user;
}
