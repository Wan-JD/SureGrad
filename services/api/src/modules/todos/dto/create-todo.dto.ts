import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateTodoDto {
  @IsOptional()
  @IsUUID()
  studyPlanId?: string;

  @IsOptional()
  @IsUUID()
  weeklyPlanId?: string;

  @IsOptional()
  @IsUUID()
  dailyPlanId?: string;

  @IsOptional()
  @IsUUID()
  subjectId?: string;

  @IsString()
  @MaxLength(255)
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  dueDate!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1440)
  expectedMinutes?: number;

  @IsOptional()
  @IsIn(['low', 'medium', 'high'])
  priority?: 'low' | 'medium' | 'high';
}
