import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const sslEnabled = configService.get<boolean>('database.ssl', false);

        return {
          type: 'postgres' as const,
          host: configService.get<string>('database.host', '127.0.0.1'),
          port: configService.get<number>('database.port', 5432),
          username: configService.get<string>('database.user', 'postgres'),
          password: configService.get<string>('database.password', 'postgres'),
          database: configService.get<string>('database.name', 'suregrad'),
          schema: configService.get<string>('database.schema', 'public'),
          autoLoadEntities: true,
          synchronize: configService.get<boolean>(
            'database.synchronize',
            false,
          ),
          logging: configService.get<boolean>('database.logging', false),
          ssl: sslEnabled ? { rejectUnauthorized: false } : false,
          retryAttempts: 3,
          retryDelay: 3000,
          keepConnectionAlive: true,
        };
      },
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
