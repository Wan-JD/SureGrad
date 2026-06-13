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

type ProvinceWebsiteGapRow = {
  province: string | null;
  total: string;
  missingOfficialWebsite: string;
  missingGraduateWebsite: string;
  missingBothWebsites: string;
  withoutPrograms: string;
};

type SchoolWebsiteGapRow = {
  schoolId: string;
  schoolName: string;
  province: string;
  city: string;
  schoolLevel: string;
  missingOfficialWebsite: boolean | string;
  missingGraduateWebsite: boolean | string;
  programCount: string;
  updatedAt: Date | string;
};

type ProgramYearlyGapRow = {
  programId: string;
  programName: string;
  programCode: string;
  schoolId: string;
  schoolName: string;
  departmentName: string;
  degreeType: string;
  latestExamYear: string | null;
  missingAdmissions: boolean | string;
  missingScoreLines: boolean | string;
  missingApplicationStats: boolean | string;
  missingInterviewStats: boolean | string;
  missingExamSubjects: boolean | string;
  missingReferenceBooks: boolean | string;
  missingCount: string;
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

    const [provinceWebsiteGaps, schoolWebsiteGaps, programYearlyGaps] =
      await Promise.all([
        this.getProvinceWebsiteGaps(),
        this.getSchoolWebsiteGaps(),
        this.getProgramYearlyGaps(),
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
      priorityGaps: {
        provinceWebsiteGaps,
        schoolWebsiteGaps,
        programYearlyGaps,
      },
    };
  }

  private async getProvinceWebsiteGaps() {
    const rows = await this.dataSource.query<ProvinceWebsiteGapRow[]>(`
      WITH program_counts AS (
        SELECT school_id, COUNT(*) AS program_count
        FROM programs
        WHERE deleted_at IS NULL
          AND status = 'active'
        GROUP BY school_id
      )
      SELECT
        COALESCE(NULLIF(school.province, ''), '未标注') AS "province",
        COUNT(*)::text AS "total",
        COUNT(*) FILTER (
          WHERE school.official_website IS NULL OR school.official_website = ''
        )::text AS "missingOfficialWebsite",
        COUNT(*) FILTER (
          WHERE school.graduate_website IS NULL OR school.graduate_website = ''
        )::text AS "missingGraduateWebsite",
        COUNT(*) FILTER (
          WHERE (school.official_website IS NULL OR school.official_website = '')
            AND (school.graduate_website IS NULL OR school.graduate_website = '')
        )::text AS "missingBothWebsites",
        COUNT(*) FILTER (
          WHERE COALESCE(program_counts.program_count, 0) = 0
        )::text AS "withoutPrograms"
      FROM schools school
      LEFT JOIN program_counts
        ON program_counts.school_id = school.id
      WHERE school.deleted_at IS NULL
        AND school.status = 'active'
      GROUP BY COALESCE(NULLIF(school.province, ''), '未标注')
      ORDER BY
        COUNT(*) FILTER (
          WHERE (school.official_website IS NULL OR school.official_website = '')
            AND (school.graduate_website IS NULL OR school.graduate_website = '')
        ) DESC,
        COALESCE(NULLIF(school.province, ''), '未标注') ASC
      LIMIT 8
    `);

    return rows.map((row) => ({
      province: row.province ?? '未标注',
      total: Number(row.total),
      missingOfficialWebsite: Number(row.missingOfficialWebsite),
      missingGraduateWebsite: Number(row.missingGraduateWebsite),
      missingBothWebsites: Number(row.missingBothWebsites),
      withoutPrograms: Number(row.withoutPrograms),
    }));
  }

  private async getSchoolWebsiteGaps() {
    const rows = await this.dataSource.query<SchoolWebsiteGapRow[]>(`
      SELECT
        school.id AS "schoolId",
        school.name AS "schoolName",
        school.province AS "province",
        school.city AS "city",
        school.school_level AS "schoolLevel",
        (school.official_website IS NULL OR school.official_website = '') AS "missingOfficialWebsite",
        (school.graduate_website IS NULL OR school.graduate_website = '') AS "missingGraduateWebsite",
        COUNT(program.id)::text AS "programCount",
        school.updated_at AS "updatedAt"
      FROM schools school
      LEFT JOIN programs program
        ON program.school_id = school.id
        AND program.deleted_at IS NULL
        AND program.status = 'active'
      WHERE school.deleted_at IS NULL
        AND school.status = 'active'
        AND (
          school.official_website IS NULL OR school.official_website = ''
          OR school.graduate_website IS NULL OR school.graduate_website = ''
        )
      GROUP BY
        school.id,
        school.name,
        school.province,
        school.city,
        school.school_level,
        school.official_website,
        school.graduate_website,
        school.updated_at,
        school.sort_order
      ORDER BY
        COUNT(program.id) DESC,
        school.sort_order DESC,
        school.updated_at DESC,
        school.name ASC
      LIMIT 10
    `);

    return rows.map((row) => ({
      schoolId: row.schoolId,
      schoolName: row.schoolName,
      province: row.province,
      city: row.city,
      schoolLevel: row.schoolLevel,
      missingOfficialWebsite: this.toBoolean(row.missingOfficialWebsite),
      missingGraduateWebsite: this.toBoolean(row.missingGraduateWebsite),
      programCount: Number(row.programCount),
      updatedAt:
        row.updatedAt instanceof Date
          ? row.updatedAt.toISOString()
          : new Date(row.updatedAt).toISOString(),
    }));
  }

  private async getProgramYearlyGaps() {
    const rows = await this.dataSource.query<ProgramYearlyGapRow[]>(`
      WITH program_years AS (
        SELECT program_id, exam_year FROM program_admissions
        UNION
        SELECT program_id, exam_year FROM program_score_lines
        UNION
        SELECT program_id, exam_year FROM program_application_stats
        UNION
        SELECT program_id, exam_year FROM program_interview_stats
        UNION
        SELECT program_id, exam_year FROM program_exam_subjects
        UNION
        SELECT program_id, exam_year FROM program_reference_books
        UNION
        SELECT program_id, exam_year FROM program_source_links WHERE exam_year IS NOT NULL
      ),
      latest_year AS (
        SELECT program_id, MAX(exam_year) AS latest_exam_year
        FROM program_years
        GROUP BY program_id
      ),
      program_gap AS (
        SELECT
          program.id AS "programId",
          program.name AS "programName",
          program.code AS "programCode",
          school.id AS "schoolId",
          school.name AS "schoolName",
          department.name AS "departmentName",
          program.degree_type AS "degreeType",
          latest_year.latest_exam_year AS "latestExamYear",
          NOT EXISTS (
            SELECT 1 FROM program_admissions metric WHERE metric.program_id = program.id
          ) AS "missingAdmissions",
          NOT EXISTS (
            SELECT 1 FROM program_score_lines metric WHERE metric.program_id = program.id
          ) AS "missingScoreLines",
          NOT EXISTS (
            SELECT 1 FROM program_application_stats metric WHERE metric.program_id = program.id
          ) AS "missingApplicationStats",
          NOT EXISTS (
            SELECT 1 FROM program_interview_stats metric WHERE metric.program_id = program.id
          ) AS "missingInterviewStats",
          NOT EXISTS (
            SELECT 1 FROM program_exam_subjects metric WHERE metric.program_id = program.id
          ) AS "missingExamSubjects",
          NOT EXISTS (
            SELECT 1 FROM program_reference_books metric WHERE metric.program_id = program.id
          ) AS "missingReferenceBooks"
        FROM programs program
        INNER JOIN schools school
          ON school.id = program.school_id
          AND school.deleted_at IS NULL
          AND school.status = 'active'
        INNER JOIN departments department
          ON department.id = program.department_id
          AND department.deleted_at IS NULL
          AND department.status = 'active'
        LEFT JOIN latest_year
          ON latest_year.program_id = program.id
        WHERE program.deleted_at IS NULL
          AND program.status = 'active'
      )
      SELECT
        *,
        (
          "missingAdmissions"::int
          + "missingScoreLines"::int
          + "missingApplicationStats"::int
          + "missingInterviewStats"::int
          + "missingExamSubjects"::int
          + "missingReferenceBooks"::int
        )::text AS "missingCount"
      FROM program_gap
      ORDER BY
        (
          "missingAdmissions"::int
          + "missingScoreLines"::int
          + "missingApplicationStats"::int
          + "missingInterviewStats"::int
          + "missingExamSubjects"::int
          + "missingReferenceBooks"::int
        ) DESC,
        "latestExamYear" DESC NULLS LAST,
        "schoolName" ASC,
        "programName" ASC
      LIMIT 10
    `);

    return rows.map((row) => ({
      programId: row.programId,
      programName: row.programName,
      programCode: row.programCode,
      schoolId: row.schoolId,
      schoolName: row.schoolName,
      departmentName: row.departmentName,
      degreeType: row.degreeType,
      latestExamYear:
        row.latestExamYear === null ? null : Number(row.latestExamYear),
      missingAdmissions: this.toBoolean(row.missingAdmissions),
      missingScoreLines: this.toBoolean(row.missingScoreLines),
      missingApplicationStats: this.toBoolean(row.missingApplicationStats),
      missingInterviewStats: this.toBoolean(row.missingInterviewStats),
      missingExamSubjects: this.toBoolean(row.missingExamSubjects),
      missingReferenceBooks: this.toBoolean(row.missingReferenceBooks),
      missingCount: Number(row.missingCount),
    }));
  }

  private toBoolean(value: boolean | string | number | null | undefined) {
    return value === true || value === 'true' || value === 't' || value === 1;
  }
}
