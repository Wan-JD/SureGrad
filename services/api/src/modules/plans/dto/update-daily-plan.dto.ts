import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateDailyPlanDto {
  @IsOptional()
  @IsString()
  focusSummary?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1440)
  plannedMinutes?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsIn(['draft', 'active', 'completed', 'skipped'])
  status?: 'draft' | 'active' | 'completed' | 'skipped';
}
