import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { FavoriteEntity } from '../../../database/entities/favorite.entity';
import { ProgramApplicationStatEntity } from '../../../database/entities/program-application-stat.entity';
import { ProgramInterviewStatEntity } from '../../../database/entities/program-interview-stat.entity';
import { ProgramScoreLineEntity } from '../../../database/entities/program-score-line.entity';
import { ProgramEntity } from '../../../database/entities/program.entity';
import { SchoolEntity } from '../../../database/entities/school.entity';

export type FavoriteTargetType = 'school' | 'program' | 'resource';

export interface FavoriteQueryParams {
  userId: string;
  targetType?: FavoriteTargetType;
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder: 'asc' | 'desc';
}

export interface FavoriteListItem {
  favoriteId: string;
  targetType: FavoriteTargetType;
  targetId: string;
  createdAt: string;
  targetSummary:
    | SchoolFavoriteTargetSummary
    | ProgramFavoriteTargetSummary
    | ResourceFavoriteTargetSummary
    | null;
}

export interface SchoolFavoriteTargetSummary {
  schoolId: string;
  schoolName: string;
  province: string;
  city: string;
  schoolLevel: string;
  schoolType: string;
}

export interface ProgramFavoriteTargetSummary {
  programId: string;
  programName: string;
  schoolId: string;
  schoolName: string;
  departmentId: string;
  departmentName: string;
  degreeType: 'academic' | 'professional';
  disciplineCategory: string;
  researchDirection: string | null;
  tuitionPerYear: number;
  city: string;
  latestScoreLineSummary: {
    examYear: number;
    totalScore: number;
    scoreLineType: string;
  } | null;
  latestApplicationRatioSummary: {
    examYear: number;
    applicationRatio: number;
    applicantCount: number;
    admittedCount: number;
  } | null;
  latestInterviewRatioSummary: {
    examYear: number;
    interviewRatio: number;
    retestCandidateCount: number;
    finalAdmittedCount: number;
  } | null;
}

export interface ResourceFavoriteTargetSummary {
  resourceId: string;
  title: string;
  resourceType: string;
  stageTag: string;
  providerName: string;
  summary: string | null;
  sourceUrl: string;
  isPublicLegal: boolean;
}

@Injectable()
export class FavoritesRepository {
  constructor(
    @InjectRepository(FavoriteEntity)
    private readonly favoritesRepository: Repository<FavoriteEntity>,
    @InjectRepository(SchoolEntity)
    private readonly schoolsRepository: Repository<SchoolEntity>,
    @InjectRepository(ProgramEntity)
    private readonly programsRepository: Repository<ProgramEntity>,
    @InjectRepository(ProgramScoreLineEntity)
    private readonly scoreLinesRepository: Repository<ProgramScoreLineEntity>,
    @InjectRepository(ProgramApplicationStatEntity)
    private readonly applicationStatsRepository: Repository<ProgramApplicationStatEntity>,
    @InjectRepository(ProgramInterviewStatEntity)
    private readonly interviewStatsRepository: Repository<ProgramInterviewStatEntity>,
    private readonly dataSource: DataSource,
  ) {}

  findFavoriteByUserAndTarget(
    userId: string,
    targetType: FavoriteTargetType,
    targetId: string,
  ) {
    return this.favoritesRepository.findOne({
      where: {
        userId,
        targetType,
        targetId,
      },
    });
  }

  async findFavoritedTargetIds(
    userId: string,
    targetType: FavoriteTargetType,
    targetIds: string[],
  ): Promise<Set<string>> {
    if (targetIds.length === 0) {
      return new Set();
    }

    const rows = await this.favoritesRepository
      .createQueryBuilder('favorite')
      .select('favorite.targetId', 'targetId')
      .where('favorite.userId = :userId', { userId })
      .andWhere('favorite.targetType = :targetType', { targetType })
      .andWhere('favorite.targetId IN (:...targetIds)', { targetIds })
      .getRawMany<{ targetId: string }>();

    return new Set(rows.map((row) => row.targetId));
  }

