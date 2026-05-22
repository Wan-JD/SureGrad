import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AdminAuthUser } from '../../common/types/admin-auth-user.type';
import { hashPassword } from '../../common/utils/password.util';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { ListAdminUsersQueryDto } from './dto/list-admin-users-query.dto';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto';
import { AdminUsersRepository } from './repositories/admin-users.repository';

@Injectable()
export class AdminStaffService {
  constructor(private readonly adminUsersRepository: AdminUsersRepository) {}

  list(query: ListAdminUsersQueryDto) {
    return this.adminUsersRepository
      .findPage({
        keyword: query.keyword,
        role: query.role,
        status: query.status,
        page: query.page,
        pageSize: query.pageSize,
      })
      .then((result) => ({
        items: result.items.map((item) => this.toStaffSummary(item)),
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
      }));
  }

  async create(actor: AdminAuthUser, dto: CreateAdminUserDto) {
    this.assertSuperAdmin(actor);

    const existing = await this.adminUsersRepository.findByUsername(
      dto.username.trim(),
    );
    if (existing) {
      throw new BadRequestException('ADMIN_USERNAME_EXISTS');
    }

    const adminUser = this.adminUsersRepository.create({
      username: dto.username.trim(),
      displayName: dto.displayName.trim(),
      passwordHash: hashPassword(dto.password),
      role: dto.role,
      status: 'active',
      lastLoginAt: null,
    });

    const saved = await this.adminUsersRepository.save(adminUser);
    return this.toStaffSummary(saved);
  }

  async update(
    actor: AdminAuthUser,
    adminUserId: string,
    dto: UpdateAdminUserDto,
  ) {
    this.assertSuperAdmin(actor);

    const adminUser = await this.adminUsersRepository.findById(adminUserId);
    if (!adminUser) {
      throw new NotFoundException('ADMIN_USER_NOT_FOUND');
    }

    if (dto.role === 'admin' && adminUser.role === 'super_admin') {
      const superAdminCount = await this.countActiveSuperAdmins();
      if (superAdminCount <= 1) {
        throw new BadRequestException('LAST_SUPER_ADMIN');
      }
    }

    if (dto.displayName !== undefined) {
      adminUser.displayName = dto.displayName.trim();
    }

    if (dto.password !== undefined) {
      adminUser.passwordHash = hashPassword(dto.password);
    }

    if (dto.role !== undefined) {
      adminUser.role = dto.role;
    }

    if (dto.status !== undefined) {
      if (dto.status === 'disabled' && adminUser.role === 'super_admin') {
        const superAdminCount = await this.countActiveSuperAdmins();
        if (superAdminCount <= 1) {
          throw new BadRequestException('LAST_SUPER_ADMIN');
        }
      }
      adminUser.status = dto.status;
    }

    const saved = await this.adminUsersRepository.save(adminUser);
    return this.toStaffSummary(saved);
  }

  private async countActiveSuperAdmins() {
    const result = await this.adminUsersRepository.findPage({
      role: 'super_admin',
      status: 'active',
      page: 1,
      pageSize: 100,
    });
    return result.total;
  }

  private assertSuperAdmin(actor: AdminAuthUser) {
    if (actor.role !== 'super_admin') {
      throw new ForbiddenException('ADMIN_ROLE_FORBIDDEN');
    }
  }

  private toStaffSummary(adminUser: {
    id: string;
    username: string;
    displayName: string;
    role: 'super_admin' | 'admin';
    status: 'active' | 'disabled';
    lastLoginAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      adminUserId: adminUser.id,
      username: adminUser.username,
      displayName: adminUser.displayName,
      role: adminUser.role,
      status: adminUser.status,
      lastLoginAt: adminUser.lastLoginAt,
      createdAt: adminUser.createdAt,
      updatedAt: adminUser.updatedAt,
    };
  }
}
