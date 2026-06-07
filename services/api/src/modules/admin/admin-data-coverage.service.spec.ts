import { AdminDataCoverageService } from './admin-data-coverage.service';
import { AdminDataCoverageRepository } from './repositories/admin-data-coverage.repository';

describe('AdminDataCoverageService', () => {
  const adminDataCoverageRepository = {
    getSummary: jest.fn(),
  } as unknown as jest.Mocked<AdminDataCoverageRepository>;

  const service = new AdminDataCoverageService(adminDataCoverageRepository);

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('returns the database coverage summary from the repository', async () => {
    const summary = {
      generatedAt: '2026-06-07T13:40:00.000Z',
      schools: {
        total: 2919,
        withOfficialWebsite: 5,
        missingOfficialWebsite: 2914,
        withGraduateWebsite: 5,
        missingGraduateWebsite: 2914,
        classifiedSchoolType: 5,
        unclassifiedSchoolType: 2914,
        withPrograms: 5,
        withoutPrograms: 2914,
      },
      programs: {
        total: 5,
        withSourceLinks: 5,
        withoutSourceLinks: 0,
        withAdmissions: 2,
        withoutAdmissions: 3,
        withScoreLines: 3,
        withoutScoreLines: 2,
        withApplicationStats: 1,
        withoutApplicationStats: 4,
        withInterviewStats: 1,
        withoutInterviewStats: 4,
        withExamSubjects: 5,
        withoutExamSubjects: 0,
        withReferenceBooks: 1,
        withoutReferenceBooks: 4,
      },
      sourceLinks: {
        total: 12,
        official: 12,
        pending: 0,
        invalid: 0,
      },
      yearlyRecords: {
        admissions: 2,
        scoreLines: 3,
        applicationStats: 1,
        interviewStats: 1,
        examSubjects: 20,
        referenceBooks: 1,
      },
    };

    adminDataCoverageRepository.getSummary.mockResolvedValue(summary);

    await expect(service.summary()).resolves.toBe(summary);
  });
});
