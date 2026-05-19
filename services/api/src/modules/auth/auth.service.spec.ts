import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { MockTokenService } from '../../common/auth/mock-token.service';
import { UsersRepository } from '../users/repositories/users.repository';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  const createUsersRepositoryMock = () =>
    ({
      findUserByPhone: jest.fn(),
      createUser: jest.fn(),
      saveUser: jest.fn(),
      findProfileByUserId: jest.fn(),
    }) as unknown as jest.Mocked<UsersRepository>;

  it('returns mock otp metadata', () => {
    const service = new AuthService(
      createUsersRepositoryMock(),
      new MockTokenService(),
    );

    expect(service.sendOtp({ phone: '13800138000', scene: 'login' })).toEqual({
      sent: true,
      expireSeconds: 300,
      retryAfterSeconds: 60,
    });
  });

  it('rejects invalid otp codes', async () => {
    const service = new AuthService(
      createUsersRepositoryMock(),
      new MockTokenService(),
    );

    await expect(
      service.loginWithOtp({
        phone: '13800138000',
        otpCode: '000000',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects disabled users', async () => {
    const usersRepository = createUsersRepositoryMock();
    usersRepository.findUserByPhone = jest.fn().mockResolvedValue({
      id: 'user-1',
      phone: '13800138000',
      nickname: 'SureGrad8000',
      avatarUrl: null,
      status: 'disabled',
      lastLoginAt: null,
    });

    const service = new AuthService(usersRepository, new MockTokenService());

    await expect(
      service.loginWithOtp({
        phone: '13800138000',
        otpCode: '123456',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('creates a new user and returns mock tokens', async () => {
    const usersRepository = createUsersRepositoryMock();
    const mockTokenService = new MockTokenService();
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
      .mockImplementation((user: Parameters<UsersRepository['saveUser']>[0]) =>
        Promise.resolve(user),
      );
    usersRepository.findProfileByUserId = jest.fn().mockResolvedValue({
      onboardingCompleted: true,
    });

    const service = new AuthService(usersRepository, mockTokenService);
    const result = await service.loginWithOtp({
      phone: '13800138000',
      otpCode: '123456',
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
    expect(mockTokenService.parseToken(result.accessToken)).toMatchObject({
      userId: 'user-1',
      tokenType: 'access',
    });
  });
});
