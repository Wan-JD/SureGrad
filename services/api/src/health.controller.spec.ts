import { ConfigService } from '@nestjs/config';
import { HealthController } from './common/health.controller';

describe('HealthController', () => {
  it('returns a basic health payload', () => {
    const configService = {
      get: jest.fn().mockReturnValue('test'),
    } as unknown as ConfigService;
    const controller = new HealthController(configService);

    expect(controller.check()).toMatchObject({
      status: 'ok',
      service: '@suregrad/api',
      env: 'test',
    });
  });
});
