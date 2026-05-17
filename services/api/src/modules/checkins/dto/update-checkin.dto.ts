import { IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class UpdateCheckinDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1440)
  totalStudyMinutes?: number;

  @IsOptional()
  @IsUUID()
  primarySubjectId?: string | null;

  @IsOptional()
  @IsString()
  reflection?: string;

  @IsOptional()
  @IsString()
  moodTag?: string | null;
}
