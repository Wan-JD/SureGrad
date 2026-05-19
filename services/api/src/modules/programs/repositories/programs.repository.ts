import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, In, IsNull, Repository } from 'typeorm';
import { ProgramAdmissionEntity } from '../../../database/entities/program-admission.entity';
import { ProgramApplicationStatEntity } from '../../../database/entities/program-application-stat.entity';
import { ProgramExamSubjectEntity } from '../../../database/entities/program-exam-subject.entity';
import { ProgramInterviewStatEntity } from '../../../database/entities/program-interview-stat.entity';
import { ProgramReferenceBookEntity } from '../../../database/entities/program-reference-book.entity';
import { ProgramScoreLineEntity } from '../../../database/entities/program-score-line.entity';
import { ProgramSourceLinkEntity } from '../../../database/entities/program-source-link.entity';
import { ProgramEntity } from '../../../database/entities/program.entity';

@Injectable()
export class ProgramsRepository {
  constructor(
    @InjectRepository(ProgramEntity)
    private readonly programsRepository: Repository<ProgramEntity>,
    @InjectRepository(ProgramAdmissionEntity)
    private readonly admissionsRepository: Repository<ProgramAdmissionEntity>,
    @InjectRepository(ProgramScoreLineEntity)
    private readonly scoreLinesRepository: Repository<ProgramScoreLineEntity>,
    @InjectRepository(ProgramApplicationStatEntity)
    private readonly applicationStatsRepository: Repository<ProgramApplicationStatEntity>,
    @InjectRepository(ProgramInterviewStatEntity)
    private readonly interviewStatsRepository: Repository<ProgramInterviewStatEntity>,
    @InjectRepository(ProgramExamSubjectEntity)
    private readonly examSubjectsRepository: Repository<ProgramExamSubjectEntity>,
    @InjectRepository(ProgramReferenceBookEntity)
    private readonly referenceBooksRepository: Repository<ProgramReferenceBookEntity>,
    @InjectRepository(ProgramSourceLinkEntity)
    private readonly sourceLinksRepository: Repository<ProgramSourceLinkEntity>,
  ) {}

  findProgramById(programId: string) {
    return this.programsRepository
      .createQueryBuilder('program')
      .leftJoinAndSelect('program.school', 'school')
      .leftJoinAndSelect('program.department', 'department')
      .where('program.id = :programId', { programId })
      .andWhere('program.status = :programStatus', { programStatus: 'active' })
      .andWhere('program.deletedAt IS NULL')
      .andWhere('school.status = :schoolStatus', { schoolStatus: 'active' })
      .andWhere('school.deletedAt IS NULL')
      .andWhere('department.status = :departmentStatus', {
        departmentStatus: 'active',
      })
      .andWhere('department.deletedAt IS NULL')
      .getOne();
  }

  async getAvailableExamYears(programId: string) {
    const yearCollections = await Promise.all([
      this.getDistinctExamYears(
        this.admissionsRepository,
        'admission',
        programId,
      ),
      this.getDistinctExamYears(
        this.scoreLinesRepository,
        'scoreLine',
        programId,
      ),
      this.getDistinctExamYears(
        this.applicationStatsRepository,
        'applicationStat',
        programId,
      ),
      this.getDistinctExamYears(
        this.interviewStatsRepository,
        'interviewStat',
        programId,
      ),
      this.getDistinctExamYears(
        this.examSubjectsRepository,
        'examSubject',
        programId,
      ),
      this.getDistinctExamYears(
        this.referenceBooksRepository,
        'referenceBook',
        programId,
      ),
      this.getDistinctExamYears(
        this.sourceLinksRepository,
        'sourceLink',
        programId,
      ),
    ]);

    return Array.from(new Set(yearCollections.flat())).sort((left, right) => {
      return right - left;
    });
  }

  getProgramAdmissions(programId: string, examYears: number[]) {
    if (examYears.length === 0) {
      return Promise.resolve([]);
    }

    return this.admissionsRepository.find({
      where: {
        programId,
        examYear: In(examYears),
      },
      order: {
        examYear: 'DESC',
        updatedAt: 'DESC',
      },
    });
  }

