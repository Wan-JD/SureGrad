import { Injectable } from '@nestjs/common';
import { buildSkeletonResponse } from '../../common/utils/build-skeleton-response';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { QueryFavoritesDto } from './dto/query-favorites.dto';

@Injectable()
export class FavoritesService {
  findAll(query: QueryFavoritesDto) {
    return buildSkeletonResponse({
      domain: 'favorites',
      action: 'findAll',
      message:
        'Favorite listing is scaffolded, but grouped projections by target type are still pending.',
      nextSteps: [
        'Load current user favorites by target type.',
        'Join school, program, or resource summaries for the list view.',
      ],
      payload: query,
    });
  }

  create(dto: CreateFavoriteDto) {
    return buildSkeletonResponse({
      domain: 'favorites',
      action: 'create',
      message:
        'Favorite creation is scaffolded, but uniqueness checks and target validation are still pending.',
      nextSteps: [
        'Validate the referenced target exists and is visible to the user.',
        'Enforce per-user uniqueness on target_type + target_id.',
      ],
      payload: dto,
    });
  }

  remove(targetType: string, targetId: string) {
    return buildSkeletonResponse({
      domain: 'favorites',
      action: 'remove',
      message:
        'Favorite deletion is scaffolded, but ownership checks and delete strategy are still pending.',
      nextSteps: [
        'Resolve the favorite record for the current user.',
        'Perform soft delete or hard delete based on persistence policy.',
      ],
      payload: {
        targetType,
        targetId,
      },
    });
  }
}
