import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSchoolDto } from './dto/create-school.dto';
import { ListAdminSchoolsQueryDto } from './dto/list-admin-schools-query.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';
import { AdminSchoolsRepository } from './repositories/admin-schools.repository';

@Injectable()
export class AdminSchoolsService {
  constructor(
    private readonly adminSchoolsRepository: AdminSchoolsRepository,
  ) {}

  async findOne(schoolId: string) {
    const school = await this.adminSchoolsRepository.findById(schoolId);
    if (!school || school.deletedAt) {
      throw new NotFoundException('SCHOOL_NOT_FOUND');
    }

    return this.toSummary(school);
  }

  async list(query: ListAdminSchoolsQueryDto) {
    const result = await this.adminSchoolsRepository.findPage({
      keyword: query.keyword,
      province: query.province,
      city: query.city,
      schoolLevel: query.schoolLevel,
      schoolType: query.schoolType,
      status: query.status,
      page: query.page,
      pageSize: query.pageSize,
    });

    return {
      items: result.items.map((school) => this.toSummary(school)),
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
    };
  }

  async create(dto: CreateSchoolDto) {
    const school = this.adminSchoolsRepository.create({
      name: dto.name.trim(),
      shortName: dto.shortName.trim(),
      code: dto.code?.trim() ?? null,
      province: dto.province.trim(),
      city: dto.city.trim(),
      schoolType: dto.schoolType.trim(),
      schoolLevel: dto.schoolLevel.trim(),
      hasGraduateSchool: dto.hasGraduateSchool ?? false,
      officialWebsite: dto.officialWebsite?.trim() ?? null,
      graduateWebsite: dto.graduateWebsite?.trim() ?? null,
      description: dto.description?.trim() ?? null,
      sortOrder: dto.sortOrder ?? 0,
      status: dto.status ?? 'active',
      deletedAt: null,
    });

    const saved = await this.adminSchoolsRepository.save(school);
    return this.toSummary(saved);
  }

  async update(schoolId: string, dto: UpdateSchoolDto) {
    const school = await this.adminSchoolsRepository.findById(schoolId);
    if (!school || school.deletedAt) {
      throw new NotFoundException('SCHOOL_NOT_FOUND');
    }

    if (dto.name !== undefined) {
      school.name = dto.name.trim();
    }
    if (dto.shortName !== undefined) {
      school.shortName = dto.shortName.trim();
    }
    if (dto.code !== undefined) {
      school.code = dto.code?.trim() ?? null;
    }
    if (dto.province !== undefined) {
      school.province = dto.province.trim();
    }
    if (dto.city !== undefined) {
      school.city = dto.city.trim();
    }
    if (dto.schoolType !== undefined) {
      school.schoolType = dto.schoolType.trim();
    }
    if (dto.schoolLevel !== undefined) {
      school.schoolLevel = dto.schoolLevel.trim();
    }
    if (dto.hasGraduateSchool !== undefined) {
      school.hasGraduateSchool = dto.hasGraduateSchool;
    }
    if (dto.officialWebsite !== undefined) {
      school.officialWebsite = dto.officialWebsite?.trim() ?? null;
    }
    if (dto.graduateWebsite !== undefined) {
      school.graduateWebsite = dto.graduateWebsite?.trim() ?? null;
    }
    if (dto.description !== undefined) {
      school.description = dto.description?.trim() ?? null;
    }
    if (dto.sortOrder !== undefined) {
      school.sortOrder = dto.sortOrder;
    }
    if (dto.status !== undefined) {
      school.status = dto.status;
    }

    const saved = await this.adminSchoolsRepository.save(school);
    return this.toSummary(saved);
  }

  private toSummary(school: {
    id: string;
    name: string;
    shortName: string;
    code: string | null;
    province: string;
    city: string;
    schoolType: string;
    schoolLevel: string;
    hasGraduateSchool: boolean;
    officialWebsite: string | null;
    graduateWebsite: string | null;
    description: string | null;
    sortOrder: number;
    status: 'active' | 'inactive';
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      schoolId: school.id,
      name: school.name,
      shortName: school.shortName,
      code: school.code,
      province: school.province,
      city: school.city,
      schoolType: school.schoolType,
      schoolLevel: school.schoolLevel,
      hasGraduateSchool: school.hasGraduateSchool,
      officialWebsite: school.officialWebsite,
      graduateWebsite: school.graduateWebsite,
      description: school.description,
      sortOrder: school.sortOrder,
      status: school.status,
      createdAt: school.createdAt,
      updatedAt: school.updatedAt,
    };
  }
}
