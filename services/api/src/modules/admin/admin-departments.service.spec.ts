import { NotFoundException } from '@nestjs/common';
import { AdminDepartmentsService } from './admin-departments.service';
import { AdminDepartmentsRepository } from './repositories/admin-departments.repository';

describe('AdminDepartmentsService', () => {
  const adminDepartmentsRepository = {
    findById: jest.fn(),
    findPage: jest.fn(),
  } as unknown as jest.Mocked<AdminDepartmentsRepository>;

  const service = new AdminDepartmentsService(adminDepartmentsRepository);

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('lists departments with school names', async () => {
    adminDepartmentsRepository.findPage.mockResolvedValue({
      items: [
        {
          id: 'dept-1',
          schoolId: 'school-1',
          school: {
            id: 'school-1',
            name: '华东理工大学',
          },
          name: '信息科学与工程学院',
          code: '006',
          website: 'https://cise.ecust.edu.cn',
          status: 'active',
          deletedAt: null,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-02'),
        },
      ],
      total: 1,
      page: 1,
      pageSize: 20,
    });

    const result = await service.list({
      keyword: '信息',
      page: 1,
      pageSize: 20,
    });

    expect(result.items[0]?.schoolName).toBe('华东理工大学');
    expect(result.total).toBe(1);
  });

  it('throws when department is missing', async () => {
    adminDepartmentsRepository.findById.mockResolvedValue(null);

    await expect(service.findOne('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
