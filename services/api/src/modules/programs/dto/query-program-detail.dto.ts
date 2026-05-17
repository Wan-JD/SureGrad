import { IsOptional, IsString, Matches } from 'class-validator';

export class QueryProgramDetailDto {
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}(,\d{4})*$/, {
    message: 'examYears must be a comma-separated list such as 2023,2024,2025',
  })
  examYears?: string;
}
