import { BadRequestException } from '@nestjs/common';
import { UsersRepository } from './repositories/users.repository';
import { UsersService } from './users.service';

describe('UsersService', () => {
  const createUsersRepositoryMock = () =>
    ({
      getUserSnapshot: jest.fn(),
      findUserById: jest.fn(),
      saveUser: jest.fn(),
      findProfileByUserId: jest.fn(),
      createProfile: jest.fn(),
      saveProfile: jest.fn(),
    }) as unknown as jest.Mocked<UsersRepository>;

  it('returns the current user projection', async () => {
    const usersRepository = createUsersRepositoryMock();
    usersRepository.getUserSnapshot = jest.fn().mockResolvedValue({
      user: {
        id: 'user-1',
        phone: '13800138000',
        nickname: 'Test User',
        avatarUrl: 'https://example.com/avatar.png',
      },
      profile: {
        onboardingCompleted: true,
      },
      hasActiveTarget: true,
      hasActivePlan: false,
    });

    const service = new UsersService(usersRepository);
    await expect(service.getMe('user-1')).resolves.toEqual({
      userId: 'user-1',
      phoneMasked: '138****8000',
      nickname: 'Test User',
      avatarUrl: 'https://example.com/avatar.png',
      profileCompleted: true,
      hasActiveTarget: true,
      hasActivePlan: false,
    });
  });

  it('updates the current user profile', async () => {
    const usersRepository = createUsersRepositoryMock();
    const user = {
      id: 'user-1',
      nickname: 'Old Name',
      avatarUrl: null,
    };
    const profile = {
      id: 'profile-1',
      userId: 'user-1',
      examYear: 2027,
      identityType: 'fresh',
      undergraduateMajor: 'CS',
      intendedDiscipline: 'SE',
      dailyStudyHours: 6,
      examMathRequired: true,
      onboardingCompleted: false,
    };

    usersRepository.findUserById = jest.fn().mockResolvedValue(user);
    usersRepository.saveUser = jest
      .fn()
      .mockImplementation((value: Parameters<UsersRepository['saveUser']>[0]) =>
        Promise.resolve(value),
      );
    usersRepository.findProfileByUserId = jest.fn().mockResolvedValue(profile);
    usersRepository.saveProfile = jest
      .fn()
      .mockImplementation(
        (value: Parameters<UsersRepository['saveProfile']>[0]) =>
          Promise.resolve(value),
      );

    const service = new UsersService(usersRepository);
    const result = await service.upsertProfile('user-1', {
      nickname: 'New Name',
      examYear: 2028,
      identityType: 'working',
      undergraduateMajor: 'Math',
      intendedDiscipline: 'AI',
      dailyStudyHours: 4.5,
      examMathRequired: false,
      onboardingCompleted: true,
    });

    expect(result).toEqual({
      userProfileId: 'profile-1',
      examYear: 2028,
      identityType: 'working',
      dailyStudyHours: 4.5,
      onboardingCompleted: true,
    });
  });

  it('rejects non-positive daily study hours', async () => {
    const service = new UsersService(createUsersRepositoryMock());

    await expect(
      service.upsertProfile('user-1', {
        examYear: 2027,
        identityType: 'fresh',
        undergraduateMajor: 'CS',
        intendedDiscipline: 'SE',
        dailyStudyHours: 0,
        examMathRequired: true,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
