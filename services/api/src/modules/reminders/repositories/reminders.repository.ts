import { Injectable } from '@nestjs/common';
import { DataSource, SelectQueryBuilder } from 'typeorm';

export interface ReminderQueryParams {
  userId: string;
  reminderType?: 'study' | 'todo' | 'exam_node' | 'system';
  isEnabled?: boolean;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'remind_at' | 'created_at';
  sortOrder?: 'asc' | 'desc';
  page: number;
  pageSize: number;
}

export interface ReminderRecord {
  reminderId: string;
  userId: string;
  reminderType: 'study' | 'todo' | 'exam_node' | 'system';
  title: string;
  content: string;
  remindAt: string;
  isEnabled: boolean;
  isSystemDefault: boolean;
  relatedTargetType: 'todo' | 'plan' | 'program' | 'other' | null;
  relatedTargetId: string | null;
  createdAt: string;
}

export interface UpdateReminderEnabledParams {
  userId: string;
  reminderId: string;
  isEnabled: boolean;
}

export interface CreateReminderParams {
  reminderId: string;
  userId: string;
  reminderType: 'study' | 'todo';
  title: string;
  content: string;
  remindAt: string;
  isEnabled: boolean;
  relatedTargetType: 'todo' | 'plan' | 'program' | 'other' | null;
  relatedTargetId: string | null;
}

export interface CreateReminderResult {
  reminderId: string;
  reminderType: 'study' | 'todo';
  remindAt: string;
  isEnabled: boolean;
}

export interface DeleteReminderParams {
  userId: string;
  reminderId: string;
}

@Injectable()
export class RemindersRepository {
  constructor(private readonly dataSource: DataSource) {}

  findReminderByIdForUser(
    reminderId: string,
    userId: string,
  ): Promise<ReminderRecord | null> {
    return this.dataSource
      .createQueryBuilder()
      .from('reminders', 'reminder')
      .select([
        'reminder.id AS "reminderId"',
        'reminder.user_id AS "userId"',
        'reminder.reminder_type AS "reminderType"',
        'reminder.title AS "title"',
        'reminder.content AS "content"',
        'reminder.remind_at AS "remindAt"',
        'reminder.is_enabled AS "isEnabled"',
        'reminder.is_system_default AS "isSystemDefault"',
        'reminder.related_target_type AS "relatedTargetType"',
        'reminder.related_target_id AS "relatedTargetId"',
        'reminder.created_at AS "createdAt"',
      ])
      .where('reminder.id = :reminderId', { reminderId })
      .andWhere('reminder.user_id = :userId', { userId })
      .getRawOne<ReminderRecord>()
      .then((record) => record ?? null);
  }

  async findReminders(
    params: ReminderQueryParams,
  ): Promise<{ items: ReminderRecord[]; total: number }> {
    const query = this.dataSource
      .createQueryBuilder()
      .from('reminders', 'reminder')
      .select([
        'reminder.id AS "reminderId"',
        'reminder.user_id AS "userId"',
        'reminder.reminder_type AS "reminderType"',
        'reminder.title AS "title"',
        'reminder.content AS "content"',
        'reminder.remind_at AS "remindAt"',
        'reminder.is_enabled AS "isEnabled"',
        'reminder.is_system_default AS "isSystemDefault"',
        'reminder.related_target_type AS "relatedTargetType"',
        'reminder.related_target_id AS "relatedTargetId"',
        'reminder.created_at AS "createdAt"',
      ])
      .where('reminder.user_id = :userId', {
        userId: params.userId,
      });

    if (params.reminderType) {
      query.andWhere('reminder.reminder_type = :reminderType', {
        reminderType: params.reminderType,
      });
    }

    if (params.isEnabled !== undefined) {
      query.andWhere('reminder.is_enabled = :isEnabled', {
        isEnabled: params.isEnabled,
      });
    }

    if (params.dateFrom) {
      query.andWhere('reminder.remind_at >= :dateFrom', {
        dateFrom: normalizeRangeStart(params.dateFrom),
      });
    }

    if (params.dateTo) {
      query.andWhere('reminder.remind_at <= :dateTo', {
        dateTo: normalizeRangeEnd(params.dateTo),
      });
    }

    const countQuery = query.clone().select('COUNT(1)', 'total');
    this.applySort(query, params.sortBy, params.sortOrder);

    const items = await query
      .offset((params.page - 1) * params.pageSize)
      .limit(params.pageSize)
      .getRawMany<ReminderRecord>();
    const totalRow = await countQuery.getRawOne<{ total: string }>();

    return {
      items,
      total: Number(totalRow?.total ?? 0),
    };
  }

