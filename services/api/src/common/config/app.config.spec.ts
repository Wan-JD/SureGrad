import { isDevelopmentExtraCorsOrigin, resolveCorsOrigin } from './app.config';

describe('appConfig CORS helpers', () => {
  it('allows localhost and 127.0.0.1 HTTP origins during development', () => {
    expect(isDevelopmentExtraCorsOrigin('http://localhost:3001')).toBe(true);
    expect(isDevelopmentExtraCorsOrigin('http://localhost:3002')).toBe(true);
    expect(isDevelopmentExtraCorsOrigin('http://127.0.0.1:7357')).toBe(true);
  });

  it('does not allow non-local or non-http origins through the development helper', () => {
    expect(isDevelopmentExtraCorsOrigin('https://localhost:3001')).toBe(false);
    expect(isDevelopmentExtraCorsOrigin('http://example.com:3001')).toBe(false);
    expect(isDevelopmentExtraCorsOrigin('not-a-url')).toBe(false);
  });

  it('keeps production CORS restricted to configured origins', () => {
    expect(resolveCorsOrigin('production', ['http://localhost:3001'])).toEqual([
      'http://localhost:3001',
    ]);
  });
});
