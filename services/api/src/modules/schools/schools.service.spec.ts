import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SchoolsRepository } from './repositories/schools.repository';
import { SchoolsService } from './schools.service';

describe('SchoolsService', () => {
  const createSchoolsRepositoryMock = () =>
    ({
      findSchools: jest.fn(),
      getMatchedProgramsForSchools: jest.fn(),
      getLatestScoreLineSummaries: jest.fn(),
      getLatestApplicationRatioSummaries: jest.fn(),
      findSchoolById: jest.fn(),
      countProgramsBySchool: jest.fn(),
      getHotProgramsBySchool: jest.fn(),
      getSchoolPrograms: jest.fn(),
      findDepartmentById: jest.fn(),
      getLatestInterviewRatioSummaries: jest.fn(),
    }) as unknown as jest.Mocked<SchoolsRepository>;

  it('returns the schools list projection', async () => {
    const schoolsRepository = createSchoolsRepositoryMock();
    schoolsRepository.findSchools = jest.fn().mockResolvedValue({
      items: [
        {
          id: 'school-1',
          name: 'Test University',
          province: 'Zhejiang',
          city: 'Hangzhou',
          schoolLevel: '211',
          schoolType: 'comprehensive',
        },
      ],
      total: 1,
    });
    schoolsRepository.getMatchedProgramsForSchools = jest
      .fn()
      .mockResolvedValue(
        new Map([
          [
            'school-1',
            [
              {
                id: 'program-1',
                name: 'Computer Science',
                degreeType: 'academic',
              },
            ],
          ],
        ]),
      );
    schoolsRepository.getLatestScoreLineSummaries = jest.fn().mockResolvedValue(
      new Map([
        [
          'program-1',
          {
            examYear: 2025,
            totalScore: 390,
            scoreLineType: 'school',
          },
        ],
      ]),
    );
    schoolsRepository.getLatestApplicationRatioSummaries = jest
      .fn()
      .mockResolvedValue(
        new Map([
          [
            'program-1',
            {
              examYear: 2025,
              applicationRatio: 6.2,
              applicantCount: 124,
              admittedCount: 20,
            },
          ],
        ]),
      );

    const service = new SchoolsService(schoolsRepository);
    const result = await service.findAll({
      q: 'Computer',
      page: 1,
      pageSize: 20,
    });

    expect(result).toMatchObject({
      items: [
        {
          schoolId: 'school-1',
          schoolName: 'Test University',
          matchedPrograms: [
            {
              programId: 'program-1',
              programName: 'Computer Science',
            },
          ],
        },
      ],
      pagination: {
        total: 1,
      },
    });
  });

  it('returns school detail data', async () => {
    const schoolsRepository = createSchoolsRepositoryMock();
    schoolsRepository.findSchoolById = jest.fn().mockResolvedValue({
      id: 'school-1',
      name: 'Test University',
      shortName: 'TU',
      province: 'Zhejiang',
      city: 'Hangzhou',
      schoolType: 'comprehensive',
      schoolLevel: '211',
      hasGraduateSchool: true,
      officialWebsite: 'https://example.com',
      graduateWebsite: 'https://example.com/grad',
      description: 'A school',
    });
    schoolsRepository.countProgramsBySchool = jest.fn().mockResolvedValue(12);
    schoolsRepository.getHotProgramsBySchool = jest.fn().mockResolvedValue([
      {
        id: 'program-1',
        name: 'Computer Science',
        departmentId: 'dept-1',
        department: { name: 'Engineering' },
        degreeType: 'academic',
      },
    ]);
    schoolsRepository.getLatestScoreLineSummaries = jest
      .fn()
      .mockResolvedValue(new Map());
    schoolsRepository.getLatestApplicationRatioSummaries = jest
      .fn()
      .mockResolvedValue(new Map());

    const service = new SchoolsService(schoolsRepository);
    const result = await service.findOne('school-1', {});

    expect(result).toMatchObject({
      schoolId: 'school-1',
      schoolName: 'Test University',
      programCount: 12,
      hotPrograms: [
        {
          programId: 'program-1',
          departmentName: 'Engineering',
        },
      ],
    });
  });

  it('returns school programs and validates department ownership', async () => {
    const schoolsRepository = createSchoolsRepositoryMock();
    schoolsRepository.findSchoolById = jest.fn().mockResolvedValue({
      id: 'school-1',
    });
    schoolsRepository.findDepartmentById = jest.fn().mockResolvedValue({
      id: 'dept-1',
      schoolId: 'school-1',
    });
    schoolsRepository.getSchoolPrograms = jest.fn().mockResolvedValue({
      items: [
        {
          id: 'program-1',
          name: 'Computer Science',
          code: '0812',
          departmentId: 'dept-1',
          department: { name: 'Engineering' },
          degreeType: 'academic',
          disciplineCategory: 'engineering',
          researchDirection: 'AI',
        },
      ],
      total: 1,
    });
    schoolsRepository.getLatestScoreLineSummaries = jest
      .fn()
      .mockResolvedValue(new Map());
    schoolsRepository.getLatestApplicationRatioSummaries = jest
      .fn()
      .mockResolvedValue(new Map());
    schoolsRepository.getLatestInterviewRatioSummaries = jest
      .fn()
      .mockResolvedValue(new Map());

    const service = new SchoolsService(schoolsRepository);
    const result = await service.findPrograms('school-1', {
      departmentId: 'dept-1',
      page: 1,
      pageSize: 20,
    });

    expect(result.items[0]).toMatchObject({
      programId: 'program-1',
      programName: 'Computer Science',
    });

    schoolsRepository.findDepartmentById = jest.fn().mockResolvedValue({
      id: 'dept-2',
      schoolId: 'school-2',
    });

    await expect(
      service.findPrograms('school-1', {
        departmentId: 'dept-2',
        page: 1,
        pageSize: 20,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws not found when the school does not exist', async () => {
    const schoolsRepository = createSchoolsRepositoryMock();
    schoolsRepository.findSchoolById = jest.fn().mockResolvedValue(null);

    const service = new SchoolsService(schoolsRepository);

    await expect(service.findOne('missing-school', {})).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
