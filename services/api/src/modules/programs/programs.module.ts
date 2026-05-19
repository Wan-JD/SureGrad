import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookEntity } from '../../database/entities/book.entity';
import { ProgramAdmissionEntity } from '../../database/entities/program-admission.entity';
import { ProgramApplicationStatEntity } from '../../database/entities/program-application-stat.entity';
import { ProgramExamSubjectEntity } from '../../database/entities/program-exam-subject.entity';
import { ProgramInterviewStatEntity } from '../../database/entities/program-interview-stat.entity';
import { ProgramReferenceBookEntity } from '../../database/entities/program-reference-book.entity';
import { ProgramScoreLineEntity } from '../../database/entities/program-score-line.entity';
import { ProgramSourceLinkEntity } from '../../database/entities/program-source-link.entity';
import { ProgramEntity } from '../../database/entities/program.entity';
import { SubjectEntity } from '../../database/entities/subject.entity';
import { ProgramsController } from './programs.controller';
import { ProgramsRepository } from './repositories/programs.repository';
import { ProgramsService } from './programs.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProgramEntity,
      ProgramAdmissionEntity,
      ProgramScoreLineEntity,
      ProgramApplicationStatEntity,
      ProgramInterviewStatEntity,
      ProgramExamSubjectEntity,
      SubjectEntity,
      BookEntity,
      ProgramReferenceBookEntity,
      ProgramSourceLinkEntity,
    ]),
  ],
  controllers: [ProgramsController],
  providers: [ProgramsRepository, ProgramsService],
})
export class ProgramsModule {}
