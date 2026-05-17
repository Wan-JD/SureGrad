import { Injectable } from '@nestjs/common';
import { buildSkeletonResponse } from '../../common/utils/build-skeleton-response';
import { LoginWithOtpDto } from './dto/login-with-otp.dto';
import { SendOtpDto } from './dto/send-otp.dto';

@Injectable()
export class AuthService {
  sendOtp(dto: SendOtpDto) {
    return buildSkeletonResponse({
      domain: 'auth',
      action: 'sendOtp',
      message:
        'OTP delivery pipeline is scaffolded but not wired to an SMS provider yet.',
      nextSteps: [
        'Integrate SMS provider credentials and delivery adapter.',
        'Persist OTP challenge state in Redis or PostgreSQL.',
        'Add rate limiting and anti-abuse checks.',
      ],
      payload: dto,
    });
  }

  loginWithOtp(dto: LoginWithOtpDto) {
    return buildSkeletonResponse({
      domain: 'auth',
      action: 'loginWithOtp',
      message:
        'OTP login flow is reserved here, but token issuance and user bootstrap are still pending.',
      nextSteps: [
        'Verify OTP codes against the chosen challenge store.',
        'Issue JWT access and refresh tokens.',
        'Create user records on first login.',
      ],
      payload: dto,
    });
  }
}
