import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComparisonItemEntity } from '../../database/entities/comparison-item.entity';
import { ProgramAdmissionEntity } from '../../database/entities/program-admission.entity';
import { ProgramApplicationStatEntity } from '../../database/entities/program-application-stat.entity';
import { ProgramExamSubjectEntity } from '../../database/entities/program-exam-subject.entity';
import { ProgramInterviewStatEntity } from '../../database/entities/program-interview-stat.entity';
import { ProgramScoreLineEntity } from '../../database/entities/program-score-line.entity';
import { ProgramEntity } from '../../database/entities/program.entity';
import { ComparisonItemsController } from './comparison-items.controller';
import { ComparisonItemsRepository } from './repositories/comparison-items.repository';
import { ComparisonItemsService } from './comparison-items.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ComparisonItemEntity,
      ProgramEntity,
      ProgramAdmissionEntity,
      ProgramScoreLineEntity,
      ProgramApplicationStatEntity,
      ProgramInterviewStatEntity,
      ProgramExamSubjectEntity,
    ]),
  ],
  controllers: [ComparisonItemsController],
  providers: [ComparisonItemsRepository, ComparisonItemsService],
  exports: [ComparisonItemsRepository],
})
export class ComparisonItemsModule {}
