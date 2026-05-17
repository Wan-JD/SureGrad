import { registerAs } from '@nestjs/config';

const parseBoolean = (value: string | undefined, fallback = false): boolean => {
  if (value === undefined) {
    return fallback;
  }

  return ['true', '1', 'yes', 'on'].includes(value.toLowerCase());
};

export const databaseConfig = registerAs('database', () => ({
  host: process.env.DATABASE_HOST ?? '127.0.0.1',
  port: Number(process.env.DATABASE_PORT ?? 5432),
  name: process.env.DATABASE_NAME ?? 'suregrad',
  user: process.env.DATABASE_USER ?? 'postgres',
  password: process.env.DATABASE_PASSWORD ?? 'postgres',
  schema: process.env.DATABASE_SCHEMA ?? 'public',
  ssl: parseBoolean(process.env.DATABASE_SSL),
  synchronize: parseBoolean(process.env.DATABASE_SYNCHRONIZE),
  logging: parseBoolean(process.env.DATABASE_LOGGING),
}));
