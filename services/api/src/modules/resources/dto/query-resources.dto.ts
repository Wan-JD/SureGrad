import { IsBoolean, IsIn, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export class QueryResourcesDto extends PaginationQueryDto {
  @IsOptional()
  @IsIn(['course', 'book', 'past_exam', 'public_resource', 'article'])
  resourceType?:
    | 'course'
    | 'book'
    | 'past_exam'
    | 'public_resource'
    | 'article';

  @IsOptional()
  @IsUUID()
  subjectId?: string;

  @IsOptional()
  @IsIn(['foundation', 'intensive', 'final', 'interview'])
  stageTag?: 'foundation' | 'intensive' | 'final' | 'interview';

  @IsOptional()
  @IsBoolean()
  isPublicLegal?: boolean;
}
