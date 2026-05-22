import { NotFoundException } from '@nestjs/common';
import { AdminSchoolsService } from './admin-schools.service';
import { AdminSchoolsRepository } from './repositories/admin-schools.repository';

describe('AdminSchoolsService', () => {
  const adminSchoolsRepository = {
    findById: jest.fn(),
    findPage: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  } as unknown as jest.Mocked<AdminSchoolsRepository>;

  const service = new AdminSchoolsService(adminSchoolsRepository);

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('updates school status', async () => {
    const school = {
      id: 'school-1',
      name: '华东理工大学',
      shortName: '华理',
      code: null,
      province: '上海',
      city: '上海',
      schoolType: '理工',
      schoolLevel: '211',
      hasGraduateSchool: true,
      officialWebsite: null,
      graduateWebsite: null,
      description: null,
      sortOrder: 0,
      status: 'active' as const,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    adminSchoolsRepository.findById.mockResolvedValue(school);
    adminSchoolsRepository.save.mockResolvedValue({
      ...school,
      status: 'inactive',
    });

    const result = await service.update('school-1', { status: 'inactive' });

    expect(result.status).toBe('inactive');
    expect(adminSchoolsRepository.save.mock.calls.length).toBe(1);
  });

  it('throws when school is missing', async () => {
    adminSchoolsRepository.findById.mockResolvedValue(null);

    await expect(
      service.update('missing', { status: 'inactive' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
