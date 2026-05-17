import { IsDateString, IsIn, IsOptional, IsUUID } from 'class-validator';

export class GenerateStudyPlanDto {
  @IsOptional()
  @IsUUID()
  userTargetId?: string;

  @IsIn(['standard', 'weak_foundation', 'cross_major', 'working'])
  templateType!: 'standard' | 'weak_foundation' | 'cross_major' | 'working';

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
