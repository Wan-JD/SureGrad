import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  const configService = app.get(ConfigService);
  const apiPrefix = configService.get<string>('app.apiPrefix', 'api/v1');
  const port = configService.get<number>('app.port', 3000);
  const corsOrigin = configService.get<string[] | boolean>(
    'app.corsOrigin',
    true,
  );

  app.setGlobalPrefix(apiPrefix);
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  await app.listen(port);
}

void bootstrap();
