import { Module } from '@nestjs/common';
import { DailyPlansController } from './daily-plans.controller';
import { PlansService } from './plans.service';
import { StudyPlansController } from './study-plans.controller';
import { UserTargetsController } from './user-targets.controller';
import { WeeklyPlansController } from './weekly-plans.controller';

@Module({
  controllers: [
    UserTargetsController,
    StudyPlansController,
    WeeklyPlansController,
    DailyPlansController,
  ],
  providers: [PlansService],
})
export class PlansModule {}
