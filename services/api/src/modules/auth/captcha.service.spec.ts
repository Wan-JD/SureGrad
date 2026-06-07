import { CaptchaService } from './captcha.service';

describe('CaptchaService', () => {
  let service: CaptchaService;

  beforeEach(() => {
    service = new CaptchaService();
  });

  describe('generateCode', () => {
    it('returns a 4-character string', () => {
      const code = service.generateCode();
      expect(code).toMatch(/^[A-Za-z0-9]{4}$/);
    });
  });

  describe('issue', () => {
    it('returns captchaId and SVG image', () => {
      const result = service.issue();
      expect(result.captchaId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
      expect(result.image).toContain('<svg');
      expect(result.image).toContain('</svg>');
    });
  });

  describe('verify', () => {
    it('returns valid for correct code', () => {
      const { captchaId, image } = service.issue();
      // Extract the code from the SVG text elements
      const textMatches = image.match(/<text[^>]*>([^<]+)<\/text>/g);
      expect(textMatches).not.toBeNull();
      const code = textMatches!
        .map((m) => m.replace(/<text[^>]*>/, '').replace(/<\/text>/, ''))
        .join('');

      const result = service.verify(captchaId, code);
      expect(result.valid).toBe(true);
    });

    it('returns CAPTCHA_INVALID for wrong code', () => {
      const { captchaId } = service.issue();
      const result = service.verify(captchaId, 'XXXX');
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('CAPTCHA_INVALID');
    });

    it('returns CAPTCHA_NOT_FOUND for unknown id', () => {
      const result = service.verify('non-existent-id', '1234');
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('CAPTCHA_NOT_FOUND');
    });

    it('consumes the code after successful verification', () => {
      const { captchaId, image } = service.issue();
      const textMatches = image.match(/<text[^>]*>([^<]+)<\/text>/g);
      const code = textMatches!
        .map((m) => m.replace(/<text[^>]*>/, '').replace(/<\/text>/, ''))
        .join('');

      service.verify(captchaId, code);
      const result = service.verify(captchaId, code);
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('CAPTCHA_NOT_FOUND');
    });
  });
});
