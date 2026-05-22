import { ForbiddenException } from '@nestjs/common';
import { AdminStaffService } from './admin-staff.service';
import { AdminUsersRepository } from './repositories/admin-users.repository';

describe('AdminStaffService', () => {
  const adminUsersRepository = {
    findPage: jest.fn(),
    findByUsername: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  } as unknown as jest.Mocked<AdminUsersRepository>;

  const service = new AdminStaffService(adminUsersRepository);

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('blocks non-super-admin from creating staff', async () => {
    await expect(
      service.create(
        {
          adminUserId: 'a1',
          username: 'admin',
          displayName: '运营管理员',
          role: 'admin',
          tokenType: 'access',
        },
        {
          username: 'new-admin',
          displayName: '新管理员',
          password: 'password1',
          role: 'admin',
        },
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
