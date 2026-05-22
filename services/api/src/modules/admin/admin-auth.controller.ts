import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AdminAuthGuard } from '../../common/auth/admin-auth.guard';
import { CurrentAdminUser } from '../../common/decorators/current-admin-user.decorator';
import type { AdminAuthUser } from '../../common/types/admin-auth-user.type';
import { AdminAuthService } from './admin-auth.service';
import { AdminLoginDto } from './dto/admin-login.dto';

@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @Post('login')
  login(@Body() dto: AdminLoginDto) {
    return this.adminAuthService.login(dto);
  }

  @Get('me')
  @UseGuards(AdminAuthGuard)
  me(@CurrentAdminUser() adminUser: AdminAuthUser) {
    return this.adminAuthService.getMe(adminUser);
  }
}
