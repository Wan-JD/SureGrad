import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateWeeklyPlanDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  goals?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(168)
  expectedHours?: number;

  @IsOptional()
  @IsIn(['draft', 'active', 'completed', 'skipped'])
  status?: 'draft' | 'active' | 'completed' | 'skipped';
}
