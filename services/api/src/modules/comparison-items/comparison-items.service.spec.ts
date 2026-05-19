import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { ComparisonItemsRepository } from './repositories/comparison-items.repository';
import { ComparisonItemsService } from './comparison-items.service';

describe('ComparisonItemsService', () => {
  type ComparisonItemRecord = {
    id: string;
    userId: string;
    targetType: 'program';
    targetId: string;
  };
  type ComparisonResultItem = {
    targetId: string;
    targetType: 'program';
    schoolName: string;
    programName: string;
    examYear: number | null;
    totalScore: number | null;
    applicationRatio: number | null;
    interviewRatio: number | null;
    plannedEnrollment: number | null;
    tuitionPerYear: number;
    city: string;
    examSubjects: string[];
    missingFlags: string[];
  };
  type ComparisonItemsRepositoryMock = {
    findComparisonItemByUserAndTarget: jest.MockedFunction<
      (
        userId: string,
        targetType: 'program',
        targetId: string,
      ) => Promise<ComparisonItemRecord | null>
    >;
    countComparisonItemsByUser: jest.MockedFunction<
      (userId: string) => Promise<number>
    >;
    findProgramById: jest.MockedFunction<
      (programId: string) => Promise<{ id: string } | null>
    >;
    createComparisonItem: jest.MockedFunction<
      (
        input: Pick<ComparisonItemRecord, 'userId' | 'targetType' | 'targetId'>,
      ) => ComparisonItemRecord
    >;
    saveComparisonItem: jest.MockedFunction<
      (item: ComparisonItemRecord) => Promise<ComparisonItemRecord>
    >;
    removeComparisonItem: jest.MockedFunction<
      (item: ComparisonItemRecord) => Promise<void>
    >;
    getComparisonResultItems: jest.MockedFunction<
      (userId: string, examYear?: number) => Promise<ComparisonResultItem[]>
    >;
  };

  const createComparisonItemsRepositoryMock =
    (): ComparisonItemsRepositoryMock => ({
      findComparisonItemByUserAndTarget: jest.fn(),
      countComparisonItemsByUser: jest.fn(),
      findProgramById: jest.fn(),
      createComparisonItem: jest.fn(),
      saveComparisonItem: jest.fn(),
      removeComparisonItem: jest.fn(),
      getComparisonResultItems: jest.fn(),
    });

  const asComparisonItemsRepository = (
    repository: ComparisonItemsRepositoryMock,
  ): ComparisonItemsRepository =>
    repository as unknown as ComparisonItemsRepository;

  it('creates a comparison item and returns the current count', async () => {
    const comparisonItemsRepository = createComparisonItemsRepositoryMock();
    comparisonItemsRepository.findComparisonItemByUserAndTarget.mockResolvedValue(
      null,
    );
    comparisonItemsRepository.countComparisonItemsByUser.mockResolvedValue(1);
    comparisonItemsRepository.findProgramById.mockResolvedValue({
      id: 'program-1',
    });
    comparisonItemsRepository.createComparisonItem.mockReturnValue({
      id: 'comparison-item-draft',
      userId: 'user-1',
      targetType: 'program',
      targetId: 'program-1',
    });
    comparisonItemsRepository.saveComparisonItem.mockResolvedValue({
      id: 'comparison-item-1',
      userId: 'user-1',
      targetType: 'program',
      targetId: 'program-1',
    });

    const service = new ComparisonItemsService(
      asComparisonItemsRepository(comparisonItemsRepository),
    );
    const result = await service.create('user-1', {
      targetType: 'program',
      targetId: 'program-1',
    });

    expect(result).toEqual({
      comparisonItemId: 'comparison-item-1',
      currentCount: 2,
      maxCount: 4,
    });
  });

  it('rejects duplicate comparison items with the documented error code', async () => {
    const comparisonItemsRepository = createComparisonItemsRepositoryMock();
    comparisonItemsRepository.findComparisonItemByUserAndTarget.mockResolvedValue(
      {
        id: 'comparison-item-1',
        userId: 'user-1',
        targetType: 'program',
        targetId: 'program-1',
      },
    );

    const service = new ComparisonItemsService(
      asComparisonItemsRepository(comparisonItemsRepository),
    );

    await expect(
      service.create('user-1', {
        targetType: 'program',
        targetId: 'program-1',
      }),
    ).rejects.toMatchObject<ConflictException>({
      message: 'COMPARE_ITEM_DUPLICATED',
    });
  });

  it('rejects additions that exceed the compare-pool limit', async () => {
    const comparisonItemsRepository = createComparisonItemsRepositoryMock();
    comparisonItemsRepository.findComparisonItemByUserAndTarget.mockResolvedValue(
      null,
    );
    comparisonItemsRepository.countComparisonItemsByUser.mockResolvedValue(4);

    const service = new ComparisonItemsService(
      asComparisonItemsRepository(comparisonItemsRepository),
    );

    await expect(
      service.create('user-1', {
        targetType: 'program',
        targetId: 'program-5',
      }),
    ).rejects.toMatchObject<BadRequestException>({
      message: 'COMPARE_LIMIT_EXCEEDED',
    });
  });

  it('throws not found when the compared program does not exist', async () => {
    const comparisonItemsRepository = createComparisonItemsRepositoryMock();
    comparisonItemsRepository.findComparisonItemByUserAndTarget.mockResolvedValue(
      null,
    );
    comparisonItemsRepository.countComparisonItemsByUser.mockResolvedValue(0);
    comparisonItemsRepository.findProgramById.mockResolvedValue(null);

    const service = new ComparisonItemsService(
      asComparisonItemsRepository(comparisonItemsRepository),
    );

    await expect(
      service.create('user-1', {
        targetType: 'program',
        targetId: 'missing-program',
      }),
    ).rejects.toMatchObject<NotFoundException>({
      message: 'NOT_FOUND',
    });
  });

  it('returns comparison results in insertion order with dimensions', async () => {
    const comparisonItemsRepository = createComparisonItemsRepositoryMock();
    comparisonItemsRepository.getComparisonResultItems.mockResolvedValue([
      {
        targetId: 'program-1',
        targetType: 'program',
        schoolName: 'Test University',
        programName: 'Computer Science',
        examYear: 2025,
        totalScore: 390,
        applicationRatio: 6.2,
        interviewRatio: 1.5,
        plannedEnrollment: 30,
        tuitionPerYear: 12000,
        city: 'Hangzhou',
        examSubjects: ['101 Political Theory', '201 English I'],
        missingFlags: [],
      },
      {
        targetId: 'program-2',
        targetType: 'program',
        schoolName: 'Another University',
        programName: 'Software Engineering',
        examYear: 2025,
        totalScore: null,
        applicationRatio: 5.8,
        interviewRatio: null,
        plannedEnrollment: null,
        tuitionPerYear: 15000,
        city: 'Shanghai',
        examSubjects: [],
        missingFlags: ['score_line', 'interview_ratio', 'planned_enrollment'],
      },
    ]);

    const service = new ComparisonItemsService(
      asComparisonItemsRepository(comparisonItemsRepository),
    );
    const result = await service.getResult('user-1', {
      examYear: 2025,
    });

    expect(
      comparisonItemsRepository.getComparisonResultItems,
    ).toHaveBeenCalledWith('user-1', 2025);
    expect(result.items).toEqual([
      expect.objectContaining({
        targetId: 'program-1',
        programName: 'Computer Science',
        examYear: 2025,
      }),
      expect.objectContaining({
        targetId: 'program-2',
        missingFlags: ['score_line', 'interview_ratio', 'planned_enrollment'],
      }),
    ]);
    expect(result.dimensions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: 'totalScore',
        }),
        expect.objectContaining({
          key: 'examSubjects',
        }),
      ]),
    );
  });

  it('throws invalid params when the comparison pool is empty', async () => {
    const comparisonItemsRepository = createComparisonItemsRepositoryMock();
    comparisonItemsRepository.getComparisonResultItems.mockResolvedValue([]);

    const service = new ComparisonItemsService(
      asComparisonItemsRepository(comparisonItemsRepository),
    );

    await expect(
      service.getResult('user-1', {}),
    ).rejects.toMatchObject<BadRequestException>({
      message: 'INVALID_PARAMS',
    });
  });

  it('removes a comparison item for the current user', async () => {
    const comparisonItemsRepository = createComparisonItemsRepositoryMock();
    comparisonItemsRepository.findComparisonItemByUserAndTarget.mockResolvedValue(
      {
        id: 'comparison-item-1',
        userId: 'user-1',
        targetType: 'program',
        targetId: 'program-1',
      },
    );
    comparisonItemsRepository.removeComparisonItem.mockResolvedValue(undefined);

    const service = new ComparisonItemsService(
      asComparisonItemsRepository(comparisonItemsRepository),
    );

    await expect(
      service.remove('user-1', 'program', 'program-1'),
    ).resolves.toBeUndefined();
    expect(comparisonItemsRepository.removeComparisonItem).toHaveBeenCalledWith(
      {
        id: 'comparison-item-1',
        userId: 'user-1',
        targetType: 'program',
        targetId: 'program-1',
      },
    );
  });

  it('throws not found when removing a missing comparison item', async () => {
    const comparisonItemsRepository = createComparisonItemsRepositoryMock();
    comparisonItemsRepository.findComparisonItemByUserAndTarget.mockResolvedValue(
      null,
    );

    const service = new ComparisonItemsService(
      asComparisonItemsRepository(comparisonItemsRepository),
    );

    await expect(
      service.remove('user-1', 'program', 'missing-program'),
    ).rejects.toMatchObject<NotFoundException>({
      message: 'NOT_FOUND',
    });
  });
});
