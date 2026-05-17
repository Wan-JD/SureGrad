import { IsIn, IsOptional } from 'class-validator';

export class QueryStudyStatsDto {
  @IsOptional()
  @IsIn(['today', 'week'])
  range?: 'today' | 'week';
}
