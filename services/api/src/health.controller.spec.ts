import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { HealthController } from './common/health.controller';

describe('HealthController', () => {
  it('returns a basic health payload', async () => {
    const configService = {
      get: jest.fn().mockReturnValue('test'),
    } as unknown as ConfigService;
    const dataSource = {
      query: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
    } as unknown as DataSource;
    const controller = new HealthController(configService, dataSource);

    await expect(controller.check()).resolves.toMatchObject({
      status: 'ok',
      service: '@suregrad/api',
      env: 'test',
      database: 'ok',
    });
  });

  it('marks health as degraded when the database is unavailable', async () => {
    const configService = {
      get: jest.fn().mockReturnValue('test'),
    } as unknown as ConfigService;
    const dataSource = {
      query: jest.fn().mockRejectedValue(new Error('connection refused')),
    } as unknown as DataSource;
    const controller = new HealthController(configService, dataSource);

    await expect(controller.check()).resolves.toMatchObject({
      status: 'degraded',
      database: 'error',
    });
  });
});
