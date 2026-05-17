type EnvRecord = Record<string, unknown>;

const asString = (value: unknown, fallback?: string): string => {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value;
  }

  if (fallback !== undefined) {
    return fallback;
  }

  throw new Error('Expected environment value to be a non-empty string.');
};

const asNumber = (value: unknown, key: string, fallback?: number): number => {
  if (value === undefined || value === null || value === '') {
    if (fallback !== undefined) {
      return fallback;
    }

    throw new Error(`Missing numeric environment variable: ${key}`);
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new Error(`Invalid numeric environment variable: ${key}`);
  }

  return parsed;
};

const asBoolean = (value: unknown, fallback = false): boolean => {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    return ['true', '1', 'yes', 'on'].includes(value.toLowerCase());
  }

  throw new Error('Expected environment value to be boolean-like.');
};

export const validateEnv = (config: EnvRecord): EnvRecord => {
  const nodeEnv = asString(config.NODE_ENV, 'development');
  if (!['development', 'test', 'production'].includes(nodeEnv)) {
    throw new Error('NODE_ENV must be one of: development, test, production');
  }

  return {
    NODE_ENV: nodeEnv,
    PORT: asNumber(config.PORT, 'PORT', 3000),
    API_PREFIX: asString(config.API_PREFIX, 'api/v1'),
    CORS_ORIGIN: asString(config.CORS_ORIGIN, '*'),
    DATABASE_HOST: asString(config.DATABASE_HOST, '127.0.0.1'),
    DATABASE_PORT: asNumber(config.DATABASE_PORT, 'DATABASE_PORT', 5432),
    DATABASE_NAME: asString(config.DATABASE_NAME, 'suregrad'),
    DATABASE_USER: asString(config.DATABASE_USER, 'postgres'),
    DATABASE_PASSWORD: asString(config.DATABASE_PASSWORD, 'postgres'),
    DATABASE_SCHEMA: asString(config.DATABASE_SCHEMA, 'public'),
    DATABASE_SSL: asBoolean(config.DATABASE_SSL, false),
    DATABASE_SYNCHRONIZE: asBoolean(config.DATABASE_SYNCHRONIZE, false),
    DATABASE_LOGGING: asBoolean(config.DATABASE_LOGGING, false),
  };
};