  async ensureTargetExists(targetType: FavoriteTargetType, targetId: string) {
    switch (targetType) {
      case 'school':
        return (
          (await this.schoolsRepository.count({
            where: {
              id: targetId,
              status: 'active',
            },
          })) > 0
        );
      case 'program':
        return (
          (await this.programsRepository
            .createQueryBuilder('program')
            .innerJoin('program.school', 'school')
            .innerJoin('program.department', 'department')
            .where('program.id = :targetId', { targetId })
            .andWhere('program.status = :programStatus', {
              programStatus: 'active',
            })
            .andWhere('program.deletedAt IS NULL')
            .andWhere('school.status = :schoolStatus', {
              schoolStatus: 'active',
            })
            .andWhere('school.deletedAt IS NULL')
            .andWhere('department.status = :departmentStatus', {
              departmentStatus: 'active',
            })
            .andWhere('department.deletedAt IS NULL')
            .getCount()) > 0
        );
      case 'resource':
        return (
          (await this.dataSource
            .createQueryBuilder()
            .select('resource.id', 'id')
            .from('study_resources', 'resource')
            .where('resource.id = :targetId', { targetId })
            .andWhere('resource.status = :status', { status: 'active' })
            .andWhere('resource.is_public_legal = :isPublicLegal', {
              isPublicLegal: true,
            })
            .getRawOne<{ id: string }>()) !== null
        );
    }
  }

  createFavorite(input: {
    userId: string;
    targetType: FavoriteTargetType;
    targetId: string;
  }) {
    return this.favoritesRepository.create(input);
  }

  saveFavorite(favorite: FavoriteEntity) {
    return this.favoritesRepository.save(favorite);
  }

  async removeFavorite(favorite: FavoriteEntity) {
    await this.favoritesRepository.remove(favorite);
  }

  async findFavorites(params: FavoriteQueryParams) {
    const query = this.favoritesRepository
      .createQueryBuilder('favorite')
      .where('favorite.userId = :userId', { userId: params.userId });

    if (params.targetType) {
      query.andWhere('favorite.targetType = :targetType', {
        targetType: params.targetType,
      });
    }

    query
      .orderBy(
        'favorite.createdAt',
        params.sortOrder.toUpperCase() as 'ASC' | 'DESC',
      )
      .addOrderBy('favorite.id', 'DESC');

    const [favorites, total] = await query
      .skip((params.page - 1) * params.pageSize)
      .take(params.pageSize)
      .getManyAndCount();

    const [schoolSummaryMap, programSummaryMap, resourceSummaryMap] =
      await Promise.all([
        this.getSchoolSummaryMap(
          favorites
            .filter((item) => item.targetType === 'school')
            .map((item) => item.targetId),
        ),
        this.getProgramSummaryMap(
          favorites
            .filter((item) => item.targetType === 'program')
            .map((item) => item.targetId),
        ),
        this.getResourceSummaryMap(
          favorites
            .filter((item) => item.targetType === 'resource')
            .map((item) => item.targetId),
        ),
      ]);

    return {
      items: favorites.map<FavoriteListItem>((favorite) => ({
        favoriteId: favorite.id,
        targetType: favorite.targetType,
        targetId: favorite.targetId,
        createdAt: favorite.createdAt.toISOString(),
        targetSummary:
          favorite.targetType === 'school'
            ? (schoolSummaryMap.get(favorite.targetId) ?? null)
            : favorite.targetType === 'program'
              ? (programSummaryMap.get(favorite.targetId) ?? null)
              : (resourceSummaryMap.get(favorite.targetId) ?? null),
      })),
      total,
    };
  }

  private async getSchoolSummaryMap(schoolIds: string[]) {
    if (schoolIds.length === 0) {
      return new Map<string, SchoolFavoriteTargetSummary>();
    }

    const rows = await this.schoolsRepository
      .createQueryBuilder('school')
      .where('school.id IN (:...schoolIds)', { schoolIds })
      .andWhere('school.status = :status', { status: 'active' })
      .andWhere('school.deletedAt IS NULL')
      .getMany();

    return new Map(
      rows.map((school) => [
        school.id,
        {
          schoolId: school.id,
          schoolName: school.name,
          province: school.province,
          city: school.city,
          schoolLevel: school.schoolLevel,
          schoolType: school.schoolType,
        },
      ]),
    );
  }

  private async getProgramSummaryMap(programIds: string[]) {
    if (programIds.length === 0) {
      return new Map<string, ProgramFavoriteTargetSummary>();
    }

    const [
      programs,
      scoreSummaryMap,
      applicationSummaryMap,
      interviewSummaryMap,
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
      this.getLatestMetricMap<ProgramScoreLineEntity>(
        this.scoreLinesRepository,
        'score',
        programIds,
      ),
      this.getLatestMetricMap<ProgramApplicationStatEntity>(
        this.applicationStatsRepository,
        'application',
        programIds,
      ),
      this.getLatestMetricMap<ProgramInterviewStatEntity>(
        this.interviewStatsRepository,
        'interview',
        programIds,
      ),
    ]);

