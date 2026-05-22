import { Injectable, NotFoundException } from '@nestjs/common';
import { maskPhone } from '../../common/utils/mask-phone.util';
import { ListAppUsersQueryDto } from './dto/list-app-users-query.dto';
import { UpdateAppUserDto } from './dto/update-app-user.dto';
import { AppUsersAdminRepository } from './repositories/app-users-admin.repository';

@Injectable()
export class AdminAppUsersService {
  constructor(
    private readonly appUsersAdminRepository: AppUsersAdminRepository,
  ) {}

  async list(query: ListAppUsersQueryDto) {
    const result = await this.appUsersAdminRepository.findPage({
      keyword: query.keyword,
      status: query.status,
      page: query.page,
      pageSize: query.pageSize,
    });

    return {
      items: result.items.map((user) => this.toAppUserSummary(user)),
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
    };
  }

  async update(userId: string, dto: UpdateAppUserDto) {
    const user = await this.appUsersAdminRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('USER_NOT_FOUND');
    }

    if (dto.nickname !== undefined) {
      user.nickname = dto.nickname.trim();
    }

    if (dto.status !== undefined) {
      user.status = dto.status;
    }

    const saved = await this.appUsersAdminRepository.save(user);
    return this.toAppUserSummary(saved);
  }

  private toAppUserSummary(user: {
    id: string;
    phone: string;
    nickname: string;
    avatarUrl: string | null;
    status: 'active' | 'disabled';
    lastLoginAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      userId: user.id,
      phoneMasked: maskPhone(user.phone),
      nickname: user.nickname,
      avatarUrl: user.avatarUrl,
      status: user.status,
      role: 'user' as const,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
