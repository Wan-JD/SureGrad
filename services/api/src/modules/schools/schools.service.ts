import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { QuerySchoolDetailDto } from './dto/query-school-detail.dto';
import { QuerySchoolProgramsDto } from './dto/query-school-programs.dto';
import { QuerySchoolsDto } from './dto/query-schools.dto';
import { SchoolsRepository } from './repositories/schools.repository';

@Injectable()
export class SchoolsService {
  constructor(private readonly schoolsRepository: SchoolsRepository) {}

  async findAll(query: QuerySchoolsDto) {
    this.assertAllowedSort(query.sortBy, [
      'recommended',
      'score_line',
      'application_ratio',
      'updated_at',
      undefined,
    ]);

    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const { items, total } = await this.schoolsRepository.findSchools({
      ...query,
      page,
      pageSize,
    });

    const schoolIds = items.map((item) => item.id);
    const matchedProgramsMap =
      await this.schoolsRepository.getMatchedProgramsForSchools(
        schoolIds,
        query.q,
      );

    const programIds = [
      ...new Set(
        Array.from(matchedProgramsMap.values())
          .flat()
          .map((program) => program.id),
      ),
    ];

    const [scoreSummaries, applicationSummaries] = await Promise.all([
      this.schoolsRepository.getLatestScoreLineSummaries(
        programIds,
        query.examYear,
      ),
      this.schoolsRepository.getLatestApplicationRatioSummaries(
        programIds,
        query.examYear,
      ),
    ]);

    return {
      items: items.map((school) => {
        const matchedPrograms = matchedProgramsMap.get(school.id) ?? [];
        const scoreLineSummary = this.pickFirstSummary(
          matchedPrograms.map(
            (program) => scoreSummaries.get(program.id) ?? null,
          ),
        );
        const applicationRatioSummary = this.pickFirstSummary(
          matchedPrograms.map(
            (program) => applicationSummaries.get(program.id) ?? null,
          ),
        );

        return {
          schoolId: school.id,
          schoolName: school.name,
          province: school.province,
          city: school.city,
          schoolLevel: school.schoolLevel,
          schoolType: school.schoolType,
          matchedPrograms: matchedPrograms.map((program) => ({
            programId: program.id,
            programName: program.name,
            degreeType: program.degreeType,
          })),
          scoreLineSummary: scoreLineSummary &&
            'totalScore' in scoreLineSummary && {
              examYear: scoreLineSummary.examYear,
              totalScore: scoreLineSummary.totalScore,
              scoreLineType: scoreLineSummary.scoreLineType,
            },
          applicationRatioSummary: applicationRatioSummary &&
            'applicationRatio' in applicationRatioSummary && {
              examYear: applicationRatioSummary.examYear,
              applicationRatio: applicationRatioSummary.applicationRatio,
              applicantCount: applicationRatioSummary.applicantCount,
              admittedCount: applicationRatioSummary.admittedCount,
            },
          missingFlags: [
            ...(scoreLineSummary ? [] : ['score_line']),
            ...(applicationRatioSummary ? [] : ['application_ratio']),
          ],
          isFavorited: false,
        };
      }),
      pagination: {
        page,
        pageSize,
        total,
        hasMore: page * pageSize < total,
      },
    };
  }

  async findOne(schoolId: string, query: QuerySchoolDetailDto) {
    const school = await this.schoolsRepository.findSchoolById(schoolId);
    if (!school) {
      throw new NotFoundException('NOT_FOUND');
    }

    const [programCount, hotPrograms] = await Promise.all([
      this.schoolsRepository.countProgramsBySchool(schoolId),
      this.schoolsRepository.getHotProgramsBySchool(schoolId),
    ]);

    const hotProgramIds = hotPrograms.map((program) => program.id);
    const [scoreSummaries, applicationSummaries] = await Promise.all([
      this.schoolsRepository.getLatestScoreLineSummaries(
        hotProgramIds,
        query.examYear,
      ),
      this.schoolsRepository.getLatestApplicationRatioSummaries(
        hotProgramIds,
        query.examYear,
      ),
    ]);

    return {
      schoolId: school.id,
      schoolName: school.name,
      shortName: school.shortName,
      province: school.province,
      city: school.city,
      schoolType: school.schoolType,
      schoolLevel: school.schoolLevel,
      hasGraduateSchool: school.hasGraduateSchool,
      officialWebsite: school.officialWebsite,
      graduateWebsite: school.graduateWebsite,
      description: school.description,
      programCount,
      hotPrograms: hotPrograms.map((program) => ({
        programId: program.id,
        programName: program.name,
        departmentId: program.departmentId,
        departmentName: program.department.name,
        degreeType: program.degreeType,
        scoreLineSummary: this.toScoreLineSummary(
          scoreSummaries.get(program.id),
        ),
        applicationRatioSummary: this.toApplicationSummary(
          applicationSummaries.get(program.id),
        ),
      })),
      isFavorited: false,
    };
  }

