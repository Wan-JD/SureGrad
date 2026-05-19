import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ComparisonItemEntity } from '../../../database/entities/comparison-item.entity';
import { ProgramAdmissionEntity } from '../../../database/entities/program-admission.entity';
import { ProgramApplicationStatEntity } from '../../../database/entities/program-application-stat.entity';
import { ProgramExamSubjectEntity } from '../../../database/entities/program-exam-subject.entity';
import { ProgramInterviewStatEntity } from '../../../database/entities/program-interview-stat.entity';
import { ProgramScoreLineEntity } from '../../../database/entities/program-score-line.entity';
import { ProgramEntity } from '../../../database/entities/program.entity';

export interface ComparisonResultItem {
  targetId: string;
  targetType: 'program';
  schoolName: string;
  programName: string;
  departmentName: string;
  degreeType: 'academic' | 'professional';
  disciplineCategory: string;
  researchDirection: string | null;
  examMathRequired: boolean;
  examYear: number | null;
  totalScore: number | null;
  applicationRatio: number | null;
  interviewRatio: number | null;
  plannedEnrollment: number | null;
  tuitionPerYear: number;
  city: string;
  examSubjects: string[];
  missingFlags: string[];
}

interface ExamSubjectSummary {
  examYear: number;
  examSubjects: string[];
}

@Injectable()
export class ComparisonItemsRepository {
  constructor(
    @InjectRepository(ComparisonItemEntity)
    private readonly comparisonItemsRepository: Repository<ComparisonItemEntity>,
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
  ) {}

  findComparisonItemByUserAndTarget(
    userId: string,
    targetType: 'program',
    targetId: string,
  ) {
    return this.comparisonItemsRepository.findOne({
      where: {
        userId,
        targetType,
        targetId,
      },
    });
  }

  countComparisonItemsByUser(userId: string) {
    return this.comparisonItemsRepository.count({
      where: {
        userId,
        targetType: 'program',
      },
    });
  }

