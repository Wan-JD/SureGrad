import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminAuthGuard } from '../../common/auth/admin-auth.guard';
import { AdminRolesGuard } from '../../common/auth/admin-roles.guard';
import { AdminRoles } from '../../common/decorators/admin-roles.decorator';
import { CurrentAdminUser } from '../../common/decorators/current-admin-user.decorator';
import type { AdminAuthUser } from '../../common/types/admin-auth-user.type';
import { AdminStaffService } from './admin-staff.service';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { ListAdminUsersQueryDto } from './dto/list-admin-users-query.dto';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto';

@Controller('admin/staff')
@UseGuards(AdminAuthGuard, AdminRolesGuard)
export class AdminStaffController {
  constructor(private readonly adminStaffService: AdminStaffService) {}

  @Get()
  @AdminRoles('super_admin')
  list(@Query() query: ListAdminUsersQueryDto) {
    return this.adminStaffService.list(query);
  }

  @Post()
  @AdminRoles('super_admin')
  create(
    @CurrentAdminUser() adminUser: AdminAuthUser,
    @Body() dto: CreateAdminUserDto,
  ) {
    return this.adminStaffService.create(adminUser, dto);
  }

  @Patch(':adminUserId')
  @AdminRoles('super_admin')
  update(
    @CurrentAdminUser() adminUser: AdminAuthUser,
    @Param('adminUserId') adminUserId: string,
    @Body() dto: UpdateAdminUserDto,
  ) {
    return this.adminStaffService.update(adminUser, adminUserId, dto);
  }
}
