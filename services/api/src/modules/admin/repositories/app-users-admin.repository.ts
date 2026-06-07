import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../../database/entities/user.entity';

@Injectable()
export class AppUsersAdminRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  findById(id: string) {
    return this.usersRepository.findOne({ where: { id } });
  }

  save(user: UserEntity) {
    return this.usersRepository.save(user);
  }

  async findPage(params: {
    keyword?: string;
    status?: 'active' | 'disabled';
    page: number;
    pageSize: number;
  }) {
    const qb = this.usersRepository
      .createQueryBuilder('user')
      .orderBy('user.created_at', 'DESC');

    if (params.keyword?.trim()) {
      const keyword = `%${params.keyword.trim()}%`;
      qb.andWhere(
        '(user.phone ILIKE :keyword OR user.email ILIKE :keyword OR user.nickname ILIKE :keyword)',
        { keyword },
      );
    }

    if (params.status) {
      qb.andWhere('user.status = :status', { status: params.status });
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
