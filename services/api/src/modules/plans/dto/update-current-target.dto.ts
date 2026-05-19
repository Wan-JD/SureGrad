import { IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

export class UpdateCurrentTargetDto {
  @IsUUID()
  schoolId!: string;

  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @IsOptional()
  @IsUUID()
  programId?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(500)
  targetScore?: number;
}
