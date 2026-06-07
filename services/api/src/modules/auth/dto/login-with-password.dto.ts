import { IsString, MaxLength, MinLength } from 'class-validator';

export class LoginWithPasswordDto {
  @IsString()
  @MaxLength(255)
  account!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;
}
