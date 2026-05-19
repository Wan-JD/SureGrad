import { BadRequestException, Injectable } from '@nestjs/common';
import { buildSkeletonResponse } from '../../common/utils/build-skeleton-response';
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

  create(userId: string, dto: CreateReminderDto) {
    return buildSkeletonResponse({
      domain: 'reminders',
      action: 'create',
      message:
        'Reminder creation is scaffolded, but scheduling conflict detection and persistence are still pending.',
      nextSteps: [
        'Validate reminder type and timing.',
        'Persist custom reminders and register downstream scheduling jobs.',
      ],
      payload: {
        userId,
        ...dto,
      },
    });
  }

  update(userId: string, reminderId: string, dto: UpdateReminderDto) {
    return buildSkeletonResponse({
      domain: 'reminders',
      action: 'update',
      message:
        'Reminder update is scaffolded, but ownership checks and rescheduling are still pending.',
      nextSteps: [
        'Load reminder ownership for the current user.',
        'Apply edits and refresh scheduler state.',
      ],
      payload: {
        userId,
        reminderId,
        ...dto,
      },
    });
  }

  remove(userId: string, reminderId: string) {
    return buildSkeletonResponse({
      domain: 'reminders',
      action: 'remove',
      message:
        'Reminder deletion is scaffolded, but delete strategy and scheduler cleanup are still pending.',
      nextSteps: [
        'Resolve the reminder record for the current user.',
        'Delete or archive the reminder and clear scheduler bindings.',
      ],
      payload: { userId, reminderId },
    });
  }
}