  findProgramById(programId: string) {
    return this.programsRepository
      .createQueryBuilder('program')
      .innerJoin('program.school', 'school')
      .innerJoin('program.department', 'department')
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

  createComparisonItem(input: {
    userId: string;
    targetType: 'program';
    targetId: string;
  }) {
    return this.comparisonItemsRepository.create(input);
  }

  saveComparisonItem(item: ComparisonItemEntity) {
    return this.comparisonItemsRepository.save(item);
  }

  async removeComparisonItem(item: ComparisonItemEntity) {
    await this.comparisonItemsRepository.remove(item);
  }

  async getComparisonResultItems(userId: string, examYear?: number) {
    const comparisonItems = await this.comparisonItemsRepository.find({
      where: {
        userId,
        targetType: 'program',
      },
      order: {
        createdAt: 'ASC',
        id: 'ASC',
      },
    });

    if (comparisonItems.length === 0) {
      return [];
    }

    const programIds = comparisonItems.map((item) => item.targetId);
    const [
      programs,
      scoreLineMap,
      applicationMap,
      interviewMap,
      admissionMap,
      examSubjectMap,
    ] = await Promise.all([
      this.programsRepository
        .createQueryBuilder('program')
        .leftJoinAndSelect('program.school', 'school')
        .leftJoinAndSelect('program.department', 'department')
        .where('program.id IN (:...programIds)', { programIds })
        .andWhere('program.status = :programStatus', {
          programStatus: 'active',
        })
        .andWhere('program.deletedAt IS NULL')
        .andWhere('school.status = :schoolStatus', { schoolStatus: 'active' })
        .andWhere('school.deletedAt IS NULL')
        .andWhere('department.status = :departmentStatus', {
          departmentStatus: 'active',
        })
        .andWhere('department.deletedAt IS NULL')
        .getMany(),
      this.getLatestScoreLineMap(programIds, examYear),
      this.getLatestMetricMap<ProgramApplicationStatEntity>(
        this.applicationStatsRepository,
        'application',
        programIds,
        examYear,
      ),
      this.getLatestMetricMap<ProgramInterviewStatEntity>(
        this.interviewStatsRepository,
        'interview',
        programIds,
        examYear,
      ),
      this.getLatestMetricMap<ProgramAdmissionEntity>(
        this.admissionsRepository,
        'admission',
        programIds,
        examYear,
      ),
      this.getExamSubjectMap(programIds, examYear),
    ]);

    const programMap = new Map(
      programs.map((program) => [program.id, program]),
    );

    return comparisonItems.flatMap<ComparisonResultItem>((item) => {
      const program = programMap.get(item.targetId);
      if (!program) {
        return [];
      }

      const scoreLine = scoreLineMap.get(program.id);
      const application = applicationMap.get(program.id);
      const interview = interviewMap.get(program.id);
      const admission = admissionMap.get(program.id);
      const examSubjectSummary = examSubjectMap.get(program.id);
      const effectiveExamYear = this.resolveEffectiveExamYear({
        requestedExamYear: examYear,
        scoreLine,
        application,
        interview,
        admission,
        examSubjectSummary,
      });

      return [
        {
          targetId: program.id,
          targetType: 'program',
          schoolName: program.school.name,
          programName: program.name,
          departmentName: program.department.name,
          degreeType: program.degreeType,
          disciplineCategory: program.disciplineCategory,
          researchDirection: program.researchDirection,
          examMathRequired: program.examMathRequired,
          examYear: effectiveExamYear,
          totalScore: scoreLine?.totalScore ?? null,
          applicationRatio: application?.applicationRatio ?? null,
          interviewRatio: interview?.interviewRatio ?? null,
          plannedEnrollment: admission?.plannedEnrollment ?? null,
          tuitionPerYear: program.tuitionPerYear,
          city: program.school.city,
          examSubjects: examSubjectSummary?.examSubjects ?? [],
          missingFlags: this.buildMissingFlags({
            scoreLine,
            application,
            interview,
            admission,
            examSubjects: examSubjectSummary?.examSubjects ?? [],
          }),
        },
      ];
    });
  }

  private async getLatestScoreLineMap(programIds: string[], examYear?: number) {
    if (programIds.length === 0) {
      return new Map<string, ProgramScoreLineEntity>();
    }

    const query = this.scoreLinesRepository
      .createQueryBuilder('score')
      .where('score.programId IN (:...programIds)', { programIds });

    if (examYear) {
      query.andWhere('score.examYear = :examYear', { examYear });
    }

    query
      .orderBy('score.examYear', 'DESC')
      .addOrderBy(
        `CASE
          WHEN score.scoreLineType = 'school' THEN 0
          WHEN score.scoreLineType = 'retest' THEN 1
          WHEN score.scoreLineType = 'national_a' THEN 2
          WHEN score.scoreLineType = 'national_b' THEN 3
          ELSE 4
        END`,
        'ASC',
      )
      .addOrderBy('score.updatedAt', 'DESC');

    const rows = await query.getMany();
    const latestScoreLineMap = new Map<string, ProgramScoreLineEntity>();

    for (const row of rows) {
      if (!latestScoreLineMap.has(row.programId)) {
        latestScoreLineMap.set(row.programId, row);
      }
    }

    return latestScoreLineMap;
  }

  private async getLatestMetricMap<
    T extends { programId: string; examYear: number },
  >(
    repository:
      | Repository<ProgramAdmissionEntity>
      | Repository<ProgramApplicationStatEntity>
      | Repository<ProgramInterviewStatEntity>,
    alias: string,
    programIds: string[],
    examYear?: number,
  ) {
    if (programIds.length === 0) {
      return new Map<string, T>();
    }

    const query = repository
      .createQueryBuilder(alias)
      .where(`${alias}.programId IN (:...programIds)`, { programIds });

    if (examYear) {
      query.andWhere(`${alias}.examYear = :examYear`, { examYear });
    }

    query
      .orderBy(`${alias}.examYear`, 'DESC')
      .addOrderBy(`${alias}.updatedAt`, 'DESC');

    const rows = (await query.getMany()) as unknown as T[];
    const latestMetricMap = new Map<string, T>();

    for (const row of rows) {
      if (!latestMetricMap.has(row.programId)) {
        latestMetricMap.set(row.programId, row);
      }
    }

    return latestMetricMap;
  }

  private async getExamSubjectMap(programIds: string[], examYear?: number) {
    if (programIds.length === 0) {
      return new Map<string, ExamSubjectSummary>();
    }

    const query = this.examSubjectsRepository
      .createQueryBuilder('examSubject')
      .where('examSubject.programId IN (:...programIds)', { programIds });

    if (examYear) {
      query.andWhere('examSubject.examYear = :examYear', { examYear });
    }

    query
      .orderBy('examSubject.examYear', 'DESC')
      .addOrderBy('examSubject.sequenceNo', 'ASC')
      .addOrderBy('examSubject.updatedAt', 'DESC');

    const rows = await query.getMany();
    const examSubjectMap = new Map<string, ExamSubjectSummary>();

    for (const row of rows) {
      const current = examSubjectMap.get(row.programId);
      if (!current) {
        examSubjectMap.set(row.programId, {
          examYear: row.examYear,
          examSubjects: [`${row.subjectCodeText} ${row.subjectNameText}`],
        });
        continue;
      }

      if (current.examYear === row.examYear) {
        current.examSubjects.push(
          `${row.subjectCodeText} ${row.subjectNameText}`,
        );
      }
    }

    return examSubjectMap;
  }

  private resolveEffectiveExamYear(input: {
    requestedExamYear?: number;
    scoreLine?: { examYear: number } | undefined;
    application?: { examYear: number } | undefined;
    interview?: { examYear: number } | undefined;
    admission?: { examYear: number } | undefined;
    examSubjectSummary?: ExamSubjectSummary | undefined;
  }) {
    if (input.requestedExamYear) {
      return input.requestedExamYear;
    }

    const years = [
      input.scoreLine?.examYear,
      input.application?.examYear,
      input.interview?.examYear,
      input.admission?.examYear,
      input.examSubjectSummary?.examYear,
    ].filter((value): value is number => typeof value === 'number');

    if (years.length === 0) {
      return null;
    }

    return Math.max(...years);
  }

  private buildMissingFlags(input: {
    scoreLine?: ProgramScoreLineEntity;
    application?: ProgramApplicationStatEntity;
    interview?: ProgramInterviewStatEntity;
    admission?: ProgramAdmissionEntity;
    examSubjects: string[];
  }) {
    const missingFlags: string[] = [];

    if (!input.scoreLine) {
      missingFlags.push('score_line');
    }

    if (!input.application) {
      missingFlags.push('application_ratio');
    }

    if (!input.interview) {
      missingFlags.push('interview_ratio');
    }

    if (!input.admission) {
      missingFlags.push('planned_enrollment');
    }

    if (input.examSubjects.length === 0) {
      missingFlags.push('exam_subjects');
    }

    return missingFlags;
  }
}
