import { Module } from '@nestjs/common';
import { CheckinsService } from './checkins.service';
import { StudyCheckinsController } from './study-checkins.controller';
import { StudyStatsController } from './study-stats.controller';

@Module({
  controllers: [StudyCheckinsController, StudyStatsController],
  providers: [CheckinsService],
})
export class CheckinsModule {}
