import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SchoolEntity } from '../../../database/entities/school.entity';

type FacetRow = {
  value: string | null;
  count: string;
};

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

  async findFacets() {
    const baseQuery = () =>
      this.schoolsRepository
        .createQueryBuilder('school')
        .where('school.deletedAt IS NULL');

    const readFacet = async (column: string) => {
      const rows = await baseQuery()
        .select(`school.${column}`, 'value')
        .addSelect('COUNT(1)', 'count')
        .andWhere(`school.${column} IS NOT NULL`)
        .andWhere(`school.${column} <> ''`)
        .groupBy(`school.${column}`)
        .orderBy(`school.${column}`, 'ASC')
        .getRawMany<FacetRow>();

      return rows.map((row) => ({
        value: row.value ?? '',
        count: Number(row.count),
      }));
    };

    const [provinces, cities, schoolLevels, schoolTypes, statuses] =
      await Promise.all([
        readFacet('province'),
        readFacet('city'),
        readFacet('schoolLevel'),
        readFacet('schoolType'),
        readFacet('status'),
      ]);

    return {
      provinces,
      cities,
      schoolLevels,
      schoolTypes,
      statuses,
    };
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
