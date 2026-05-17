import { IsDateString, IsOptional } from 'class-validator';

export class CompleteTodoDto {
  @IsOptional()
  @IsDateString()
  completedAt?: string;
}
