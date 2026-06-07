import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

type CountRow = {
  count: string;
};

type SchoolCoverageRow = {
  total: string;
  withOfficialWebsite: string;
  withGraduateWebsite: string;
  classifiedSchoolType: string;
  withPrograms: string;
};

type SourceLinkCoverageRow = {
  total: string;
  official: string;
  pending: string;
  invalid: string;
};

@Injectable()
export class AdminDataCoverageRepository {
  constructor(private readonly dataSource: DataSource) {}

  private async count(sql: string): Promise<number> {
    const rows = await this.dataSource.query<CountRow[]>(sql);
    return Number(rows[0]?.count ?? 0);
  }

  async getSummary() {
    const [schoolRows, sourceLinkRows] = await Promise.all([
      this.dataSource.query<SchoolCoverageRow[]>(`
        SELECT
          COUNT(DISTINCT school.id)::text AS "total",
          COUNT(DISTINCT school.id) FILTER (
            WHERE school.official_website IS NOT NULL AND school.official_website <> ''
          )::text AS "withOfficialWebsite",
          COUNT(DISTINCT school.id) FILTER (
            WHERE school.graduate_website IS NOT NULL AND school.graduate_website <> ''
          )::text AS "withGraduateWebsite",
          COUNT(DISTINCT school.id) FILTER (
            WHERE school.school_type IS NOT NULL
              AND school.school_type <> ''
              AND school.school_type <> '未分类'
          )::text AS "classifiedSchoolType",
          COUNT(DISTINCT program_scope.school_id)::text AS "withPrograms"
        FROM schools school
        LEFT JOIN programs program_scope
          ON program_scope.school_id = school.id
          AND program_scope.deleted_at IS NULL
          AND program_scope.status = 'active'
        WHERE school.deleted_at IS NULL
          AND school.status = 'active'
      `),
      this.dataSource.query<SourceLinkCoverageRow[]>(`
        SELECT
          COUNT(*)::text AS "total",
          COUNT(*) FILTER (WHERE source_confidence = 'official')::text AS "official",
          COUNT(*) FILTER (WHERE status = 'pending')::text AS "pending",
          COUNT(*) FILTER (WHERE status = 'invalid')::text AS "invalid"
        FROM program_source_links
      `),
    ]);

    const schoolCoverage = schoolRows[0] ?? {
      total: '0',
      withOfficialWebsite: '0',
      withGraduateWebsite: '0',
      classifiedSchoolType: '0',
      withPrograms: '0',
    };
    const sourceLinkCoverage = sourceLinkRows[0] ?? {
      total: '0',
      official: '0',
      pending: '0',
      invalid: '0',
    };

    const [
      totalPrograms,
      programsWithSourceLinks,
      programsWithAdmissions,
      programsWithScoreLines,
      programsWithApplicationStats,
      programsWithInterviewStats,
      programsWithExamSubjects,
      programsWithReferenceBooks,
      admissions,
      scoreLines,
      applicationStats,
      interviewStats,
      examSubjects,
      referenceBooks,
    ] = await Promise.all([
      this.count(`
        SELECT COUNT(*)::text AS count
        FROM programs
        WHERE deleted_at IS NULL AND status = 'active'
      `),
      this.count(`
        SELECT COUNT(DISTINCT program_id)::text AS count
        FROM program_source_links
        WHERE status = 'active'
      `),
      this.count(`
        SELECT COUNT(DISTINCT program_id)::text AS count
        FROM program_admissions
      `),
      this.count(`
        SELECT COUNT(DISTINCT program_id)::text AS count
        FROM program_score_lines
      `),
      this.count(`
        SELECT COUNT(DISTINCT program_id)::text AS count
        FROM program_application_stats
      `),
      this.count(`
        SELECT COUNT(DISTINCT program_id)::text AS count
        FROM program_interview_stats
      `),
      this.count(`
        SELECT COUNT(DISTINCT program_id)::text AS count
        FROM program_exam_subjects
      `),
      this.count(`
        SELECT COUNT(DISTINCT program_id)::text AS count
        FROM program_reference_books
      `),
      this.count('SELECT COUNT(*)::text AS count FROM program_admissions'),
      this.count('SELECT COUNT(*)::text AS count FROM program_score_lines'),
      this.count(
        'SELECT COUNT(*)::text AS count FROM program_application_stats',
      ),
      this.count('SELECT COUNT(*)::text AS count FROM program_interview_stats'),
      this.count('SELECT COUNT(*)::text AS count FROM program_exam_subjects'),
      this.count('SELECT COUNT(*)::text AS count FROM program_reference_books'),
    ]);

    const totalSchools = Number(schoolCoverage.total);
    const withOfficialWebsite = Number(schoolCoverage.withOfficialWebsite);
    const withGraduateWebsite = Number(schoolCoverage.withGraduateWebsite);
    const classifiedSchoolType = Number(schoolCoverage.classifiedSchoolType);
    const schoolsWithPrograms = Number(schoolCoverage.withPrograms);

    return {
      generatedAt: new Date().toISOString(),
      schools: {
        total: totalSchools,
        withOfficialWebsite,
        missingOfficialWebsite: totalSchools - withOfficialWebsite,
        withGraduateWebsite,
        missingGraduateWebsite: totalSchools - withGraduateWebsite,
        classifiedSchoolType,
        unclassifiedSchoolType: totalSchools - classifiedSchoolType,
        withPrograms: schoolsWithPrograms,
        withoutPrograms: totalSchools - schoolsWithPrograms,
      },
      programs: {
        total: totalPrograms,
        withSourceLinks: programsWithSourceLinks,
        withoutSourceLinks: totalPrograms - programsWithSourceLinks,
        withAdmissions: programsWithAdmissions,
        withoutAdmissions: totalPrograms - programsWithAdmissions,
        withScoreLines: programsWithScoreLines,
        withoutScoreLines: totalPrograms - programsWithScoreLines,
        withApplicationStats: programsWithApplicationStats,
        withoutApplicationStats: totalPrograms - programsWithApplicationStats,
        withInterviewStats: programsWithInterviewStats,
        withoutInterviewStats: totalPrograms - programsWithInterviewStats,
        withExamSubjects: programsWithExamSubjects,
        withoutExamSubjects: totalPrograms - programsWithExamSubjects,
        withReferenceBooks: programsWithReferenceBooks,
        withoutReferenceBooks: totalPrograms - programsWithReferenceBooks,
      },
      sourceLinks: {
        total: Number(sourceLinkCoverage.total),
        official: Number(sourceLinkCoverage.official),
        pending: Number(sourceLinkCoverage.pending),
        invalid: Number(sourceLinkCoverage.invalid),
      },
      yearlyRecords: {
        admissions,
        scoreLines,
        applicationStats,
        interviewStats,
        examSubjects,
        referenceBooks,
      },
    };
  }
}
