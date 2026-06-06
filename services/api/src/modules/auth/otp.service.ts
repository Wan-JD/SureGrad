import { Injectable } from '@nestjs/common';

interface OtpRecord {
  code: string;
  expiresAt: number;
  createdAt: number;
}

@Injectable()
export class OtpService {
  private readonly store = new Map<string, OtpRecord>();
  private readonly resendCooldownMs = 60_000;
  private readonly ttlMs = 300_000;
  private readonly maxPerHour = 5;
  private readonly hourlyCounts = new Map<
    string,
    { count: number; resetAt: number }
  >();

  generateCode(): string {
    return String(Math.floor(100000 + Math.random() * 900000));
  }

  issue(phone: string): {
    code: string;
    expireSeconds: number;
    retryAfterSeconds: number;
  } {
    const now = Date.now();
    const existing = this.store.get(phone);

    this.enforceRateLimit(phone, now);

    if (existing && now - existing.createdAt < this.resendCooldownMs) {
      const retryAfter = Math.ceil(
        (existing.createdAt + this.resendCooldownMs - now) / 1000,
      );
      return {
        code: existing.code,
        expireSeconds: Math.ceil((existing.expiresAt - now) / 1000),
        retryAfterSeconds: retryAfter,
      };
    }

    const code = this.generateCode();
    this.store.set(phone, {
      code,
      expiresAt: now + this.ttlMs,
      createdAt: now,
    });

    return { code, expireSeconds: 300, retryAfterSeconds: 60 };
  }

  verify(phone: string, code: string): { valid: boolean; reason?: string } {
    const record = this.store.get(phone);

    if (!record) {
      return { valid: false, reason: 'OTP_NOT_FOUND' };
    }

    if (Date.now() > record.expiresAt) {
      this.store.delete(phone);
      return { valid: false, reason: 'OTP_EXPIRED' };
    }

    if (record.code !== code) {
      return { valid: false, reason: 'OTP_INVALID' };
    }

    this.store.delete(phone);
    return { valid: true };
  }

  canResend(phone: string): { allowed: boolean; retryAfterSeconds: number } {
    const record = this.store.get(phone);
    if (!record) {
      return { allowed: true, retryAfterSeconds: 0 };
    }

    const elapsed = Date.now() - record.createdAt;
    if (elapsed >= this.resendCooldownMs) {
      return { allowed: true, retryAfterSeconds: 0 };
    }

    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((this.resendCooldownMs - elapsed) / 1000),
    };
  }

  private enforceRateLimit(phone: string, now: number): void {
    let entry = this.hourlyCounts.get(phone);
    if (!entry || now > entry.resetAt) {
      entry = { count: 0, resetAt: now + 3_600_000 };
      this.hourlyCounts.set(phone, entry);
    }

    entry.count += 1;
    if (entry.count > this.maxPerHour) {
      throw new Error('RATE_LIMITED');
    }
  }
}
