import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CommonAuthModule } from './common/auth/common-auth.module';
import { appConfig } from './common/config/app.config';
import { databaseConfig } from './common/config/database.config';
import { validateEnv } from './common/config/env.validation';
import { HealthController } from './common/health.controller';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { CheckinsModule } from './modules/checkins/checkins.module';
import { ComparisonItemsModule } from './modules/comparison-items/comparison-items.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { PlansModule } from './modules/plans/plans.module';
import { ProgramsModule } from './modules/programs/programs.module';
import { RemindersModule } from './modules/reminders/reminders.module';
import { ResourcesModule } from './modules/resources/resources.module';
import { SchoolsModule } from './modules/schools/schools.module';
import { TodosModule } from './modules/todos/todos.module';
import { UsersModule } from './modules/users/users.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: ['.env.local', '.env'],
      load: [appConfig, databaseConfig],
      validate: validateEnv,
    }),
    CommonAuthModule,
    DatabaseModule,
    AuthModule,
    UsersModule,
    SchoolsModule,
    ProgramsModule,
    FavoritesModule,
    ComparisonItemsModule,
    PlansModule,
    TodosModule,
    CheckinsModule,
    ResourcesModule,
    RemindersModule,
    AdminModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
