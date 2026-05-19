import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { QueryFavoritesDto } from './dto/query-favorites.dto';
import { FavoritesRepository } from './repositories/favorites.repository';

@Injectable()
export class FavoritesService {
  constructor(private readonly favoritesRepository: FavoritesRepository) {}

  async findAll(userId: string, query: QueryFavoritesDto) {
    this.validateSortBy(query.sortBy);

    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const sortOrder = query.sortOrder ?? 'desc';
    const result = await this.favoritesRepository.findFavorites({
      userId,
      targetType: query.targetType,
      page,
      pageSize,
      sortBy: query.sortBy,
      sortOrder,
    });

    return {
      items: result.items,
      pagination: {
        page,
        pageSize,
        total: result.total,
        hasMore: page * pageSize < result.total,
      },
    };
  }

  async create(userId: string, dto: CreateFavoriteDto) {
    const existingFavorite =
      await this.favoritesRepository.findFavoriteByUserAndTarget(
        userId,
        dto.targetType,
        dto.targetId,
      );
    if (existingFavorite) {
      throw new ConflictException('FAVORITE_DUPLICATED');
    }

    const targetExists = await this.favoritesRepository.ensureTargetExists(
      dto.targetType,
      dto.targetId,
    );
    if (!targetExists) {
      throw new NotFoundException('NOT_FOUND');
    }

    try {
      const favorite = this.favoritesRepository.createFavorite({
        userId,
        targetType: dto.targetType,
        targetId: dto.targetId,
      });
      const savedFavorite =
        await this.favoritesRepository.saveFavorite(favorite);

      return {
        favoriteId: savedFavorite.id,
        targetType: savedFavorite.targetType,
        targetId: savedFavorite.targetId,
        createdAt: savedFavorite.createdAt.toISOString(),
      };
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException('FAVORITE_DUPLICATED');
      }

      throw error;
    }
  }

  async remove(
    userId: string,
    targetType: CreateFavoriteDto['targetType'],
    targetId: string,
  ) {
    const favorite = await this.favoritesRepository.findFavoriteByUserAndTarget(
      userId,
      targetType,
      targetId,
    );
    if (!favorite) {
      throw new NotFoundException('NOT_FOUND');
    }

    await this.favoritesRepository.removeFavorite(favorite);
  }

  private validateSortBy(sortBy?: string) {
    if (!sortBy || sortBy === 'created_at') {
      return;
    }

    throw new BadRequestException('INVALID_PARAMS');
  }

  private isUniqueViolation(error: unknown) {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === '23505'
    );
  }
}
