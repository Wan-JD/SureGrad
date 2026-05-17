import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateReminderDto {
  @IsString()
  @MaxLength(100)
  title!: string;

  @IsIn(['countdown', 'plan', 'todo', 'custom'])
  reminderType!: 'countdown' | 'plan' | 'todo' | 'custom';

  @IsOptional()
  @IsDateString()
  reminderDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5)
  reminderTime?: string;

  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;
}
