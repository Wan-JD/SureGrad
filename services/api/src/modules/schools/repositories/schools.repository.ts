import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { DepartmentEntity } from '../../../database/entities/department.entity';
import { ProgramApplicationStatEntity } from '../../../database/entities/program-application-stat.entity';
import { ProgramInterviewStatEntity } from '../../../database/entities/program-interview-stat.entity';
import { ProgramScoreLineEntity } from '../../../database/entities/program-score-line.entity';
import { ProgramEntity } from '../../../database/entities/program.entity';
import { SchoolEntity } from '../../../database/entities/school.entity';

export interface SchoolQueryParams {
  q?: string;
  province?: string;
  city?: string;
  schoolLevel?: string;
  schoolType?: string;
  disciplineCategory?: string;
  degreeType?: string;
  examMathRequired?: boolean;
  examYear?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page: number;
  pageSize: number;
}

export interface SchoolProgramsQueryParams {
  departmentId?: string;
  degreeType?: string;
  disciplineCategory?: string;
  examMathRequired?: boolean;
  examYear?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page: number;
  pageSize: number;
}

@Injectable()
export class SchoolsRepository {
  constructor(
    @InjectRepository(SchoolEntity)
    private readonly schoolsRepository: Repository<SchoolEntity>,
    @InjectRepository(DepartmentEntity)
    private readonly departmentsRepository: Repository<DepartmentEntity>,
    @InjectRepository(ProgramEntity)
    private readonly programsRepository: Repository<ProgramEntity>,
    @InjectRepository(ProgramScoreLineEntity)
    private readonly scoreLinesRepository: Repository<ProgramScoreLineEntity>,
    @InjectRepository(ProgramApplicationStatEntity)
    private readonly applicationStatsRepository: Repository<ProgramApplicationStatEntity>,
    @InjectRepository(ProgramInterviewStatEntity)
    private readonly interviewStatsRepository: Repository<ProgramInterviewStatEntity>,
  ) {}

  findSchoolById(schoolId: string) {
    return this.schoolsRepository.findOne({
      where: {
        id: schoolId,
        status: 'active',
      },
    });
  }

  findDepartmentById(departmentId: string) {
    return this.departmentsRepository.findOne({
      where: {
        id: departmentId,
        status: 'active',
      },
    });
  }

  async findSchools(params: SchoolQueryParams) {
    const query = this.schoolsRepository
      .createQueryBuilder('school')
      .where('school.status = :status', { status: 'active' })
      .andWhere('school.deletedAt IS NULL');

    if (params.q) {
      query
        .leftJoin(
          DepartmentEntity,
          'department',
          'department.schoolId = school.id AND department.deletedAt IS NULL AND department.status = :departmentStatus',
          { departmentStatus: 'active' },
        )
        .leftJoin(
          ProgramEntity,
          'program',
          'program.schoolId = school.id AND program.deletedAt IS NULL AND program.status = :programStatus',
          { programStatus: 'active' },
        )
        .andWhere(
          `(school.name ILIKE :keyword OR department.name ILIKE :keyword OR program.name ILIKE :keyword)`,
          { keyword: `%${params.q}%` },
        );
    }

    if (params.province) {
      query.andWhere('school.province = :province', {
        province: params.province,
      });
    }

    if (params.city) {
      query.andWhere('school.city = :city', {
        city: params.city,
      });
    }

    if (params.schoolLevel) {
      query.andWhere('school.schoolLevel = :schoolLevel', {
        schoolLevel: params.schoolLevel,
      });
    }

    if (params.schoolType) {
      query.andWhere('school.schoolType = :schoolType', {
        schoolType: params.schoolType,
      });
    }

    if (
      params.disciplineCategory ||
      params.degreeType ||
      params.examMathRequired !== undefined
    ) {
      query.andWhere((subQuery) => {
        const programQuery = subQuery
          .subQuery()
          .select('program_scope.schoolId')
          .from(ProgramEntity, 'program_scope')
          .where('program_scope.schoolId = school.id')
          .andWhere('program_scope.deletedAt IS NULL')
          .andWhere('program_scope.status = :programStatus');

        if (params.disciplineCategory) {
          programQuery.andWhere(
            'program_scope.disciplineCategory = :disciplineCategory',
            {
              disciplineCategory: params.disciplineCategory,
            },
          );
        }

        if (params.degreeType) {
          programQuery.andWhere('program_scope.degreeType = :degreeType', {
            degreeType: params.degreeType,
          });
        }

        if (params.examMathRequired !== undefined) {
          programQuery.andWhere(
            'program_scope.examMathRequired = :examMathRequired',
            {
              examMathRequired: params.examMathRequired,
            },
          );
        }

        return `EXISTS ${programQuery.getQuery()}`;
      });
    }

    this.applySchoolSort(
      query,
      params.sortBy,
      params.sortOrder,
      params.examYear,
    );

    const [items, total] = await query
      .skip((params.page - 1) * params.pageSize)
      .take(params.pageSize)
      .getManyAndCount();

    return { items, total };
  }