    return new Map(
      programs.map((program) => [
        program.id,
        {
          programId: program.id,
          programName: program.name,
          schoolId: program.school.id,
          schoolName: program.school.name,
          departmentId: program.department.id,
          departmentName: program.department.name,
          degreeType: program.degreeType,
          disciplineCategory: program.disciplineCategory,
          researchDirection: program.researchDirection,
          tuitionPerYear: program.tuitionPerYear,
          city: program.school.city,
          latestScoreLineSummary: this.toScoreLineSummary(
            scoreSummaryMap.get(program.id),
          ),
          latestApplicationRatioSummary: this.toApplicationSummary(
            applicationSummaryMap.get(program.id),
          ),
          latestInterviewRatioSummary: this.toInterviewSummary(
            interviewSummaryMap.get(program.id),
          ),
        },
      ]),
    );
  }

  private async getResourceSummaryMap(resourceIds: string[]) {
    if (resourceIds.length === 0) {
      return new Map<string, ResourceFavoriteTargetSummary>();
    }

    const rows = await this.dataSource
      .createQueryBuilder()
      .select([
        'resource.id AS "resourceId"',
        'resource.title AS "title"',
        'resource.resource_type AS "resourceType"',
        'resource.stage_tag AS "stageTag"',
        'resource.provider_name AS "providerName"',
        'resource.summary AS "summary"',
        'resource.source_url AS "sourceUrl"',
        'resource.is_public_legal AS "isPublicLegal"',
      ])
      .from('study_resources', 'resource')
      .where('resource.id IN (:...resourceIds)', { resourceIds })
      .andWhere('resource.status = :status', { status: 'active' })
      .andWhere('resource.is_public_legal = :isPublicLegal', {
        isPublicLegal: true,
      })
      .getRawMany<ResourceFavoriteTargetSummary>();

    return new Map(
      rows.map((resource) => [
        resource.resourceId,
        {
          resourceId: resource.resourceId,
          title: resource.title,
          resourceType: resource.resourceType,
          stageTag: resource.stageTag,
          providerName: resource.providerName,
          summary: resource.summary,
          sourceUrl: resource.sourceUrl,
          isPublicLegal: resource.isPublicLegal,
        },
      ]),
    );
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
  ) {
    if (programIds.length === 0) {
      return new Map<string, T>();
    }

    const query = repository
      .createQueryBuilder(alias)
      .where(`${alias}.programId IN (:...programIds)`, { programIds })
      .orderBy(`${alias}.examYear`, 'DESC');

    if (alias === 'score') {
      query.addOrderBy(
        `CASE
          WHEN score.scoreLineType = 'school' THEN 0
          WHEN score.scoreLineType = 'retest' THEN 1
          WHEN score.scoreLineType = 'national_a' THEN 2
          WHEN score.scoreLineType = 'national_b' THEN 3
          ELSE 4
        END`,
        'ASC',
      );
    }

    query.addOrderBy(`${alias}.updatedAt`, 'DESC');

    const rows = (await query.getMany()) as unknown as T[];
    const latestMetricMap = new Map<string, T>();

    for (const row of rows) {
      if (!latestMetricMap.has(row.programId)) {
        latestMetricMap.set(row.programId, row);
      }
    }

    return latestMetricMap;
  }

  private toScoreLineSummary(
    scoreLine:
      | {
          examYear: number;
          totalScore: number;
          scoreLineType: string;
        }
      | undefined,
  ) {
    if (!scoreLine) {
      return null;
    }

    return {
      examYear: scoreLine.examYear,
      totalScore: scoreLine.totalScore,
      scoreLineType: scoreLine.scoreLineType,
    };
  }

  private toApplicationSummary(
    applicationStat:
      | {
          examYear: number;
          applicationRatio: number;
          applicantCount: number;
          admittedCount: number;
        }
      | undefined,
  ) {
    if (!applicationStat) {
      return null;
    }

    return {
      examYear: applicationStat.examYear,
      applicationRatio: applicationStat.applicationRatio,
      applicantCount: applicationStat.applicantCount,
      admittedCount: applicationStat.admittedCount,
    };
  }

  private toInterviewSummary(
    interviewStat:
      | {
          examYear: number;
          interviewRatio: number;
          retestCandidateCount: number;
          finalAdmittedCount: number;
        }
      | undefined,
  ) {
    if (!interviewStat) {
      return null;
    }

    return {
      examYear: interviewStat.examYear,
      interviewRatio: interviewStat.interviewRatio,
      retestCandidateCount: interviewStat.retestCandidateCount,
      finalAdmittedCount: interviewStat.finalAdmittedCount,
    };
  }
}
