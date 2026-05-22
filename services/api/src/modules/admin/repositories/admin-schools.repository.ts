import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SchoolEntity } from '../../../database/entities/school.entity';

@Injectable()
export class AdminSchoolsRepository {
  constructor(
    @InjectRepository(SchoolEntity)
    private readonly schoolsRepository: Repository<SchoolEntity>,
  ) {}

  findById(schoolId: string) {
    return this.schoolsRepository.findOne({
      where: { id: schoolId },
    });
  }

  create(payload: Partial<SchoolEntity>) {
    return this.schoolsRepository.create(payload);
  }

  save(school: SchoolEntity) {
    return this.schoolsRepository.save(school);
  }

  async findPage(params: {
    keyword?: string;
    province?: string;
    city?: string;
    schoolLevel?: string;
    schoolType?: string;
    status?: 'active' | 'inactive';
    page: number;
    pageSize: number;
  }) {
    const qb = this.schoolsRepository
      .createQueryBuilder('school')
      .where('school.deletedAt IS NULL')
      .orderBy('school.sortOrder', 'ASC')
      .addOrderBy('school.updatedAt', 'DESC');

    if (params.keyword?.trim()) {
      qb.andWhere(
        '(school.name ILIKE :keyword OR school.shortName ILIKE :keyword)',
        { keyword: `%${params.keyword.trim()}%` },
      );
    }

    if (params.province) {
      qb.andWhere('school.province = :province', { province: params.province });
    }

    if (params.city) {
      qb.andWhere('school.city = :city', { city: params.city });
    }

    if (params.schoolLevel) {
      qb.andWhere('school.schoolLevel = :schoolLevel', {
        schoolLevel: params.schoolLevel,
      });
    }

    if (params.schoolType) {
      qb.andWhere('school.schoolType = :schoolType', {
        schoolType: params.schoolType,
      });
    }

    if (params.status) {
      qb.andWhere('school.status = :status', { status: params.status });
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
