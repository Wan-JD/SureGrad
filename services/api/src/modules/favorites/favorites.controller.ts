import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { QueryFavoritesDto } from './dto/query-favorites.dto';
import { FavoritesService } from './favorites.service';

@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  findAll(@Query() query: QueryFavoritesDto) {
    return this.favoritesService.findAll(query);
  }

  @Post()
  create(@Body() dto: CreateFavoriteDto) {
    return this.favoritesService.create(dto);
  }

  @Delete()
  remove(
    @Query('targetType') targetType: string,
    @Query('targetId') targetId: string,
  ) {
    return this.favoritesService.remove(targetType, targetId);
  }
}
