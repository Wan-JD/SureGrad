import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

interface CaptchaRecord {
  code: string;
  expiresAt: number;
  createdAt: number;
}

@Injectable()
export class CaptchaService {
  private readonly store = new Map<string, CaptchaRecord>();
  private readonly ttlMs = 300_000; // 5 minutes
  private readonly codeLength = 4;

  generateCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let code = '';
    for (let i = 0; i < this.codeLength; i++) {
      code += chars[crypto.randomInt(chars.length)];
    }
    return code;
  }

  issue(): { captchaId: string; image: string } {
    const captchaId = crypto.randomUUID();
    const code = this.generateCode();
    const now = Date.now();

    this.store.set(captchaId, {
      code,
      expiresAt: now + this.ttlMs,
      createdAt: now,
    });

    this.cleanup();

    return {
      captchaId,
      image: this.generateSvg(code),
    };
  }

  verify(captchaId: string, code: string): { valid: boolean; reason?: string } {
    const record = this.store.get(captchaId);

    if (!record) {
      return { valid: false, reason: 'CAPTCHA_NOT_FOUND' };
    }

    if (Date.now() > record.expiresAt) {
      this.store.delete(captchaId);
      return { valid: false, reason: 'CAPTCHA_EXPIRED' };
    }

    if (record.code.toLowerCase() !== code.toLowerCase()) {
      return { valid: false, reason: 'CAPTCHA_INVALID' };
    }

    this.store.delete(captchaId);
    return { valid: true };
  }

  private generateSvg(code: string): string {
    const width = 120;
    const height = 40;
    const charWidth = width / code.length;

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;
    svg += `<rect width="${width}" height="${height}" fill="#f0f0f0" rx="4"/>`;

    // Add noise lines
    for (let i = 0; i < 4; i++) {
      const x1 = crypto.randomInt(width);
      const y1 = crypto.randomInt(height);
      const x2 = crypto.randomInt(width);
      const y2 = crypto.randomInt(height);
      svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#ccc" stroke-width="1"/>`;
    }

    // Add noise dots
    for (let i = 0; i < 20; i++) {
      const cx = crypto.randomInt(width);
      const cy = crypto.randomInt(height);
      svg += `<circle cx="${cx}" cy="${cy}" r="1" fill="#bbb"/>`;
    }

    // Draw characters
    const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6'];
    for (let i = 0; i < code.length; i++) {
      const x = i * charWidth + charWidth / 2;
      const y = height / 2 + crypto.randomInt(-5, 5);
      const rotate = crypto.randomInt(-15, 15);
      const color = colors[crypto.randomInt(colors.length)];
      svg += `<text x="${x}" y="${y}" font-family="monospace" font-size="22" font-weight="bold" fill="${color}" text-anchor="middle" dominant-baseline="central" transform="rotate(${rotate} ${x} ${y})">${code[i]}</text>`;
    }

    svg += '</svg>';
    return svg;
  }

  private cleanup(): void {
    const now = Date.now();
    if (this.store.size > 100) {
      for (const [key, record] of this.store) {
        if (now > record.expiresAt) {
          this.store.delete(key);
        }
      }
    }
  }
}
