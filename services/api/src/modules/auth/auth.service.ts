import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { MockTokenService } from '../../common/auth/mock-token.service';
import { maskPhone } from '../../common/utils/mask-phone.util';
import { UsersRepository } from '../users/repositories/users.repository';
import { LoginWithOtpDto } from './dto/login-with-otp.dto';
import { OtpService } from './otp.service';
import { SendOtpDto } from './dto/send-otp.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly mockTokenService: MockTokenService,
    private readonly otpService: OtpService,
  ) {}

  sendOtp(dto: SendOtpDto) {
    try {
      const result = this.otpService.issue(dto.phone);
      return {
        sent: true,
        expireSeconds: result.expireSeconds,
        retryAfterSeconds: result.retryAfterSeconds,
      };
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'RATE_LIMITED') {
        throw new HttpException(
          'Too many OTP requests. Try again later.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
      throw err;
    }
  }

  async loginWithOtp(dto: LoginWithOtpDto) {
    const verification = this.otpService.verify(dto.phone, dto.otpCode);
    if (!verification.valid) {
      throw new BadRequestException(verification.reason ?? 'OTP_INVALID');
    }

    let user = await this.usersRepository.findUserByPhone(dto.phone);
    const isNewUser = !user;

    if (!user) {
      user = this.usersRepository.createUser(
        dto.phone,
        `SureGrad${dto.phone.slice(-4)}`,
      );
    }

    if (user.status === 'disabled') {
      throw new ForbiddenException('FORBIDDEN');
    }

    user.lastLoginAt = new Date();
    user = await this.usersRepository.saveUser(user);

    const profile = await this.usersRepository.findProfileByUserId(user.id);

    return {
      accessToken: this.mockTokenService.createToken(user.id, 'access'),
      refreshToken: this.mockTokenService.createToken(user.id, 'refresh'),
      expiresIn: 7 * 24 * 60 * 60,
      isNewUser,
      profileCompleted: Boolean(profile?.onboardingCompleted),
      user: {
        userId: user.id,
        phoneMasked: maskPhone(user.phone),
        nickname: user.nickname,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  async refreshToken(refreshToken: string) {
    const parsed = this.mockTokenService.parseToken(refreshToken);
    if (!parsed || parsed.tokenType !== 'refresh') {
      throw new BadRequestException('INVALID_REFRESH_TOKEN');
    }

    const user = await this.usersRepository.findUserById(parsed.userId);
    if (!user || user.status === 'disabled') {
      throw new ForbiddenException('FORBIDDEN');
    }

    return {
      accessToken: this.mockTokenService.createToken(user.id, 'access'),
      refreshToken: this.mockTokenService.createToken(user.id, 'refresh'),
      expiresIn: 7 * 24 * 60 * 60,
    };
  }
}
