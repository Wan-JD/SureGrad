import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { MockTokenService } from '../../common/auth/mock-token.service';
import {
  maskEmail,
  parseAccountIdentity,
} from '../../common/utils/account-identity.util';
import { maskPhone } from '../../common/utils/mask-phone.util';
import { hashPassword, verifyPassword } from '../../common/utils/password.util';
import { UserEntity } from '../../database/entities/user.entity';
import { UsersRepository } from '../users/repositories/users.repository';
import { CaptchaService } from './captcha.service';
import { LoginWithPasswordDto } from './dto/login-with-password.dto';
import { LoginWithOtpDto } from './dto/login-with-otp.dto';
import { OtpService } from './otp.service';
import { RegisterWithPasswordDto } from './dto/register-with-password.dto';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyCaptchaDto } from './dto/verify-captcha.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly mockTokenService: MockTokenService,
    private readonly otpService: OtpService,
    private readonly captchaService: CaptchaService,
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
      user = this.usersRepository.createUser({
        phone: dto.phone,
        nickname: `SureGrad${dto.phone.slice(-4)}`,
      });
    }

    return this.buildSession(user, isNewUser);
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

  issueCaptcha() {
    return this.captchaService.issue();
  }

  async loginWithCaptcha(dto: VerifyCaptchaDto & { phone: string }) {
    const verification = this.captchaService.verify(dto.captchaId, dto.code);
    if (!verification.valid) {
      throw new BadRequestException(verification.reason ?? 'CAPTCHA_INVALID');
    }

    let user = await this.usersRepository.findUserByPhone(dto.phone);
    const isNewUser = !user;

    if (!user) {
      user = this.usersRepository.createUser({
        phone: dto.phone,
        nickname: `SureGrad${dto.phone.slice(-4)}`,
      });
    }

    return this.buildSession(user, isNewUser);
  }

  async registerWithPassword(dto: RegisterWithPasswordDto) {
    const verification = this.captchaService.verify(dto.captchaId, dto.code);
    if (!verification.valid) {
      throw new BadRequestException(verification.reason ?? 'CAPTCHA_INVALID');
    }

    const identity = parseAccountIdentity(dto.account);
    if (!identity) {
      throw new BadRequestException('INVALID_ACCOUNT');
    }

    const existing = await this.usersRepository.findUserByAccount(
      identity.phone,
      identity.email,
    );
    if (existing) {
      throw new ConflictException('ACCOUNT_EXISTS');
    }

    const nickname = dto.nickname?.trim() || this.defaultNickname(identity);
    const user = this.usersRepository.createUser({
      phone: identity.phone,
      email: identity.email,
      nickname,
      passwordHash: hashPassword(dto.password),
    });

    return this.buildSession(user, true);
  }

  async loginWithPassword(dto: LoginWithPasswordDto) {
    const identity = parseAccountIdentity(dto.account);
    if (!identity) {
      throw new BadRequestException('INVALID_ACCOUNT');
    }

    const user = await this.usersRepository.findUserByAccount(
      identity.phone,
      identity.email,
    );
    if (
      !user?.passwordHash ||
      !verifyPassword(dto.password, user.passwordHash)
    ) {
      throw new BadRequestException('INVALID_CREDENTIALS');
    }

    return this.buildSession(user, false);
  }

  private async buildSession(user: UserEntity, isNewUser: boolean) {
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
        phoneMasked: user.phone ? maskPhone(user.phone) : null,
        emailMasked: user.email ? maskEmail(user.email) : null,
        accountLabel: user.phone
          ? maskPhone(user.phone)
          : user.email
            ? maskEmail(user.email)
            : null,
        nickname: user.nickname,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  private defaultNickname(identity: {
    phone: string | null;
    email: string | null;
  }) {
    if (identity.phone) {
      return `SureGrad${identity.phone.slice(-4)}`;
    }

    return `SureGrad${identity.email?.split('@')[0].slice(0, 12) ?? 'User'}`;
  }
}