  async getSchoolPrograms(schoolId: string, params: SchoolProgramsQueryParams) {
    const query = this.programsRepository
      .createQueryBuilder('program')
      .leftJoinAndSelect('program.department', 'department')
      .where('program.schoolId = :schoolId', { schoolId })
      .andWhere('program.status = :status', { status: 'active' })
      .andWhere('program.deletedAt IS NULL')
      .andWhere('department.deletedAt IS NULL')
      .andWhere('department.status = :departmentStatus', {
        departmentStatus: 'active',
      });

    if (params.departmentId) {
      query.andWhere('program.departmentId = :departmentId', {
        departmentId: params.departmentId,
      });
    }

    if (params.degreeType) {
      query.andWhere('program.degreeType = :degreeType', {
        degreeType: params.degreeType,
      });
    }

    if (params.disciplineCategory) {
      query.andWhere('program.disciplineCategory = :disciplineCategory', {
        disciplineCategory: params.disciplineCategory,
      });
    }

    if (params.examMathRequired !== undefined) {
      query.andWhere('program.examMathRequired = :examMathRequired', {
        examMathRequired: params.examMathRequired,
      });
    }

    this.applyProgramSort(
      query,
      params.sortBy,
      params.sortOrder,
      params.examYear,
    );

    const [items, total] = await query
      .skip((params.page - 1) * params.pageSize)
      .take(params.pageSize)
      .getManyAndCount();

    return { items, total };
  }

  countProgramsBySchool(schoolId: string) {
    return this.programsRepository.count({
      where: {
        schoolId,
        status: 'active',
      },
    });
  }

  getHotProgramsBySchool(schoolId: string) {
    return this.programsRepository.find({
      where: {
        schoolId,
        status: 'active',
      },
      relations: {
        department: true,
      },
      take: 5,
      order: {
        updatedAt: 'DESC',
      },
    });
  }

  getMatchedProgramsForSchools(schoolIds: string[], keyword?: string) {
    if (schoolIds.length === 0) {
      return Promise.resolve(new Map<string, ProgramEntity[]>());
    }

    const query = this.programsRepository
      .createQueryBuilder('program')
      .where('program.schoolId IN (:...schoolIds)', { schoolIds })
      .andWhere('program.status = :status', { status: 'active' })
      .andWhere('program.deletedAt IS NULL')
      .orderBy('program.updatedAt', 'DESC');

    if (keyword) {
      query.andWhere('program.name ILIKE :keyword', {
        keyword: `%${keyword}%`,
      });
    }

    return query.getMany().then((programs) => {
      const grouped = new Map<string, ProgramEntity[]>();
      for (const program of programs) {
        const current = grouped.get(program.schoolId) ?? [];
        if (current.length < 3) {
          current.push(program);
          grouped.set(program.schoolId, current);
        }
      }

      return grouped;
    });
  }

  getLatestScoreLineSummaries(programIds: string[], examYear?: number) {
    return this.getLatestMetricMap<ProgramScoreLineEntity>(
      this.scoreLinesRepository,
      'score',
      programIds,
      'score.programId',
      examYear,
    );
  }

  getLatestApplicationRatioSummaries(programIds: string[], examYear?: number) {
    return this.getLatestMetricMap<ProgramApplicationStatEntity>(
      this.applicationStatsRepository,
      'application',
      programIds,
      'application.programId',
      examYear,
    );
  }

  getLatestInterviewRatioSummaries(programIds: string[], examYear?: number) {
    return this.getLatestMetricMap<ProgramInterviewStatEntity>(
      this.interviewStatsRepository,
      'interview',
      programIds,
      'interview.programId',
      examYear,
    );
  }

