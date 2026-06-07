import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterWithPasswordDto {
  @IsString()
  @MaxLength(255)
  account!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  nickname?: string;

  @IsString()
  captchaId!: string;

  @IsString()
  @MaxLength(12)
  code!: string;
}
