import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class CreateCheckinDto {
  @IsOptional()
  @IsDateString()
  checkinDate?: string;

  @IsInt()
  @Min(0)
  @Max(1440)
  totalStudyMinutes!: number;

  @IsOptional()
  @IsUUID()
  primarySubjectId?: string;

  @IsOptional()
  @IsString()
  reflection?: string;

  @IsOptional()
  @IsString()
  moodTag?: string;
}
