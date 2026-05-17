import {
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class LoginWithOtpDto {
  @Matches(/^1\d{10}$/, {
    message: 'phone must be a valid mainland China mobile number',
  })
  phone!: string;

  @IsString()
  @MinLength(4)
  @MaxLength(6)
  otpCode!: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  deviceId?: string;
}
