import { registerAs } from '@nestjs/config';

export type CorsOriginSetting = boolean | string[];

const parseCorsOrigin = (value: string): CorsOriginSetting => {
  if (value === '*') {
    return true;
  }

  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

/** Local development frontends, including admin and Flutter Web visual harnesses. */
export const isDevelopmentExtraCorsOrigin = (origin: string): boolean => {
  try {
    const url = new URL(origin);
    if (url.protocol !== 'http:') {
      return false;
    }
    return url.hostname === '127.0.0.1' || url.hostname === 'localhost';
  } catch {
    return false;
  }
};

export const resolveCorsOrigin = (
  nodeEnv: string,
  corsOrigin: CorsOriginSetting,
):
  | CorsOriginSetting
  | ((
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean | string) => void,
    ) => void) => {
  if (
    nodeEnv !== 'development' ||
    corsOrigin === true ||
    !Array.isArray(corsOrigin)
  ) {
    return corsOrigin;
  }

  const allowed = corsOrigin;

  return (origin, callback) => {
    if (!origin) {
      callback(null, true);
      return;
    }
    if (allowed.includes(origin) || isDevelopmentExtraCorsOrigin(origin)) {
      callback(null, true);
      return;
    }
    callback(null, false);
  };
};

export const appConfig = registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3000),
  apiPrefix: process.env.API_PREFIX ?? 'api/v1',
  corsOrigin: parseCorsOrigin(process.env.CORS_ORIGIN ?? '*'),
}));
