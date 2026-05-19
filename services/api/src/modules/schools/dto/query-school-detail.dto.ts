import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class QuerySchoolDetailDto {
  @IsOptional()
  @IsInt()
  @Min(2000)
  @Max(2100)
  examYear?: number;
}
