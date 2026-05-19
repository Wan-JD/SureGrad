import {
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class UpdateDailyPlanDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(0)
  @Max(24)
  expectedHours?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsIn(['draft', 'active', 'completed', 'skipped'])
  status?: 'draft' | 'active' | 'completed' | 'skipped';
}
