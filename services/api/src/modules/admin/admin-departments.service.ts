import { Injectable, NotFoundException } from '@nestjs/common';
import { DepartmentEntity } from '../../database/entities/department.entity';
import { ListAdminDepartmentsQueryDto } from './dto/list-admin-departments-query.dto';
import { AdminDepartmentsRepository } from './repositories/admin-departments.repository';

@Injectable()
export class AdminDepartmentsService {
  constructor(
    private readonly adminDepartmentsRepository: AdminDepartmentsRepository,
  ) {}

  async findOne(departmentId: string) {
    const department =
      await this.adminDepartmentsRepository.findById(departmentId);
    if (!department || department.deletedAt) {
      throw new NotFoundException('DEPARTMENT_NOT_FOUND');
    }

    return this.toSummary(department);
  }

  async list(query: ListAdminDepartmentsQueryDto) {
    const result = await this.adminDepartmentsRepository.findPage({
      keyword: query.keyword,
      schoolId: query.schoolId,
      status: query.status,
      page: query.page,
      pageSize: query.pageSize,
    });

    return {
      items: result.items.map((department) => this.toSummary(department)),
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
    };
  }

  private toSummary(department: DepartmentEntity) {
    return {
      departmentId: department.id,
      schoolId: department.schoolId,
      schoolName: department.school?.name ?? '',
      name: department.name,
      code: department.code,
      website: department.website,
      status: department.status,
      createdAt: department.createdAt,
      updatedAt: department.updatedAt,
    };
  }
}
