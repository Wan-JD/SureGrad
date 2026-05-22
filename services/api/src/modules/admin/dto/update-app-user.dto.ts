import {
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateAppUserDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  nickname?: string;

  @IsOptional()
  @IsIn(['active', 'disabled'])
  status?: 'active' | 'disabled';
}
