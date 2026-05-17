import { IsIn, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export class QueryFavoritesDto extends PaginationQueryDto {
  @IsOptional()
  @IsIn(['school', 'program', 'resource'])
  targetType?: 'school' | 'program' | 'resource';
}
