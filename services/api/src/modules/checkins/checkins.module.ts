import { Module } from '@nestjs/common';
import { CheckinsService } from './checkins.service';
import { CheckinsRepository } from './repositories/checkins.repository';
import { StudyCheckinsController } from './study-checkins.controller';
import { StudyStatsController } from './study-stats.controller';

@Module({
  controllers: [StudyCheckinsController, StudyStatsController],
  providers: [CheckinsRepository, CheckinsService],
})
export class CheckinsModule {}
