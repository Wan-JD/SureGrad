import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { MockTokenService } from '../../common/auth/mock-token.service';
import { maskPhone } from '../../common/utils/mask-phone.util';
import { UsersRepository } from '../users/repositories/users.repository';
import { LoginWithOtpDto } from './dto/login-with-otp.dto';
import { SendOtpDto } from './dto/send-otp.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly mockTokenService: MockTokenService,
  ) {}

  sendOtp(dto: SendOtpDto) {
    return {
      sent: dto.scene === 'login',
      expireSeconds: 300,
      retryAfterSeconds: 60,
    };
  }

  async loginWithOtp(dto: LoginWithOtpDto) {
    if (dto.otpCode !== '123456') {
      throw new BadRequestException('OTP_INVALID');
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
}
