import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class UpdateSchoolDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  shortName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  code?: string | null;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  province?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  city?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  schoolType?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  schoolLevel?: string;

  @IsOptional()
  @IsBoolean()
  hasGraduateSchool?: boolean;

  @IsOptional()
  @IsString()
  officialWebsite?: string | null;

  @IsOptional()
  @IsString()
  graduateWebsite?: string | null;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: 'active' | 'inactive';
}
