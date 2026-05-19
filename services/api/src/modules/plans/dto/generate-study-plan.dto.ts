import { IsBoolean, IsDateString, IsIn, IsOptional } from 'class-validator';

export class GenerateStudyPlanDto {
  @IsIn(['standard', 'weak_foundation', 'cross_major', 'working'])
  templateType!: 'standard' | 'weak_foundation' | 'cross_major' | 'working';

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsOptional()
  @IsBoolean()
  forceRegenerate?: boolean;
}