  private applySchoolSort(
    query: SelectQueryBuilder<SchoolEntity>,
    sortBy?: string,
    sortOrder: 'asc' | 'desc' = 'desc',
    examYear?: number,
  ) {
    const direction = sortOrder.toUpperCase() as 'ASC' | 'DESC';

    switch (sortBy) {
      case 'updated_at':
        query.orderBy('school.updatedAt', direction);
        break;
      case 'score_line':
        query
          .addSelect(
            (subQuery) =>
              subQuery
                .select('MAX(score.totalScore)')
                .from(ProgramScoreLineEntity, 'score')
                .innerJoin(
                  ProgramEntity,
                  'score_program',
                  'score_program.id = score.programId',
                )
                .where('score_program.schoolId = school.id')
                .andWhere('score_program.deletedAt IS NULL')
                .andWhere('score_program.status = :programStatus')
                .andWhere(examYear ? 'score.examYear = :examYear' : '1 = 1'),
            'score_metric',
          )
          .orderBy('score_metric', direction, 'NULLS LAST')
          .addOrderBy('school.sortOrder', 'DESC')
          .addOrderBy('school.updatedAt', 'DESC');
        break;
      case 'application_ratio':
        query
          .addSelect(
            (subQuery) =>
              subQuery
                .select('MAX(application.applicationRatio)')
                .from(ProgramApplicationStatEntity, 'application')
                .innerJoin(
                  ProgramEntity,
                  'application_program',
                  'application_program.id = application.programId',
                )
                .where('application_program.schoolId = school.id')
                .andWhere('application_program.deletedAt IS NULL')
                .andWhere('application_program.status = :programStatus')
                .andWhere(
                  examYear ? 'application.examYear = :examYear' : '1 = 1',
                ),
            'application_metric',
          )
          .orderBy('application_metric', direction, 'NULLS LAST')
          .addOrderBy('school.sortOrder', 'DESC')
          .addOrderBy('school.updatedAt', 'DESC');
        break;
      case 'recommended':
      case undefined:
        query
          .orderBy('school.sortOrder', 'DESC')
          .addOrderBy('school.updatedAt', 'DESC');
        break;
      default:
        query
          .orderBy('school.sortOrder', 'DESC')
          .addOrderBy('school.updatedAt', 'DESC');
        break;
    }
  }

  private applyProgramSort(
    query: SelectQueryBuilder<ProgramEntity>,
    sortBy?: string,
    sortOrder: 'asc' | 'desc' = 'desc',
    examYear?: number,
  ) {
    const direction = sortOrder.toUpperCase() as 'ASC' | 'DESC';
    switch (sortBy) {
      case 'tuition':
        query.orderBy('program.tuitionPerYear', direction);
        break;
      case 'score_line':
        query
          .addSelect(
            (subQuery) =>
              subQuery
                .select('MAX(score.totalScore)')
                .from(ProgramScoreLineEntity, 'score')
                .where('score.programId = program.id')
                .andWhere(examYear ? 'score.examYear = :examYear' : '1 = 1'),
            'score_metric',
          )
          .orderBy('score_metric', direction, 'NULLS LAST')
          .addOrderBy('program.updatedAt', 'DESC')
          .addOrderBy('program.name', 'ASC');
        break;
      case 'application_ratio':
        query
          .addSelect(
            (subQuery) =>
              subQuery
                .select('MAX(application.applicationRatio)')
                .from(ProgramApplicationStatEntity, 'application')
                .where('application.programId = program.id')
                .andWhere(
                  examYear ? 'application.examYear = :examYear' : '1 = 1',
                ),
            'application_metric',
          )
          .orderBy('application_metric', direction, 'NULLS LAST')
          .addOrderBy('program.updatedAt', 'DESC')
          .addOrderBy('program.name', 'ASC');
        break;
      case 'recommended':
      case undefined:
        query
          .orderBy('program.updatedAt', 'DESC')
          .addOrderBy('program.name', 'ASC');
        break;
      default:
        query
          .orderBy('program.updatedAt', 'DESC')
          .addOrderBy('program.name', 'ASC');
        break;
    }
  }

  private async getLatestMetricMap<
    T extends { programId: string; examYear: number },
  >(
    repository:
      | Repository<ProgramScoreLineEntity>
      | Repository<ProgramApplicationStatEntity>
      | Repository<ProgramInterviewStatEntity>,
    alias: string,
    programIds: string[],
    programIdColumn: string,
    examYear?: number,
  ) {
    if (programIds.length === 0) {
      return new Map<string, T>();
    }

    const query = repository
      .createQueryBuilder(alias)
      .where(`${programIdColumn} IN (:...programIds)`, { programIds });

    if (examYear) {
      query.andWhere(`${alias}.examYear = :examYear`, { examYear });
    }

    query.orderBy(`${alias}.examYear`, 'DESC');

    const rows = (await query.getMany()) as unknown as T[];
    const summaries = new Map<string, T>();

    for (const row of rows) {
      if (!summaries.has(row.programId)) {
        summaries.set(row.programId, row);
      }
    }

    return summaries;
  }
}