  getProgramScoreLines(programId: string, examYears: number[]) {
    if (examYears.length === 0) {
      return Promise.resolve([]);
    }

    return this.scoreLinesRepository
      .createQueryBuilder('scoreLine')
      .where('scoreLine.programId = :programId', { programId })
      .andWhere('scoreLine.examYear IN (:...examYears)', { examYears })
      .orderBy('scoreLine.examYear', 'DESC')
      .addOrderBy(
        `CASE
          WHEN scoreLine.scoreLineType = 'school' THEN 0
          WHEN scoreLine.scoreLineType = 'retest' THEN 1
          WHEN scoreLine.scoreLineType = 'national_a' THEN 2
          WHEN scoreLine.scoreLineType = 'national_b' THEN 3
          ELSE 4
        END`,
        'ASC',
      )
      .addOrderBy('scoreLine.updatedAt', 'DESC')
      .getMany();
  }

  getProgramApplicationStats(programId: string, examYears: number[]) {
    if (examYears.length === 0) {
      return Promise.resolve([]);
    }

    return this.applicationStatsRepository.find({
      where: {
        programId,
        examYear: In(examYears),
      },
      order: {
        examYear: 'DESC',
        updatedAt: 'DESC',
      },
    });
  }

  getProgramInterviewStats(programId: string, examYears: number[]) {
    if (examYears.length === 0) {
      return Promise.resolve([]);
    }

    return this.interviewStatsRepository.find({
      where: {
        programId,
        examYear: In(examYears),
      },
      order: {
        examYear: 'DESC',
        updatedAt: 'DESC',
      },
    });
  }

  getProgramExamSubjects(programId: string, examYears: number[]) {
    if (examYears.length === 0) {
      return Promise.resolve([]);
    }

    return this.examSubjectsRepository.find({
      where: {
        programId,
        examYear: In(examYears),
      },
      relations: {
        subject: true,
      },
      order: {
        examYear: 'DESC',
        sequenceNo: 'ASC',
        updatedAt: 'DESC',
      },
    });
  }

  getProgramReferenceBooks(programId: string, examYears: number[]) {
    if (examYears.length === 0) {
      return Promise.resolve([]);
    }

    return this.referenceBooksRepository.find({
      where: {
        programId,
        examYear: In(examYears),
      },
      relations: {
        book: true,
      },
      order: {
        examYear: 'DESC',
        updatedAt: 'DESC',
      },
    });
  }

  getProgramSourceLinks(programId: string, examYears: number[]) {
    const whereClauses: Array<FindOptionsWhere<ProgramSourceLinkEntity>> = [
      {
        programId,
        status: 'active',
        examYear: IsNull(),
      },
    ];

    if (examYears.length > 0) {
      whereClauses.push({
        programId,
        status: 'active',
        examYear: In(examYears),
      });
    }

    return this.sourceLinksRepository.find({
      where: whereClauses,
      order: {
        examYear: 'DESC',
        publishedAt: 'DESC',
        updatedAt: 'DESC',
      },
    });
  }

  private async getDistinctExamYears(
    repository:
      | Repository<ProgramAdmissionEntity>
      | Repository<ProgramScoreLineEntity>
      | Repository<ProgramApplicationStatEntity>
      | Repository<ProgramInterviewStatEntity>
      | Repository<ProgramExamSubjectEntity>
      | Repository<ProgramReferenceBookEntity>
      | Repository<ProgramSourceLinkEntity>,
    alias: string,
    programId: string,
  ) {
    const rawYears = await repository
      .createQueryBuilder(alias)
      .select(`${alias}.examYear`, 'examYear')
      .where(`${alias}.programId = :programId`, { programId })
      .andWhere(`${alias}.examYear IS NOT NULL`)
      .groupBy(`${alias}.examYear`)
      .orderBy(`${alias}.examYear`, 'DESC')
      .getRawMany<{ examYear: string | number }>();

    return rawYears
      .map((item) => Number(item.examYear))
      .filter((item) => Number.isInteger(item));
  }
}
