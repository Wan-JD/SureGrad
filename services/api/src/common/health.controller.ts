import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller('health')
export class HealthController {
  constructor(private readonly configService: ConfigService) {}

  @Get()
  check() {
    return {
      status: 'ok',
      service: '@suregrad/api',
      env: this.configService.get<string>('app.nodeEnv', 'development'),
      timestamp: new Date().toISOString(),
    };
  }
}
