import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepartmentEntity } from '../../database/entities/department.entity';
import { ProgramApplicationStatEntity } from '../../database/entities/program-application-stat.entity';
import { ProgramInterviewStatEntity } from '../../database/entities/program-interview-stat.entity';
import { ProgramScoreLineEntity } from '../../database/entities/program-score-line.entity';
import { ProgramEntity } from '../../database/entities/program.entity';
import { SchoolEntity } from '../../database/entities/school.entity';
import { SchoolsRepository } from './repositories/schools.repository';
import { SchoolsController } from './schools.controller';
import { SchoolsService } from './schools.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SchoolEntity,
      DepartmentEntity,
      ProgramEntity,
      ProgramScoreLineEntity,
      ProgramApplicationStatEntity,
      ProgramInterviewStatEntity,
    ]),
  ],
  controllers: [SchoolsController],
  providers: [SchoolsRepository, SchoolsService],
  exports: [SchoolsService],
})
export class SchoolsModule {}
