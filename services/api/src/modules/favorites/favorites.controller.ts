import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MockAuthGuard } from '../../common/auth/mock-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/types/auth-user.type';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { QueryFavoritesDto } from './dto/query-favorites.dto';
import { FavoritesService } from './favorites.service';

@Controller('favorites')
@UseGuards(MockAuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  findAll(@CurrentUser() user: AuthUser, @Query() query: QueryFavoritesDto) {
    return this.favoritesService.findAll(user.userId, query);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateFavoriteDto) {
    return this.favoritesService.create(user.userId, dto);
  }

  @Delete()
  @HttpCode(204)
  remove(@CurrentUser() user: AuthUser, @Query() query: CreateFavoriteDto) {
    return this.favoritesService.remove(
      user.userId,
      query.targetType,
      query.targetId,
    );
  }
}
