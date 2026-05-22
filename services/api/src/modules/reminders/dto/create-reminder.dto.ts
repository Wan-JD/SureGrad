import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateReminderDto {
  @IsIn(['study', 'todo'])
  reminderType!: 'study' | 'todo';

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title!: string;

  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsDateString()
  remindAt!: string;

  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @IsOptional()
  @IsIn(['todo', 'plan', 'program', 'other'])
  relatedTargetType?: 'todo' | 'plan' | 'program' | 'other';

  @IsOptional()
  @IsUUID()
  relatedTargetId?: string;
}
