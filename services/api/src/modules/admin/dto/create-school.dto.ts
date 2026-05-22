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

export class CreateSchoolDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  shortName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  code?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  province!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  city!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  schoolType!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  schoolLevel!: string;

  @IsOptional()
  @IsBoolean()
  hasGraduateSchool?: boolean;

  @IsOptional()
  @IsString()
  officialWebsite?: string;

  @IsOptional()
  @IsString()
  graduateWebsite?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: 'active' | 'inactive';
}
