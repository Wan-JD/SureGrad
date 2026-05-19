import { IsOptional, IsString } from 'class-validator';

export class QueryProgramDetailDto {
  @IsOptional()
  @IsString()
  examYears?: string;
}
