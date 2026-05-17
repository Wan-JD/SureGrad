import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class QueryDailyPlansDto {
  @IsOptional()
  @IsUUID()
  studyPlanId?: string;

  @IsDateString()
  date!: string;
}
