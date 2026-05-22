import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminAuthGuard } from '../../common/auth/admin-auth.guard';
import { AdminRolesGuard } from '../../common/auth/admin-roles.guard';
import { AdminTokenService } from '../../common/auth/admin-token.service';
import { AdminUserEntity } from '../../database/entities/admin-user.entity';
import { UserEntity } from '../../database/entities/user.entity';
import { AdminAppUsersController } from './admin-app-users.controller';
import { AdminAppUsersService } from './admin-app-users.service';
import { AdminAuthController } from './admin-auth.controller';
import { AdminAuthService } from './admin-auth.service';
import { AdminStaffController } from './admin-staff.controller';
import { AdminStaffService } from './admin-staff.service';
import { AdminUsersRepository } from './repositories/admin-users.repository';
import { AppUsersAdminRepository } from './repositories/app-users-admin.repository';

@Module({
  imports: [TypeOrmModule.forFeature([AdminUserEntity, UserEntity])],
  controllers: [
    AdminAuthController,
    AdminAppUsersController,
    AdminStaffController,
  ],
  providers: [
    AdminTokenService,
    AdminAuthGuard,
    AdminRolesGuard,
    AdminAuthService,
    AdminAppUsersService,
    AdminStaffService,
    AdminUsersRepository,
    AppUsersAdminRepository,
  ],
})
export class AdminModule {}