  async updateReminderEnabled(
    params: UpdateReminderEnabledParams,
  ): Promise<void> {
    await this.dataSource
      .createQueryBuilder()
      .update('reminders')
      .set({
        is_enabled: params.isEnabled,
      })
      .where('id = :reminderId', { reminderId: params.reminderId })
      .andWhere('user_id = :userId', { userId: params.userId })
      .execute();
  }

  findReminderByTypeAndRemindAt(
    userId: string,
    reminderType: 'study' | 'todo',
    remindAt: string,
  ): Promise<ReminderRecord | null> {
    return this.dataSource
      .createQueryBuilder()
      .from('reminders', 'reminder')
      .select([
        'reminder.id AS "reminderId"',
        'reminder.user_id AS "userId"',
        'reminder.reminder_type AS "reminderType"',
        'reminder.title AS "title"',
        'reminder.content AS "content"',
        'reminder.remind_at AS "remindAt"',
        'reminder.is_enabled AS "isEnabled"',
        'reminder.is_system_default AS "isSystemDefault"',
        'reminder.related_target_type AS "relatedTargetType"',
        'reminder.related_target_id AS "relatedTargetId"',
        'reminder.created_at AS "createdAt"',
      ])
      .where('reminder.user_id = :userId', { userId })
      .andWhere('reminder.reminder_type = :reminderType', { reminderType })
      .andWhere('reminder.remind_at = :remindAt', { remindAt })
      .getRawOne<ReminderRecord>()
      .then((record) => record ?? null);
  }

  async createReminder(
    params: CreateReminderParams,
  ): Promise<CreateReminderResult> {
    await this.dataSource
      .createQueryBuilder()
      .insert()
      .into('reminders')
      .values({
        id: params.reminderId,
        user_id: params.userId,
        reminder_type: params.reminderType,
        title: params.title,
        content: params.content,
        remind_at: params.remindAt,
        is_enabled: params.isEnabled,
        is_system_default: false,
        related_target_type: params.relatedTargetType,
        related_target_id: params.relatedTargetId,
      })
      .execute();

    return {
      reminderId: params.reminderId,
      reminderType: params.reminderType,
      remindAt: params.remindAt,
      isEnabled: params.isEnabled,
    };
  }

  async deleteReminder(params: DeleteReminderParams): Promise<void> {
    await this.dataSource
      .createQueryBuilder()
      .delete()
      .from('reminders')
      .where('id = :reminderId', { reminderId: params.reminderId })
      .andWhere('user_id = :userId', { userId: params.userId })
      .execute();
  }

  private applySort(
    query: SelectQueryBuilder<any>,
    sortBy: ReminderQueryParams['sortBy'] = 'remind_at',
    sortOrder: ReminderQueryParams['sortOrder'] = 'asc',
  ) {
    const direction = sortOrder.toUpperCase() as 'ASC' | 'DESC';

    switch (sortBy) {
      case 'created_at':
        query
          .orderBy('reminder.created_at', direction)
          .addOrderBy('reminder.remind_at', 'ASC');
        break;
      case 'remind_at':
      default:
        query
          .orderBy('reminder.remind_at', direction)
          .addOrderBy('reminder.created_at', 'ASC');
        break;
    }
  }
}

const normalizeRangeStart = (value: string): string =>
  value.length === 10 ? `${value}T00:00:00.000Z` : value;

const normalizeRangeEnd = (value: string): string =>
  value.length === 10 ? `${value}T23:59:59.999Z` : value;
