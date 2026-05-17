import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export class QueryResourcesDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  resourceType?: string;

  @IsOptional()
  @IsUUID()
  subjectId?: string;

  @IsOptional()
  @IsString()
  stageTag?: string;

  @IsOptional()
  @IsBoolean()
  isPublicLegal?: boolean;
}
