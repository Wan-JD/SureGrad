import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { AdminTokenService } from '../../common/auth/admin-token.service';
import { hashPassword } from '../../common/utils/password.util';
import { AdminAuthService } from './admin-auth.service';
import { AdminUsersRepository } from './repositories/admin-users.repository';

describe('AdminAuthService', () => {
  const adminUsersRepository = {
    findByUsername: jest.fn(),
    findById: jest.fn(),
    save: jest.fn(),
  } as unknown as jest.Mocked<AdminUsersRepository>;

  const service = new AdminAuthService(
    adminUsersRepository,
    new AdminTokenService(),
  );

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('rejects invalid credentials', async () => {
    adminUsersRepository.findByUsername.mockResolvedValue(null);

    await expect(
      service.login({ username: 'admin', password: 'wrong-password' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects disabled admin accounts', async () => {
    adminUsersRepository.findByUsername.mockResolvedValue({
      id: 'admin-1',
      username: 'admin',
      displayName: '运营管理员',
      passwordHash: hashPassword('admin123'),
      role: 'admin',
      status: 'disabled',
      lastLoginAt: null,
    } as never);

    await expect(
      service.login({ username: 'admin', password: 'admin123' }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('returns tokens for valid credentials', async () => {
    const adminUser = {
      id: 'admin-1',
      username: 'admin',
      displayName: '运营管理员',
      passwordHash: hashPassword('admin123'),
      role: 'admin' as const,
      status: 'active' as const,
      lastLoginAt: null,
    };

    adminUsersRepository.findByUsername.mockResolvedValue(adminUser as never);
    adminUsersRepository.save.mockResolvedValue(adminUser as never);

    const result = await service.login({
      username: 'admin',
      password: 'admin123',
    });

    expect(result.accessToken).toContain('mock.admin.');
    expect(result.adminUser.role).toBe('admin');
    expect(adminUsersRepository.save.mock.calls.length).toBe(1);
  });
});
