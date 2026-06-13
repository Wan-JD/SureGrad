import { DataSource } from 'typeorm';
import { AdminDataCoverageRepository } from './admin-data-coverage.repository';

describe('AdminDataCoverageRepository', () => {
  const query = jest.fn();
  const repository = new AdminDataCoverageRepository({
    query,
  } as unknown as DataSource);

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('returns summary metrics with prioritized data gap queues', async () => {
    query
      .mockResolvedValueOnce([
        {
          total: '3',
          withOfficialWebsite: '1',
          withGraduateWebsite: '1',
          classifiedSchoolType: '2',
          withPrograms: '2',
        },
      ])
      .mockResolvedValueOnce([
        {
          total: '4',
          official: '3',
          pending: '1',
          invalid: '0',
        },
      ])
      .mockResolvedValueOnce([{ count: '2' }])
      .mockResolvedValueOnce([{ count: '1' }])
      .mockResolvedValueOnce([{ count: '1' }])
      .mockResolvedValueOnce([{ count: '1' }])
      .mockResolvedValueOnce([{ count: '0' }])
      .mockResolvedValueOnce([{ count: '1' }])
      .mockResolvedValueOnce([{ count: '2' }])
      .mockResolvedValueOnce([{ count: '0' }])
      .mockResolvedValueOnce([{ count: '1' }])
      .mockResolvedValueOnce([{ count: '1' }])
      .mockResolvedValueOnce([{ count: '0' }])
      .mockResolvedValueOnce([{ count: '1' }])
      .mockResolvedValueOnce([{ count: '4' }])
      .mockResolvedValueOnce([{ count: '0' }])
      .mockResolvedValueOnce([
        {
          province: '江苏省',
          total: '2',
          missingOfficialWebsite: '1',
          missingGraduateWebsite: '2',
          missingBothWebsites: '1',
          withoutPrograms: '1',
        },
      ])
      .mockResolvedValueOnce([
        {
          schoolId: 'school-1',
          schoolName: '南京测试大学',
          province: '江苏省',
          city: '南京市',
          schoolLevel: '211',
          missingOfficialWebsite: 't',
          missingGraduateWebsite: 'f',
          programCount: '3',
          updatedAt: new Date('2026-06-12T00:00:00.000Z'),
        },
      ])
      .mockResolvedValueOnce([
        {
          programId: 'program-1',
          programName: '计算机科学与技术',
          programCode: '081200',
          schoolId: 'school-1',
          schoolName: '南京测试大学',
          departmentName: '计算机学院',
          degreeType: 'academic',
          latestExamYear: '2025',
          missingAdmissions: false,
          missingScoreLines: false,
          missingApplicationStats: true,
          missingInterviewStats: false,
          missingExamSubjects: false,
          missingReferenceBooks: true,
          missingCount: '2',
        },
      ]);

    await expect(repository.getSummary()).resolves.toMatchObject({
      schools: {
        total: 3,
        withOfficialWebsite: 1,
        missingOfficialWebsite: 2,
        withGraduateWebsite: 1,
        missingGraduateWebsite: 2,
        classifiedSchoolType: 2,
        unclassifiedSchoolType: 1,
        withPrograms: 2,
        withoutPrograms: 1,
      },
      programs: {
        total: 2,
        withSourceLinks: 1,
        withoutSourceLinks: 1,
        withAdmissions: 1,
        withoutAdmissions: 1,
        withScoreLines: 1,
        withoutScoreLines: 1,
        withApplicationStats: 0,
        withoutApplicationStats: 2,
        withInterviewStats: 1,
        withoutInterviewStats: 1,
        withExamSubjects: 2,
        withoutExamSubjects: 0,
        withReferenceBooks: 0,
        withoutReferenceBooks: 2,
      },
      priorityGaps: {
        provinceWebsiteGaps: [
          {
            province: '江苏省',
            total: 2,
            missingOfficialWebsite: 1,
            missingGraduateWebsite: 2,
            missingBothWebsites: 1,
            withoutPrograms: 1,
          },
        ],
        schoolWebsiteGaps: [
          {
            schoolId: 'school-1',
            schoolName: '南京测试大学',
            missingOfficialWebsite: true,
            missingGraduateWebsite: false,
            programCount: 3,
            updatedAt: '2026-06-12T00:00:00.000Z',
          },
        ],
        programYearlyGaps: [
          {
            programId: 'program-1',
            programName: '计算机科学与技术',
            latestExamYear: 2025,
            missingApplicationStats: true,
            missingReferenceBooks: true,
            missingCount: 2,
          },
        ],
      },
    });
  });
});