  async findPrograms(schoolId: string, query: QuerySchoolProgramsDto) {
    this.assertAllowedSort(query.sortBy, [
      'recommended',
      'score_line',
      'application_ratio',
      'tuition',
      undefined,
    ]);

    const school = await this.schoolsRepository.findSchoolById(schoolId);
    if (!school) {
      throw new NotFoundException('NOT_FOUND');
    }

    if (query.departmentId) {
      const department = await this.schoolsRepository.findDepartmentById(
        query.departmentId,
      );
      if (!department || department.schoolId !== school.id) {
        throw new BadRequestException('INVALID_PARAMS');
      }
    }

    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const { items, total } = await this.schoolsRepository.getSchoolPrograms(
      schoolId,
      {
        ...query,
        page,
        pageSize,
      },
    );

    const programIds = items.map((item) => item.id);
    const [scoreSummaries, applicationSummaries, interviewSummaries] =
      await Promise.all([
        this.schoolsRepository.getLatestScoreLineSummaries(
          programIds,
          query.examYear,
        ),
        this.schoolsRepository.getLatestApplicationRatioSummaries(
          programIds,
          query.examYear,
        ),
        this.schoolsRepository.getLatestInterviewRatioSummaries(
          programIds,
          query.examYear,
        ),
      ]);

    return {
      items: items.map((program) => ({
        programId: program.id,
        programName: program.name,
        programCode: program.code,
        departmentId: program.departmentId,
        departmentName: program.department.name,
        degreeType: program.degreeType,
        disciplineCategory: program.disciplineCategory,
        researchDirection: program.researchDirection,
        scoreLineSummary: this.toScoreLineSummary(
          scoreSummaries.get(program.id),
        ),
        applicationRatioSummary: this.toApplicationSummary(
          applicationSummaries.get(program.id),
        ),
        interviewRatioSummary: this.toInterviewSummary(
          interviewSummaries.get(program.id),
        ),
        isFavorited: false,
        isInComparison: false,
      })),
      pagination: {
        page,
        pageSize,
        total,
        hasMore: page * pageSize < total,
      },
    };
  }

  private assertAllowedSort(
    sortBy: string | undefined,
    allowedValues: Array<string | undefined>,
  ) {
    if (!allowedValues.includes(sortBy)) {
      throw new BadRequestException('INVALID_PARAMS');
    }
  }

  private pickFirstSummary<T>(items: Array<T | null | undefined>) {
    return items.find((item) => item != null) ?? null;
  }

  private toScoreLineSummary(
    summary:
      | {
          examYear: number;
          totalScore: number;
          scoreLineType: string;
        }
      | undefined,
  ) {
    if (!summary) {
      return null;
    }

    return {
      examYear: summary.examYear,
      totalScore: summary.totalScore,
      scoreLineType: summary.scoreLineType,
    };
  }

  private toApplicationSummary(
    summary:
      | {
          examYear: number;
          applicationRatio: number;
          applicantCount: number;
          admittedCount: number;
        }
      | undefined,
  ) {
    if (!summary) {
      return null;
    }

    return {
      examYear: summary.examYear,
      applicationRatio: summary.applicationRatio,
      applicantCount: summary.applicantCount,
      admittedCount: summary.admittedCount,
    };
  }

  private toInterviewSummary(
    summary:
      | {
          examYear: number;
          interviewRatio: number;
          retestCandidateCount: number;
          finalAdmittedCount: number;
        }
      | undefined,
  ) {
    if (!summary) {
      return null;
    }

    return {
      examYear: summary.examYear,
      interviewRatio: summary.interviewRatio,
      retestCandidateCount: summary.retestCandidateCount,
      finalAdmittedCount: summary.finalAdmittedCount,
    };
  }
}
