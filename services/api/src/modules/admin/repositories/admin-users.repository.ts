import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminUserEntity } from '../../../database/entities/admin-user.entity';

@Injectable()
export class AdminUsersRepository {
  constructor(
    @InjectRepository(AdminUserEntity)
    private readonly adminUsersRepository: Repository<AdminUserEntity>,
  ) {}

  findByUsername(username: string) {
    return this.adminUsersRepository.findOne({
      where: { username },
    });
  }

  findById(id: string) {
    return this.adminUsersRepository.findOne({
      where: { id },
    });
  }

  save(adminUser: AdminUserEntity) {
    return this.adminUsersRepository.save(adminUser);
  }

  create(payload: Partial<AdminUserEntity>) {
    return this.adminUsersRepository.create(payload);
  }

  async findPage(params: {
    keyword?: string;
    role?: 'super_admin' | 'admin';
    status?: 'active' | 'disabled';
    page: number;
    pageSize: number;
  }) {
    const qb = this.adminUsersRepository
      .createQueryBuilder('admin')
      .orderBy('admin.created_at', 'DESC');

    if (params.keyword?.trim()) {
      const keyword = `%${params.keyword.trim()}%`;
      qb.andWhere(
        '(admin.username ILIKE :keyword OR admin.display_name ILIKE :keyword)',
        { keyword },
      );
    }

    if (params.role) {
      qb.andWhere('admin.role = :role', { role: params.role });
    }

    if (params.status) {
      qb.andWhere('admin.status = :status', { status: params.status });
    }

    const page = Math.max(1, params.page);
    const pageSize = Math.min(100, Math.max(1, params.pageSize));

    const [items, total] = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return { items, total, page, pageSize };
  }
}
