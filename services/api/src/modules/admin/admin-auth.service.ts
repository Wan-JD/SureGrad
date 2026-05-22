import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AdminTokenService } from '../../common/auth/admin-token.service';
import { AdminAuthUser } from '../../common/types/admin-auth-user.type';
import { verifyPassword } from '../../common/utils/password.util';
import { AdminLoginDto } from './dto/admin-login.dto';
import { AdminUsersRepository } from './repositories/admin-users.repository';

@Injectable()
export class AdminAuthService {
  constructor(
    private readonly adminUsersRepository: AdminUsersRepository,
    private readonly adminTokenService: AdminTokenService,
  ) {}

  async login(dto: AdminLoginDto) {
    const adminUser = await this.adminUsersRepository.findByUsername(
      dto.username.trim(),
    );

    if (!adminUser || !verifyPassword(dto.password, adminUser.passwordHash)) {
      throw new UnauthorizedException('ADMIN_INVALID_CREDENTIALS');
    }

    if (adminUser.status === 'disabled') {
      throw new ForbiddenException('ADMIN_DISABLED');
    }

    adminUser.lastLoginAt = new Date();
    await this.adminUsersRepository.save(adminUser);

    return this.buildAuthResponse(adminUser);
  }

  async getMe(adminAuthUser: AdminAuthUser) {
    const adminUser = await this.adminUsersRepository.findById(
      adminAuthUser.adminUserId,
    );

    if (!adminUser || adminUser.status === 'disabled') {
      throw new ForbiddenException('ADMIN_DISABLED');
    }

    return {
      adminUserId: adminUser.id,
      username: adminUser.username,
      displayName: adminUser.displayName,
      role: adminUser.role,
      status: adminUser.status,
      lastLoginAt: adminUser.lastLoginAt,
    };
  }

  private buildAuthResponse(adminUser: {
    id: string;
    username: string;
    displayName: string;
    role: 'super_admin' | 'admin';
    status: 'active' | 'disabled';
    lastLoginAt: Date | null;
  }) {
    return {
      accessToken: this.adminTokenService.createToken(
        adminUser.id,
        adminUser.username,
        adminUser.displayName,
        adminUser.role,
        'access',
      ),
      refreshToken: this.adminTokenService.createToken(
        adminUser.id,
        adminUser.username,
        adminUser.displayName,
        adminUser.role,
        'refresh',
      ),
      expiresIn: 12 * 60 * 60,
      adminUser: {
        adminUserId: adminUser.id,
        username: adminUser.username,
        displayName: adminUser.displayName,
        role: adminUser.role,
        status: adminUser.status,
        lastLoginAt: adminUser.lastLoginAt,
      },
    };
  }
}
