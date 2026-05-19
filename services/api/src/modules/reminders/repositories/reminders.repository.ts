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

@Injectable()
export class RemindersRepository {
  constructor(private readonly dataSource: DataSource) {}

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

    this.applySort(query, params.sortBy, params.sortOrder);

    const countQuery = query.clone().select('COUNT(1)', 'total');
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
