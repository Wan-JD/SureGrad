import { IsBoolean, IsIn, IsOptional } from 'class-validator';

export class QueryRemindersDto {
  @IsOptional()
  @IsIn(['countdown', 'plan', 'todo', 'custom'])
  reminderType?: 'countdown' | 'plan' | 'todo' | 'custom';

  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;
}
