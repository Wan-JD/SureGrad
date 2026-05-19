import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export class QuerySchoolProgramsDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @IsOptional()
  @IsInt()
  @Min(2000)
  @Max(2100)
  examYear?: number;

  @IsOptional()
  @IsString()
  degreeType?: string;

  @IsOptional()
  @IsString()
  disciplineCategory?: string;

  @IsOptional()
  @IsBoolean()
  examMathRequired?: boolean;
}
