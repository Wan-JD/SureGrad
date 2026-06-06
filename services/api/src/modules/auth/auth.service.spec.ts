import {
  BadRequestException,
  ForbiddenException,
  HttpException,
} from '@nestjs/common';
import { MockTokenService } from '../../common/auth/mock-token.service';
import { UsersRepository } from '../users/repositories/users.repository';
import { AuthService } from './auth.service';
import { OtpService } from './otp.service';

describe('AuthService', () => {
  const createUsersRepositoryMock = () =>
    ({
      findUserByPhone: jest.fn(),
      findUserById: jest.fn(),
      createUser: jest.fn(),
      saveUser: jest.fn(),
      findProfileByUserId: jest.fn(),
    }) as unknown as jest.Mocked<UsersRepository>;

  const createAuthService = (usersRepository = createUsersRepositoryMock()) => {
    const otpService = new OtpService();
    return {
      service: new AuthService(
        usersRepository,
        new MockTokenService(),
        otpService,
      ),
      otpService,
      usersRepository,
    };
  };

  describe('sendOtp', () => {
    it('returns otp metadata with sent=true', () => {
      const { service } = createAuthService();
      const result = service.sendOtp({ phone: '13800138000', scene: 'login' });

      expect(result).toMatchObject({
        sent: true,
        expireSeconds: 300,
        retryAfterSeconds: 60,
      });
    });

    it('returns retry info when called again within cooldown', () => {
      const { service } = createAuthService();
      service.sendOtp({ phone: '13800138000', scene: 'login' });
      const result = service.sendOtp({ phone: '13800138000', scene: 'login' });

      expect(result.sent).toBe(true);
      expect(result.retryAfterSeconds).toBeGreaterThan(0);
    });

    it('throws TooManyRequestsException when rate limited', () => {
      const { service } = createAuthService();
      const phone = '13900139000';
      for (let i = 0; i < 5; i++) {
        service.sendOtp({ phone, scene: 'login' });
      }

      expect(() => service.sendOtp({ phone, scene: 'login' })).toThrow(
        HttpException,
      );
    });
  });

  describe('loginWithOtp', () => {
    it('rejects when no OTP was issued for the phone', async () => {
      const { service } = createAuthService();

      await expect(
        service.loginWithOtp({ phone: '13800138000', otpCode: '123456' }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects invalid otp codes', async () => {
      const { service, otpService } = createAuthService();
      const { code } = otpService.issue('13800138000');

      await expect(
        service.loginWithOtp({
          phone: '13800138000',
          otpCode: code === '999999' ? '000000' : '999999',
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects disabled users even with valid OTP', async () => {
      const usersRepository = createUsersRepositoryMock();
      usersRepository.findUserByPhone = jest.fn().mockResolvedValue({
        id: 'user-1',
        phone: '13800138000',
        nickname: 'SureGrad8000',
        avatarUrl: null,
        status: 'disabled',
        lastLoginAt: null,
      });

      const { service, otpService } = createAuthService(usersRepository);
      const { code } = otpService.issue('13800138000');

      await expect(
        service.loginWithOtp({ phone: '13800138000', otpCode: code }),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('creates a new user and returns tokens', async () => {
      const usersRepository = createUsersRepositoryMock();
      const createdUser = {
        id: 'user-1',
        phone: '13800138000',
        nickname: 'SureGrad8000',
        avatarUrl: null,
        passwordHash: null,
        status: 'active',
        lastLoginAt: null,
      };

      usersRepository.findUserByPhone = jest.fn().mockResolvedValue(null);
      usersRepository.createUser = jest.fn().mockReturnValue(createdUser);
      usersRepository.saveUser = jest
        .fn()
        .mockImplementation(
          (user: Parameters<UsersRepository['saveUser']>[0]) =>
            Promise.resolve(user),
        );
      usersRepository.findProfileByUserId = jest.fn().mockResolvedValue({
        onboardingCompleted: true,
      });

      const { service, otpService } = createAuthService(usersRepository);
      const { code } = otpService.issue('13800138000');
      const result = await service.loginWithOtp({
        phone: '13800138000',
        otpCode: code,
      });

      expect(result).toMatchObject({
        isNewUser: true,
        profileCompleted: true,
        user: {
          userId: 'user-1',
          phoneMasked: '138****8000',
          nickname: 'SureGrad8000',
        },
      });
      const mockTokenService = new MockTokenService();
      expect(mockTokenService.parseToken(result.accessToken)).toMatchObject({
        userId: 'user-1',
        tokenType: 'access',
      });
    });
  });

  describe('refreshToken', () => {
    it('rejects invalid refresh tokens', async () => {
      const { service } = createAuthService();

      await expect(
        service.refreshToken('invalid-token'),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects access tokens used as refresh tokens', async () => {
      const { service } = createAuthService();
      const mockTokenService = new MockTokenService();
      const accessToken = mockTokenService.createToken('user-1', 'access');

      await expect(service.refreshToken(accessToken)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('returns new token pair for valid refresh token', async () => {
      const usersRepository = createUsersRepositoryMock();
      usersRepository.findUserById = jest.fn().mockResolvedValue({
        id: 'user-1',
        status: 'active',
      });

      const { service } = createAuthService(usersRepository);
      const mockTokenService = new MockTokenService();
      const refreshToken = mockTokenService.createToken('user-1', 'refresh');

      const result = await service.refreshToken(refreshToken);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.expiresIn).toBe(7 * 24 * 60 * 60);
      expect(mockTokenService.parseToken(result.accessToken)).toMatchObject({
        userId: 'user-1',
        tokenType: 'access',
      });
    });
  });
});
