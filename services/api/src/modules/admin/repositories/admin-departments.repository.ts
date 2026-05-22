import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DepartmentEntity } from '../../../database/entities/department.entity';

@Injectable()
export class AdminDepartmentsRepository {
  constructor(
    @InjectRepository(DepartmentEntity)
    private readonly departmentsRepository: Repository<DepartmentEntity>,
  ) {}

  findById(departmentId: string) {
    return this.departmentsRepository.findOne({
      where: { id: departmentId },
      relations: { school: true },
    });
  }

  async findPage(params: {
    keyword?: string;
    schoolId?: string;
    status?: 'active' | 'inactive';
    page: number;
    pageSize: number;
  }) {
    const qb = this.departmentsRepository
      .createQueryBuilder('department')
      .leftJoinAndSelect('department.school', 'school')
      .where('department.deletedAt IS NULL')
      .orderBy('department.updatedAt', 'DESC');

    if (params.keyword?.trim()) {
      qb.andWhere(
        '(department.name ILIKE :keyword OR department.code ILIKE :keyword OR school.name ILIKE :keyword)',
        { keyword: `%${params.keyword.trim()}%` },
      );
    }

    if (params.schoolId) {
      qb.andWhere('department.schoolId = :schoolId', {
        schoolId: params.schoolId,
      });
    }

    if (params.status) {
      qb.andWhere('department.status = :status', { status: params.status });
    }

    const page = Math.max(1, params.page);
    const pageSize = Math.min(100, Math.max(1, params.pageSize));

    const [items, total] = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return { items, total, page, pageSize };
  }
}
