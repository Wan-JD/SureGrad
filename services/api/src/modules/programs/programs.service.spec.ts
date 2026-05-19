import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { ProgramsRepository } from './repositories/programs.repository';
import { ProgramsService } from './programs.service';

describe('ProgramsService', () => {
  type ProgramsRepositoryMock = jest.Mocked<
    Pick<
      ProgramsRepository,
      | 'findProgramById'
      | 'getAvailableExamYears'
      | 'getProgramAdmissions'
      | 'getProgramScoreLines'
      | 'getProgramApplicationStats'
      | 'getProgramInterviewStats'
      | 'getProgramExamSubjects'
      | 'getProgramReferenceBooks'
      | 'getProgramSourceLinks'
    >
  >;

  const createProgramsRepositoryMock = (): ProgramsRepositoryMock =>
    ({
      findProgramById: jest.fn(),
      getAvailableExamYears: jest.fn(),
      getProgramAdmissions: jest.fn(),
      getProgramScoreLines: jest.fn(),
      getProgramApplicationStats: jest.fn(),
      getProgramInterviewStats: jest.fn(),
      getProgramExamSubjects: jest.fn(),
      getProgramReferenceBooks: jest.fn(),
      getProgramSourceLinks: jest.fn(),
    }) satisfies ProgramsRepositoryMock;

  const createProgramFixture = () => ({
    id: 'program-1',
    name: 'Computer Science',
    code: '081200',
    degreeType: 'academic',
    disciplineCategory: 'engineering',
    researchDirection: 'Artificial Intelligence',
    school: {
      id: 'school-1',
      name: 'Test University',
      shortName: 'TU',
      province: 'Zhejiang',
      city: 'Hangzhou',
      schoolType: 'comprehensive',
      schoolLevel: '211',
      hasGraduateSchool: true,
      officialWebsite: 'https://school.example.com',
      graduateWebsite: 'https://grad.example.com',
    },
    department: {
      id: 'department-1',
      name: 'School of Computer Science',
      code: 'CS',
      website: 'https://department.example.com',
    },
  });

  it('returns the program detail projection with the latest three years by default', async () => {
    const programsRepository = createProgramsRepositoryMock();
    programsRepository.findProgramById.mockResolvedValue(
      createProgramFixture(),
    );
    programsRepository.getAvailableExamYears.mockResolvedValue([
      2025, 2024, 2023, 2022,
    ]);
    programsRepository.getProgramAdmissions.mockResolvedValue([
      {
        examYear: 2025,
        plannedEnrollment: 30,
        actualEnrollment: 28,
        updatedAt: new Date('2026-01-15T00:00:00.000Z'),
      },
      {
        examYear: 2024,
        plannedEnrollment: 25,
        actualEnrollment: 24,
        updatedAt: new Date('2025-01-15T00:00:00.000Z'),
      },
      {
        examYear: 2023,
        plannedEnrollment: 20,
        actualEnrollment: 19,
        updatedAt: new Date('2024-01-15T00:00:00.000Z'),
      },
    ]);
    programsRepository.getProgramScoreLines.mockResolvedValue([
      {
        examYear: 2025,
        totalScore: 390,
        scoreLineType: 'school',
        updatedAt: new Date('2026-02-01T00:00:00.000Z'),
      },
      {
        examYear: 2024,
        totalScore: 380,
        scoreLineType: 'school',
        updatedAt: new Date('2025-02-01T00:00:00.000Z'),
      },
      {
        examYear: 2023,
        totalScore: 372,
        scoreLineType: 'school',
        updatedAt: new Date('2024-02-01T00:00:00.000Z'),
      },
    ]);
    programsRepository.getProgramApplicationStats.mockResolvedValue([
      {
        examYear: 2025,
        applicationRatio: 6.2,
        applicantCount: 186,
        admittedCount: 30,
        updatedAt: new Date('2026-03-01T00:00:00.000Z'),
      },
      {
        examYear: 2024,
        applicationRatio: 5.8,
        applicantCount: 145,
        admittedCount: 25,
        updatedAt: new Date('2025-03-01T00:00:00.000Z'),
      },
    ]);
    programsRepository.getProgramInterviewStats.mockResolvedValue([
      {
        examYear: 2025,
        interviewRatio: 1.5,
        retestCandidateCount: 45,
        finalAdmittedCount: 30,
        updatedAt: new Date('2026-04-01T00:00:00.000Z'),
      },
    ]);
    programsRepository.getProgramExamSubjects.mockResolvedValue([
      {
        examYear: 2025,
        sequenceNo: 1,
        subjectRole: 'politics',
        subjectCodeText: '101',
        subjectNameText: 'Political Theory',
        subject: {
          id: 'subject-1',
        },
        updatedAt: new Date('2026-05-01T00:00:00.000Z'),
      },
      {
        examYear: 2024,
        sequenceNo: 1,
        subjectRole: 'politics',
        subjectCodeText: '101',
        subjectNameText: 'Political Theory',
        subject: {
          id: 'subject-1',
        },
        updatedAt: new Date('2025-05-01T00:00:00.000Z'),
      },
    ]);
    programsRepository.getProgramReferenceBooks.mockResolvedValue([
      {
        examYear: 2025,
        subjectRole: 'major_1',
        isRequired: true,
        notes: 'Latest edition',
        book: {
          id: 'book-1',
          title: 'Data Structures',
          author: 'Author A',
          publisher: 'Pub A',
          isbn: '9780000000001',
          edition: '3rd',
          coverUrl: 'https://book.example.com/1.png',
        },
        updatedAt: new Date('2026-05-10T00:00:00.000Z'),
      },
    ]);
    programsRepository.getProgramSourceLinks.mockResolvedValue([
      {
        id: 'source-1',
        examYear: 2025,
        sourceType: 'official_notice',
        title: '2025 Admissions Brochure',
        url: 'https://school.example.com/brochure-2025',
        publisherName: 'Test University',
        publishedAt: new Date('2025-09-01T00:00:00.000Z'),
        lastVerifiedAt: new Date('2026-05-12T00:00:00.000Z'),
        status: 'active',
        notes: null,
        updatedAt: new Date('2026-05-12T00:00:00.000Z'),
      },
      {
        id: 'source-2',
        examYear: null,
        sourceType: 'other',
        title: 'Graduate School Portal',
        url: 'https://grad.example.com',
        publisherName: 'Test University',
        publishedAt: null,
        lastVerifiedAt: new Date('2026-05-11T00:00:00.000Z'),
        status: 'active',
        notes: null,
        updatedAt: new Date('2026-05-11T00:00:00.000Z'),
      },
    ]);

    const service = new ProgramsService(
      programsRepository as ProgramsRepository,
    );
    const result = await service.findOne('program-1', {});

    expect(programsRepository.getProgramAdmissions).toHaveBeenCalledWith(
      'program-1',
      [2025, 2024, 2023],
    );
    expect(result).toMatchObject({
      programId: 'program-1',
      programName: 'Computer Science',
      school: {
        schoolId: 'school-1',
        schoolName: 'Test University',
      },
      department: {
        departmentId: 'department-1',
        departmentName: 'School of Computer Science',
      },
      scoreLineSummary: {
        examYear: 2025,
        totalScore: 390,
        scoreLineType: 'school',
      },
      applicationRatioSummary: {
        examYear: 2025,
        applicationRatio: 6.2,
        applicantCount: 186,
        admittedCount: 30,
      },
      interviewRatioSummary: {
        examYear: 2025,
        interviewRatio: 1.5,
        retestCandidateCount: 45,
        finalAdmittedCount: 30,
      },
      admissions: [
        {
          examYear: 2025,
          plannedEnrollment: 30,
        },
        {
          examYear: 2024,
          plannedEnrollment: 25,
        },
        {
          examYear: 2023,
          plannedEnrollment: 20,
        },
      ],
      examSubjects: [
        {
          examYear: 2025,
          subjectCode: '101',
          subjectName: 'Political Theory',
        },
        {
          examYear: 2024,
          subjectCode: '101',
          subjectName: 'Political Theory',
        },
      ],
      referenceBooks: [
        {
          examYear: 2025,
          title: 'Data Structures',
        },
      ],
      sourceLinks: [
        {
          sourceLinkId: 'source-1',
          examYear: 2025,
        },
        {
          sourceLinkId: 'source-2',
          examYear: null,
        },
      ],
      dataUpdatedAt: '2026-05-12T00:00:00.000Z',
      disclaimer: '以官方最新公告为准',
      isFavorited: false,
      isInComparison: false,
    });
  });

  it('filters the response by explicit exam years', async () => {
    const programsRepository = createProgramsRepositoryMock();
    programsRepository.findProgramById.mockResolvedValue(
      createProgramFixture(),
    );
    programsRepository.getAvailableExamYears.mockResolvedValue([
      2025, 2024, 2023, 2022,
    ]);
    programsRepository.getProgramAdmissions.mockResolvedValue([
      {
        examYear: 2024,
        plannedEnrollment: 25,
        updatedAt: new Date('2025-01-15T00:00:00.000Z'),
      },
      {
        examYear: 2022,
        plannedEnrollment: 18,
        updatedAt: new Date('2023-01-15T00:00:00.000Z'),
      },
    ]);
    programsRepository.getProgramScoreLines.mockResolvedValue([
      {
        examYear: 2024,
        totalScore: 380,
        scoreLineType: 'school',
        updatedAt: new Date('2025-02-01T00:00:00.000Z'),
      },
      {
        examYear: 2022,
        totalScore: 360,
        scoreLineType: 'school',
        updatedAt: new Date('2023-02-01T00:00:00.000Z'),
      },
    ]);
    programsRepository.getProgramApplicationStats.mockResolvedValue([]);
    programsRepository.getProgramInterviewStats.mockResolvedValue([]);
    programsRepository.getProgramExamSubjects.mockResolvedValue([]);
    programsRepository.getProgramReferenceBooks.mockResolvedValue([]);
    programsRepository.getProgramSourceLinks.mockResolvedValue([]);

    const service = new ProgramsService(
      programsRepository as ProgramsRepository,
    );
    const result = await service.findOne('program-1', {
      examYears: '2024,2022',
    });

    expect(programsRepository.getProgramAdmissions).toHaveBeenCalledWith(
      'program-1',
      [2024, 2022],
    );
    expect(result.admissions).toHaveLength(2);
    expect(result.admissions.map((item) => item.examYear)).toEqual([
      2024, 2022,
    ]);
    expect(result.scoreLines.map((item) => item.examYear)).toEqual([
      2024, 2022,
    ]);
  });

  it('throws not found when the program does not exist', async () => {
    const programsRepository = createProgramsRepositoryMock();
    programsRepository.findProgramById.mockResolvedValue(null);

    const service = new ProgramsService(
      programsRepository as ProgramsRepository,
    );

    await expect(service.findOne('missing-program', {})).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('throws invalid params when the exam year list format is invalid', async () => {
    const programsRepository = createProgramsRepositoryMock();
    programsRepository.findProgramById.mockResolvedValue(
      createProgramFixture(),
    );

    const service = new ProgramsService(
      programsRepository as ProgramsRepository,
    );

    await expect(
      service.findOne('program-1', {
        examYears: '2025,abcd',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws invalid params when the exam year is outside the supported range', async () => {
    const programsRepository = createProgramsRepositoryMock();
    programsRepository.findProgramById.mockResolvedValue(
      createProgramFixture(),
    );
    programsRepository.getAvailableExamYears.mockResolvedValue([
      2025, 2024, 2023,
    ]);

    const service = new ProgramsService(
      programsRepository as ProgramsRepository,
    );

    await expect(
      service.findOne('program-1', {
        examYears: '2022',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
