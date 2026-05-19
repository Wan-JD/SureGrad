import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DailyPlanEntity } from '../../database/entities/daily-plan.entity';
import { DepartmentEntity } from '../../database/entities/department.entity';
import { ProgramEntity } from '../../database/entities/program.entity';
import { SchoolEntity } from '../../database/entities/school.entity';
import { StudyPlanPhaseEntity } from '../../database/entities/study-plan-phase.entity';
import { StudyPlanEntity } from '../../database/entities/study-plan.entity';
import { TodoItemEntity } from '../../database/entities/todo-item.entity';
import { UserProfileEntity } from '../../database/entities/user-profile.entity';
import { UserTargetEntity } from '../../database/entities/user-target.entity';
import { WeeklyPlanEntity } from '../../database/entities/weekly-plan.entity';
import { DailyPlansController } from './daily-plans.controller';
import { PlansService } from './plans.service';
import { PlansRepository } from './repositories/plans.repository';
import { StudyPlansController } from './study-plans.controller';
import { UserTargetsController } from './user-targets.controller';
import { WeeklyPlansController } from './weekly-plans.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserTargetEntity,
      SchoolEntity,
      DepartmentEntity,
      ProgramEntity,
      StudyPlanEntity,
      StudyPlanPhaseEntity,
      WeeklyPlanEntity,
      DailyPlanEntity,
      TodoItemEntity,
      UserProfileEntity,
    ]),
  ],
  controllers: [
    UserTargetsController,
    StudyPlansController,
    WeeklyPlansController,
    DailyPlansController,
  ],
  providers: [PlansRepository, PlansService],
  exports: [PlansRepository],
})
export class PlansModule {}
