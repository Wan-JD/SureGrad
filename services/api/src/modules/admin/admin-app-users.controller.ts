import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminAuthGuard } from '../../common/auth/admin-auth.guard';
import { AdminAppUsersService } from './admin-app-users.service';
import { ListAppUsersQueryDto } from './dto/list-app-users-query.dto';
import { UpdateAppUserDto } from './dto/update-app-user.dto';

@Controller('admin/app-users')
@UseGuards(AdminAuthGuard)
export class AdminAppUsersController {
  constructor(private readonly adminAppUsersService: AdminAppUsersService) {}

  @Get()
  list(@Query() query: ListAppUsersQueryDto) {
    return this.adminAppUsersService.list(query);
  }

  @Patch(':userId')
  update(@Param('userId') userId: string, @Body() dto: UpdateAppUserDto) {
    return this.adminAppUsersService.update(userId, dto);
  }
}
