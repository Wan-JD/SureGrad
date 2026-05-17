import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export class QuerySchoolsDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  province?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  schoolLevel?: string;

  @IsOptional()
  @IsString()
  schoolType?: string;

  @IsOptional()
  @IsString()
  disciplineCategory?: string;

  @IsOptional()
  @IsString()
  degreeType?: string;

  @IsOptional()
  @IsBoolean()
  examMathRequired?: boolean;

  @IsOptional()
  @IsInt()
  @Min(2000)
  @Max(2100)
  examYear?: number;
}
