import { registerAs } from '@nestjs/config';

const parseCorsOrigin = (value: string): boolean | string[] => {
  if (value === '*') {
    return true;
  }

  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

export const appConfig = registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3000),
  apiPrefix: process.env.API_PREFIX ?? 'api/v1',
  corsOrigin: parseCorsOrigin(process.env.CORS_ORIGIN ?? '*'),
}));
