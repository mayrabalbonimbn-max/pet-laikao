import { createHash, pbkdf2Sync, randomBytes, timingSafeEqual } from "node:crypto";

import { Injectable } from "@nestjs/common";

import { PrismaService } from "../../prisma/prisma.service";

const SESSION_TTL_DAYS = 14;
const PBKDF2_ITERATIONS = 120_000;
const PBKDF2_KEY_LENGTH = 64;
const PBKDF2_DIGEST = "sha512";
const MAX_FAILED_LOGINS = 8;
const LOCK_MINUTES = 15;

export type AdminIdentity = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export type AuthResult =
  | { ok: true; user: AdminIdentity }
  | { ok: false; reason: "invalid_credentials" | "temporarily_locked" };

export type SessionContext = {
  ipAddress?: string;
  userAgent?: string;
};

/**
 * Logica de autenticacao admin portada de server/auth/admin-auth.ts do Next,
 * sem o acoplamento a next/headers. Usa a MESMA tabela AdminUser/AdminSession e
 * o MESMO esquema de cookie, garantindo compatibilidade durante a transicao.
 */
@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  private hashToken(token: string) {
    return createHash("sha256").update(token).digest("hex");
  }

  private derivePasswordHash(password: string, salt: string) {
    return pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, PBKDF2_KEY_LENGTH, PBKDF2_DIGEST).toString("hex");
  }

  private compareHex(left: string, right: string) {
    const leftBuffer = Buffer.from(left, "hex");
    const rightBuffer = Buffer.from(right, "hex");
    if (leftBuffer.length !== rightBuffer.length) {
      return false;
    }
    return timingSafeEqual(leftBuffer, rightBuffer);
  }

  get sessionTtlMs() {
    return SESSION_TTL_DAYS * 24 * 60 * 60 * 1000;
  }

  async authenticate(email: string, password: string): Promise<AuthResult> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.prisma.adminUser.findUnique({ where: { email: normalizedEmail } });

    if (!user || !user.active) {
      return { ok: false, reason: "invalid_credentials" };
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      return { ok: false, reason: "temporarily_locked" };
    }

    const derivedHash = this.derivePasswordHash(password, user.passwordSalt);
    if (!this.compareHex(derivedHash, user.passwordHash)) {
      const failedLoginCount = user.failedLoginCount + 1;
      const lockedUntil = failedLoginCount >= MAX_FAILED_LOGINS ? new Date(Date.now() + LOCK_MINUTES * 60 * 1000) : null;
      await this.prisma.adminUser.update({
        where: { id: user.id },
        data: { failedLoginCount, lockedUntil }
      });
      return { ok: false, reason: "invalid_credentials" };
    }

    await this.prisma.adminUser.update({
      where: { id: user.id },
      data: { failedLoginCount: 0, lockedUntil: null, lastLoginAt: new Date() }
    });

    return {
      ok: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    };
  }

  async createSession(userId: string, context: SessionContext = {}) {
    const token = randomBytes(32).toString("hex");
    const tokenHash = this.hashToken(token);
    const expiresAt = new Date(Date.now() + this.sessionTtlMs);

    await this.prisma.adminSession.create({
      data: {
        id: `adsess-${randomBytes(10).toString("hex")}`,
        userId,
        tokenHash,
        expiresAt,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent
      }
    });

    return { token, expiresAt };
  }

  async revokeSession(token: string) {
    const tokenHash = this.hashToken(token);
    await this.prisma.adminSession.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() }
    });
  }

  async getSessionUser(token: string | undefined): Promise<AdminIdentity | null> {
    if (!token) {
      return null;
    }

    const tokenHash = this.hashToken(token);
    const session = await this.prisma.adminSession.findUnique({
      where: { tokenHash },
      include: { user: true }
    });

    if (!session || session.revokedAt || session.expiresAt <= new Date() || !session.user.active) {
      return null;
    }

    return {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      role: session.user.role
    };
  }
}
