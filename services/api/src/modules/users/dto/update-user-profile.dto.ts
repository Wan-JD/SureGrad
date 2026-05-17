import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class UpdateUserProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  nickname?: string;

  @IsOptional()
  @IsUrl()
  avatarUrl?: string;

  @IsInt()
  @Min(2000)
  @Max(2100)
  examYear!: number;

  @Matches(/^(fresh|second_try|working)$/)
  identityType!: 'fresh' | 'second_try' | 'working';

  @IsString()
  @MaxLength(255)
  undergraduateMajor!: string;

  @IsString()
  @MaxLength(255)
  intendedDiscipline!: string;

  @Min(0)
  @Max(24)
  dailyStudyHours!: number;

  @IsBoolean()
  examMathRequired!: boolean;

  @IsOptional()
  @IsBoolean()
  onboardingCompleted?: boolean;
}
