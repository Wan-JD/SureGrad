import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';

@Controller('health')
export class HealthController {
  constructor(
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
  ) {}

  @Get()
  async check() {
    let database: 'ok' | 'error' = 'ok';

    try {
      await this.dataSource.query('SELECT 1');
    } catch {
      database = 'error';
    }

    return {
      status: database === 'ok' ? 'ok' : 'degraded',
      service: '@suregrad/api',
      env: this.configService.get<string>('app.nodeEnv', 'development'),
      database,
      timestamp: new Date().toISOString(),
    };
  }
}
