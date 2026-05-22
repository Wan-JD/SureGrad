import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AdminAuthGuard } from '../../common/auth/admin-auth.guard';
import { AdminDepartmentsService } from './admin-departments.service';
import { ListAdminDepartmentsQueryDto } from './dto/list-admin-departments-query.dto';

@Controller('admin/departments')
@UseGuards(AdminAuthGuard)
export class AdminDepartmentsController {
  constructor(
    private readonly adminDepartmentsService: AdminDepartmentsService,
  ) {}

  @Get()
  list(@Query() query: ListAdminDepartmentsQueryDto) {
    return this.adminDepartmentsService.list(query);
  }

  @Get(':departmentId')
  findOne(@Param('departmentId') departmentId: string) {
    return this.adminDepartmentsService.findOne(departmentId);
  }
}
