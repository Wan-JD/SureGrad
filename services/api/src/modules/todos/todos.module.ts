import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DailyPlanEntity } from '../../database/entities/daily-plan.entity';
import { StudyPlanEntity } from '../../database/entities/study-plan.entity';
import { SubjectEntity } from '../../database/entities/subject.entity';
import { TodoItemEntity } from '../../database/entities/todo-item.entity';
import { WeeklyPlanEntity } from '../../database/entities/weekly-plan.entity';
import { PlansModule } from '../plans/plans.module';
import { TodosRepository } from './repositories/todos.repository';
import { TodosController } from './todos.controller';
import { TodosService } from './todos.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TodoItemEntity,
      SubjectEntity,
      StudyPlanEntity,
      WeeklyPlanEntity,
      DailyPlanEntity,
    ]),
    PlansModule,
  ],
  controllers: [TodosController],
  providers: [TodosRepository, TodosService],
})
export class TodosModule {}
