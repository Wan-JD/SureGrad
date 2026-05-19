import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { FavoritesRepository } from './repositories/favorites.repository';
import { FavoritesService } from './favorites.service';

describe('FavoritesService', () => {
  type FavoriteTargetType = 'school' | 'program' | 'resource';
  type FavoriteRecord = {
    id: string;
    userId: string;
    targetType: FavoriteTargetType;
    targetId: string;
  };
  type PersistedFavoriteRecord = FavoriteRecord & {
    createdAt: Date;
  };
  type FavoriteListItem = {
    favoriteId: string;
    targetType: FavoriteTargetType;
    targetId: string;
    createdAt: string;
    targetSummary: Record<string, unknown> | null;
  };
  type FindFavoritesParams = {
    userId: string;
    targetType?: FavoriteTargetType;
    page: number;
    pageSize: number;
    sortBy?: string;
    sortOrder: 'asc' | 'desc';
  };
  type FavoritesRepositoryMock = {
    findFavoriteByUserAndTarget: jest.MockedFunction<
      (
        userId: string,
        targetType: FavoriteTargetType,
        targetId: string,
      ) => Promise<FavoriteRecord | null>
    >;
    ensureTargetExists: jest.MockedFunction<
      (targetType: FavoriteTargetType, targetId: string) => Promise<boolean>
    >;
    createFavorite: jest.MockedFunction<
      (
        input: Pick<FavoriteRecord, 'userId' | 'targetType' | 'targetId'>,
      ) => FavoriteRecord
    >;
    saveFavorite: jest.MockedFunction<
      (favorite: FavoriteRecord) => Promise<PersistedFavoriteRecord>
    >;
    findFavorites: jest.MockedFunction<
      (
        params: FindFavoritesParams,
      ) => Promise<{ items: FavoriteListItem[]; total: number }>
    >;
    removeFavorite: jest.MockedFunction<
      (favorite: FavoriteRecord) => Promise<void>
    >;
  };

  const createFavoritesRepositoryMock = (): FavoritesRepositoryMock => ({
    findFavoriteByUserAndTarget: jest.fn(),
    ensureTargetExists: jest.fn(),
    createFavorite: jest.fn(),
    saveFavorite: jest.fn(),
    findFavorites: jest.fn(),
    removeFavorite: jest.fn(),
  });

  const asFavoritesRepository = (
    repository: FavoritesRepositoryMock,
  ): FavoritesRepository => repository as unknown as FavoritesRepository;

  it('creates a favorite after validating the target and uniqueness', async () => {
    const favoritesRepository = createFavoritesRepositoryMock();
    favoritesRepository.findFavoriteByUserAndTarget.mockResolvedValue(null);
    favoritesRepository.ensureTargetExists.mockResolvedValue(true);
    favoritesRepository.createFavorite.mockReturnValue({
      id: 'favorite-draft',
      userId: 'user-1',
      targetType: 'school',
      targetId: 'school-1',
    });
    favoritesRepository.saveFavorite.mockResolvedValue({
      id: 'favorite-1',
      userId: 'user-1',
      targetType: 'school',
      targetId: 'school-1',
      createdAt: new Date('2026-05-17T08:00:00.000Z'),
    });

    const service = new FavoritesService(
      asFavoritesRepository(favoritesRepository),
    );
    const result = await service.create('user-1', {
      targetType: 'school',
      targetId: 'school-1',
    });

    expect(favoritesRepository.ensureTargetExists).toHaveBeenCalledWith(
      'school',
      'school-1',
    );
    expect(result).toEqual({
      favoriteId: 'favorite-1',
      targetType: 'school',
      targetId: 'school-1',
      createdAt: '2026-05-17T08:00:00.000Z',
    });
  });

  it('rejects duplicate favorites with the documented error code', async () => {
    const favoritesRepository = createFavoritesRepositoryMock();
    favoritesRepository.findFavoriteByUserAndTarget.mockResolvedValue({
      id: 'favorite-1',
      userId: 'user-1',
      targetType: 'program',
      targetId: 'program-1',
    });

    const service = new FavoritesService(
      asFavoritesRepository(favoritesRepository),
    );

    await expect(
      service.create('user-1', {
        targetType: 'program',
        targetId: 'program-1',
      }),
    ).rejects.toMatchObject<ConflictException>({
      message: 'FAVORITE_DUPLICATED',
    });
  });

  it('throws not found when the target does not exist', async () => {
    const favoritesRepository = createFavoritesRepositoryMock();
    favoritesRepository.findFavoriteByUserAndTarget.mockResolvedValue(null);
    favoritesRepository.ensureTargetExists.mockResolvedValue(false);

    const service = new FavoritesService(
      asFavoritesRepository(favoritesRepository),
    );

    await expect(
      service.create('user-1', {
        targetType: 'resource',
        targetId: 'resource-1',
      }),
    ).rejects.toMatchObject<NotFoundException>({
      message: 'NOT_FOUND',
    });
  });

  it('returns an empty favorite list with pagination metadata', async () => {
    const favoritesRepository = createFavoritesRepositoryMock();
    favoritesRepository.findFavorites.mockResolvedValue({
      items: [],
      total: 0,
    });

    const service = new FavoritesService(
      asFavoritesRepository(favoritesRepository),
    );
    const result = await service.findAll('user-1', {
      page: 1,
      pageSize: 20,
    });

    expect(favoritesRepository.findFavorites).toHaveBeenCalledWith({
      userId: 'user-1',
      page: 1,
      pageSize: 20,
      sortBy: undefined,
      sortOrder: 'desc',
      targetType: undefined,
    });
    expect(result).toEqual({
      items: [],
      pagination: {
        page: 1,
        pageSize: 20,
        total: 0,
        hasMore: false,
      },
    });
  });

  it('returns typed target summaries from the favorite list query', async () => {
    const favoritesRepository = createFavoritesRepositoryMock();
    favoritesRepository.findFavorites.mockResolvedValue({
      items: [
        {
          favoriteId: 'favorite-school-1',
          targetType: 'school',
          targetId: 'school-1',
          createdAt: '2026-05-17T08:00:00.000Z',
          targetSummary: {
            schoolId: 'school-1',
            schoolName: 'Test University',
            province: 'Zhejiang',
            city: 'Hangzhou',
            schoolLevel: '211',
            schoolType: 'comprehensive',
          },
        },
        {
          favoriteId: 'favorite-program-1',
          targetType: 'program',
          targetId: 'program-1',
          createdAt: '2026-05-16T08:00:00.000Z',
          targetSummary: {
            programId: 'program-1',
            programName: 'Computer Science',
            schoolId: 'school-1',
            schoolName: 'Test University',
            departmentId: 'department-1',
            departmentName: 'School of Computer Science',
            degreeType: 'academic',
            disciplineCategory: 'engineering',
            researchDirection: 'Artificial Intelligence',
            tuitionPerYear: 12000,
            city: 'Hangzhou',
            latestScoreLineSummary: null,
            latestApplicationRatioSummary: null,
            latestInterviewRatioSummary: null,
          },
        },
      ],
      total: 2,
    });

    const service = new FavoritesService(
      asFavoritesRepository(favoritesRepository),
    );
    const result = await service.findAll('user-1', {
      targetType: 'program',
      page: 1,
      pageSize: 20,
      sortBy: 'created_at',
      sortOrder: 'desc',
    });

    expect(result.items).toHaveLength(2);
    expect(result.items[0]).toMatchObject({
      favoriteId: 'favorite-school-1',
      targetType: 'school',
      targetSummary: {
        schoolName: 'Test University',
      },
    });
    expect(result.items[1]).toMatchObject({
      favoriteId: 'favorite-program-1',
      targetType: 'program',
      targetSummary: {
        programName: 'Computer Science',
        departmentName: 'School of Computer Science',
      },
    });
  });

  it('rejects unsupported favorite sorting fields', async () => {
    const service = new FavoritesService(
      asFavoritesRepository(createFavoritesRepositoryMock()),
    );

    await expect(
      service.findAll('user-1', {
        sortBy: 'updated_at',
      }),
    ).rejects.toMatchObject<BadRequestException>({
      message: 'INVALID_PARAMS',
    });
  });

  it('removes a favorite owned by the current user', async () => {
    const favoritesRepository = createFavoritesRepositoryMock();
    favoritesRepository.findFavoriteByUserAndTarget.mockResolvedValue({
      id: 'favorite-1',
      userId: 'user-1',
      targetType: 'school',
      targetId: 'school-1',
    });
    favoritesRepository.removeFavorite.mockResolvedValue(undefined);

    const service = new FavoritesService(
      asFavoritesRepository(favoritesRepository),
    );

    await expect(
      service.remove('user-1', 'school', 'school-1'),
    ).resolves.toBeUndefined();
    expect(favoritesRepository.removeFavorite).toHaveBeenCalledWith({
      id: 'favorite-1',
      userId: 'user-1',
      targetType: 'school',
      targetId: 'school-1',
    });
  });

  it('throws not found when removing a missing favorite', async () => {
    const favoritesRepository = createFavoritesRepositoryMock();
    favoritesRepository.findFavoriteByUserAndTarget.mockResolvedValue(null);

    const service = new FavoritesService(
      asFavoritesRepository(favoritesRepository),
    );

    await expect(
      service.remove('user-1', 'school', 'missing-school'),
    ).rejects.toMatchObject<NotFoundException>({
      message: 'NOT_FOUND',
    });
  });
});
