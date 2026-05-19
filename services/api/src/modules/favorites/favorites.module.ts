import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FavoriteEntity } from '../../database/entities/favorite.entity';
import { ProgramApplicationStatEntity } from '../../database/entities/program-application-stat.entity';
import { ProgramInterviewStatEntity } from '../../database/entities/program-interview-stat.entity';
import { ProgramScoreLineEntity } from '../../database/entities/program-score-line.entity';
import { ProgramEntity } from '../../database/entities/program.entity';
import { SchoolEntity } from '../../database/entities/school.entity';
import { FavoritesController } from './favorites.controller';
import { FavoritesRepository } from './repositories/favorites.repository';
import { FavoritesService } from './favorites.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FavoriteEntity,
      SchoolEntity,
      ProgramEntity,
      ProgramScoreLineEntity,
      ProgramApplicationStatEntity,
      ProgramInterviewStatEntity,
    ]),
  ],
  controllers: [FavoritesController],
  providers: [FavoritesRepository, FavoritesService],
})
export class FavoritesModule {}
