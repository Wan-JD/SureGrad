import { IsDateString, IsIn, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export class QueryTodosDto extends PaginationQueryDto {
  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsIn(['pending', 'completed', 'cancelled'])
  status?: 'pending' | 'completed' | 'cancelled';

  @IsOptional()
  @IsUUID()
  subjectId?: string;

  @IsOptional()
  @IsIn(['manual', 'generated'])
  sourceType?: 'manual' | 'generated';
}
