import { randomUUID } from 'node:crypto';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { QueryRemindersDto } from './dto/query-reminders.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';
import { RemindersRepository } from './repositories/reminders.repository';

@Injectable()
export class RemindersService {
  constructor(private readonly remindersRepository: RemindersRepository) {}

  async findAll(userId: string, query: QueryRemindersDto) {
    if (
      query.dateFrom &&
      query.dateTo &&
      new Date(query.dateFrom).getTime() > new Date(query.dateTo).getTime()
    ) {
      throw new BadRequestException('INVALID_PARAMS');
    }

    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const { items, total } = await this.remindersRepository.findReminders({
      userId,
      reminderType: query.reminderType,
      isEnabled: query.isEnabled,
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder ?? 'asc',
      page,
      pageSize,
    });

    return {
      items: items.map((item) => ({
        reminderId: item.reminderId,
        reminderType: item.reminderType,
        title: item.title,
        content: item.content,
        remindAt: item.remindAt,
        isEnabled: item.isEnabled,
        isSystemDefault: item.isSystemDefault,
        relatedTargetType: item.relatedTargetType,
        relatedTargetId: item.relatedTargetId,
      })),
      pagination: {
        page,
        pageSize,
        total,
        hasMore: page * pageSize < total,
      },
    };
  }

  async create(userId: string, dto: CreateReminderDto) {
    const title = dto.title.trim();
    const content = dto.content.trim();
    if (!title || !content) {
      throw new BadRequestException('INVALID_PARAMS');
    }

    const remindAt = new Date(dto.remindAt);
    if (Number.isNaN(remindAt.getTime())) {
      throw new BadRequestException('INVALID_PARAMS');
    }

    if (remindAt.getTime() <= Date.now()) {
      throw new BadRequestException('INVALID_PARAMS');
    }

    const hasRelatedType = dto.relatedTargetType !== undefined;
    const hasRelatedId = dto.relatedTargetId !== undefined;
    if (hasRelatedType !== hasRelatedId) {
      throw new BadRequestException('INVALID_PARAMS');
    }

    const existingReminder =
      await this.remindersRepository.findReminderByTypeAndRemindAt(
        userId,
        dto.reminderType,
        dto.remindAt,
      );
    if (existingReminder) {
      throw new ConflictException('REMINDER_CONFLICT');
    }

    return this.remindersRepository.createReminder({
      reminderId: randomUUID(),
      userId,
      reminderType: dto.reminderType,
      title,
      content,
      remindAt: dto.remindAt,
      isEnabled: dto.isEnabled ?? true,
      relatedTargetType: dto.relatedTargetType ?? null,
      relatedTargetId: dto.relatedTargetId ?? null,
    });
  }

  async update(userId: string, reminderId: string, dto: UpdateReminderDto) {
    if (dto.isEnabled === undefined) {
      throw new BadRequestException('INVALID_PARAMS');
    }

    const reminder = await this.remindersRepository.findReminderByIdForUser(
      reminderId,
      userId,
    );
    if (!reminder) {
      throw new NotFoundException('NOT_FOUND');
    }

    await this.remindersRepository.updateReminderEnabled({
      userId,
      reminderId,
      isEnabled: dto.isEnabled,
    });

    return {
      reminderId: reminder.reminderId,
      reminderType: reminder.reminderType,
      title: reminder.title,
      content: reminder.content,
      remindAt: reminder.remindAt,
      isEnabled: dto.isEnabled,
      isSystemDefault: reminder.isSystemDefault,
      relatedTargetType: reminder.relatedTargetType,
      relatedTargetId: reminder.relatedTargetId,
    };
  }

  async remove(userId: string, reminderId: string) {
    const reminder = await this.remindersRepository.findReminderByIdForUser(
      reminderId,
      userId,
    );
    if (!reminder) {
      throw new NotFoundException('NOT_FOUND');
    }

    if (reminder.isSystemDefault) {
      throw new ForbiddenException('FORBIDDEN');
    }

    await this.remindersRepository.deleteReminder({ userId, reminderId });
  }
}
