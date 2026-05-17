import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class QueryWeeklyPlansDto {
  @IsOptional()
  @IsUUID()
  studyPlanId?: string;

  @IsOptional()
  @IsDateString()
  weekStartDate?: string;
}
