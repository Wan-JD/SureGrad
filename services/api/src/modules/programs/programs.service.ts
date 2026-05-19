import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProgramsRepository } from './repositories/programs.repository';
import { QueryProgramDetailDto } from './dto/query-program-detail.dto';

@Injectable()
export class ProgramsService {
  constructor(private readonly programsRepository: ProgramsRepository) {}

  async findOne(programId: string, query: QueryProgramDetailDto) {
    const program = await this.programsRepository.findProgramById(programId);
    if (!program) {
      throw new NotFoundException('NOT_FOUND');
    }

    const availableExamYears =
      await this.programsRepository.getAvailableExamYears(programId);
    const examYears = this.resolveExamYears(
      query.examYears,
      availableExamYears,
    );

    const [
      admissions,
      scoreLines,
      applicationStats,
      interviewStats,
      examSubjects,
      referenceBooks,
      sourceLinks,
    ] = await Promise.all([
      this.programsRepository.getProgramAdmissions(programId, examYears),
      this.programsRepository.getProgramScoreLines(programId, examYears),
      this.programsRepository.getProgramApplicationStats(programId, examYears),
      this.programsRepository.getProgramInterviewStats(programId, examYears),
      this.programsRepository.getProgramExamSubjects(programId, examYears),
      this.programsRepository.getProgramReferenceBooks(programId, examYears),
      this.programsRepository.getProgramSourceLinks(programId, examYears),
    ]);

    return {
      programId: program.id,
      programName: program.name,
      programCode: program.code,
      degreeType: program.degreeType,
      disciplineCategory: program.disciplineCategory,
      researchDirection: program.researchDirection,
      school: {
        schoolId: program.school.id,
        schoolName: program.school.name,
        shortName: program.school.shortName,
        province: program.school.province,
        city: program.school.city,
        schoolType: program.school.schoolType,
        schoolLevel: program.school.schoolLevel,
        hasGraduateSchool: program.school.hasGraduateSchool,
        officialWebsite: program.school.officialWebsite,
        graduateWebsite: program.school.graduateWebsite,
      },
      department: {
        departmentId: program.department.id,
        departmentName: program.department.name,
        departmentCode: program.department.code,
        website: program.department.website,
      },
      scoreLineSummary: this.toScoreLineSummary(scoreLines[0]),
      applicationRatioSummary: this.toApplicationSummary(applicationStats[0]),
      interviewRatioSummary: this.toInterviewSummary(interviewStats[0]),
      admissions: admissions.map((item) => ({
        examYear: item.examYear,
        plannedEnrollment: item.plannedEnrollment,
        recommendedExemptionCount: item.recommendedExemptionCount,
        unifiedExamQuota: item.unifiedExamQuota,
        actualEnrollment: item.actualEnrollment,
        isCrossMajorAllowed: item.isCrossMajorAllowed,
        memo: item.memo,
        sourceConfidence: item.sourceConfidence,
      })),
      scoreLines: scoreLines.map((item) => ({
        examYear: item.examYear,
        totalScore: item.totalScore,
        politicsScore: item.politicsScore,
        englishScore: item.englishScore,
        subjectOneScore: item.subjectOneScore,
        subjectTwoScore: item.subjectTwoScore,
        scoreLineType: item.scoreLineType,
        notes: item.notes,
        sourceConfidence: item.sourceConfidence,
      })),
      applicationStats: applicationStats.map((item) => ({
        examYear: item.examYear,
        applicantCount: item.applicantCount,
        actualExamCount: item.actualExamCount,
        admittedCount: item.admittedCount,
        applicationRatio: item.applicationRatio,
        notes: item.notes,
        sourceConfidence: item.sourceConfidence,
      })),
      interviewStats: interviewStats.map((item) => ({
        examYear: item.examYear,
        retestCandidateCount: item.retestCandidateCount,
        finalAdmittedCount: item.finalAdmittedCount,
        interviewRatio: item.interviewRatio,
        retestWeight: item.retestWeight,
        initialExamWeight: item.initialExamWeight,
        notes: item.notes,
        sourceConfidence: item.sourceConfidence,
      })),
      examSubjects: examSubjects.map((item) => ({
        examYear: item.examYear,
        subjectId: item.subjectId ?? item.subject?.id,
        sequence: item.sequenceNo,
        subjectRole: item.subjectRole,
        subjectCode: item.subjectCodeText,
        subjectName: item.subjectNameText,
        notes: item.notes,
      })),
      referenceBooks: referenceBooks.map((item) => ({
        examYear: item.examYear,
        bookId: item.bookId ?? item.book?.id,
        title: item.book.title,
        author: item.book.author,
        publisher: item.book.publisher,
        isbn: item.book.isbn,
        edition: item.book.edition,
        coverUrl: item.book.coverUrl,
        subjectRole: item.subjectRole,
        isRequired: item.isRequired,
        notes: item.notes,
      })),
      sourceLinks: sourceLinks.map((item) => ({
        sourceLinkId: item.id,
        examYear: item.examYear,
        sourceType: item.sourceType,
        title: item.title,
        url: item.url,
        publisherName: item.publisherName,
        publishedAt: item.publishedAt,
        lastVerifiedAt: item.lastVerifiedAt?.toISOString() ?? null,
        status: item.status,
        notes: item.notes,
      })),
      dataUpdatedAt: this.pickLatestUpdatedAt([
        program.updatedAt,
        ...admissions.map((item) => item.updatedAt),
        ...scoreLines.map((item) => item.updatedAt),
        ...applicationStats.map((item) => item.updatedAt),
        ...interviewStats.map((item) => item.updatedAt),
        ...examSubjects.map((item) => item.updatedAt),
        ...referenceBooks.map((item) => item.updatedAt),
        ...sourceLinks.map((item) => item.updatedAt),
      ]),
      disclaimer: '以官方最新公告为准',
      isFavorited: false,
      isInComparison: false,
    };
  }

  private resolveExamYears(
    rawExamYears: string | undefined,
    availableYears: number[],
  ) {
    const parsedExamYears = this.parseExamYears(rawExamYears);
    if (parsedExamYears) {
      const availableYearSet = new Set(availableYears);
      if (parsedExamYears.some((item) => !availableYearSet.has(item))) {
        throw new BadRequestException('INVALID_PARAMS');
      }

      return parsedExamYears;
    }

    return availableYears.slice(0, 3);
  }

  private parseExamYears(rawExamYears?: string) {
    if (!rawExamYears) {
      return null;
    }

    if (!/^\d{4}(,\d{4})*$/.test(rawExamYears)) {
      throw new BadRequestException('INVALID_PARAMS');
    }

    const examYears = Array.from(
      new Set(rawExamYears.split(',').map((item) => Number(item))),
    ).sort((left, right) => right - left);

    if (
      examYears.some(
        (item) => !Number.isInteger(item) || item < 1900 || item > 3000,
      )
    ) {
      throw new BadRequestException('INVALID_PARAMS');
    }

    return examYears;
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

  private pickLatestUpdatedAt(timestamps: Array<Date | null | undefined>) {
    const latestTimestamp = timestamps.reduce<number | null>(
      (latest, current) => {
        if (!current) {
          return latest;
        }

        const currentValue = current.getTime();
        if (latest === null || currentValue > latest) {
          return currentValue;
        }

        return latest;
      },
      null,
    );

    return latestTimestamp ? new Date(latestTimestamp).toISOString() : null;
  }
}
