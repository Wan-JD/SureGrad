import { IsIn, Matches } from 'class-validator';

export class SendOtpDto {
  @Matches(/^1\d{10}$/, {
    message: 'phone must be a valid mainland China mobile number',
  })
  phone!: string;

  @IsIn(['login'])
  scene!: 'login';
}
