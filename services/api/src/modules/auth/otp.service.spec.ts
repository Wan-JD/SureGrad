import { OtpService } from './otp.service';

describe('OtpService', () => {
  let service: OtpService;

  beforeEach(() => {
    service = new OtpService();
  });

  describe('generateCode', () => {
    it('returns a 6-digit string', () => {
      const code = service.generateCode();
      expect(code).toMatch(/^\d{6}$/);
    });
  });

  describe('issue', () => {
    it('returns a new code with correct metadata', () => {
      const result = service.issue('13800138000');
      expect(result.code).toMatch(/^\d{6}$/);
      expect(result.expireSeconds).toBe(300);
      expect(result.retryAfterSeconds).toBe(60);
    });

    it('returns same code when called again within cooldown', () => {
      const first = service.issue('13800138000');
      const second = service.issue('13800138000');
      expect(second.code).toBe(first.code);
      expect(second.retryAfterSeconds).toBeGreaterThan(0);
    });

    it('throws RATE_LIMITED after 5 requests within an hour', () => {
      const phone = '13900139000';
      for (let i = 0; i < 5; i++) {
        service.issue(phone);
      }
      expect(() => service.issue(phone)).toThrow('RATE_LIMITED');
    });
  });

  describe('verify', () => {
    it('returns valid for correct code', () => {
      const { code } = service.issue('13800138000');
      expect(service.verify('13800138000', code)).toEqual({ valid: true });
    });

    it('returns OTP_INVALID for wrong code', () => {
      service.issue('13800138000');
      const result = service.verify('13800138000', '000000');
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('OTP_INVALID');
    });

    it('returns OTP_NOT_FOUND when no code was issued', () => {
      const result = service.verify('13800138000', '123456');
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('OTP_NOT_FOUND');
    });

    it('consumes the code after successful verification', () => {
      const { code } = service.issue('13800138000');
      service.verify('13800138000', code);
      const result = service.verify('13800138000', code);
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('OTP_NOT_FOUND');
    });
  });

  describe('canResend', () => {
    it('allows resend when no code was issued', () => {
      expect(service.canResend('13800138000')).toEqual({
        allowed: true,
        retryAfterSeconds: 0,
      });
    });

    it('blocks resend during cooldown', () => {
      service.issue('13800138000');
      const result = service.canResend('13800138000');
      expect(result.allowed).toBe(false);
      expect(result.retryAfterSeconds).toBeGreaterThan(0);
    });
  });
});
