import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

export interface TodayCheckinRecord {
  checkinId: string;
  checkinDate: string;
  totalStudyMinutes: number;
  completedTodoCount: number;
  primarySubjectId: string | null;
  primarySubjectName: string | null;
  reflection: string | null;
  moodTag: string | null;
}

export interface CheckinRangeRecord {
  checkinDate: string;
  totalStudyMinutes: number;
  primarySubjectId: string | null;
  primarySubjectName: string | null;
}

export interface CurrentTargetRecord {
  userTargetId: string;
  schoolId: string;
  schoolName: string | null;
  departmentId: string | null;
  departmentName: string | null;
  programId: string | null;
  programName: string | null;
  targetScore: number | null;
}

export interface CurrentPlanRecord {
  studyPlanId: string;
  title: string;
  templateType: string;
  startDate: string;
  endDate: string;
  status: string;
  totalExpectedHours: number | null;
}

export interface TodoStatusSummary {
  completedCount: number;
  pendingCount: number;
}

export interface CreateDailyCheckinInput {
  userId: string;
  checkinDate: string;
  totalStudyMinutes: number;
  completedTodoCount: number;
  primarySubjectId: string | null;
  reflection: string | null;
  moodTag: string | null;
}

export interface UpdateDailyCheckinInput {
  totalStudyMinutes?: number;
  primarySubjectId?: string | null;
  reflection?: string;
  moodTag?: string | null;
}

@Injectable()
export class CheckinsRepository {
  constructor(private readonly dataSource: DataSource) {}

  findTodayCheckin(
    userId: string,
    date: string,
  ): Promise<TodayCheckinRecord | null> {
    return this.dataSource
      .createQueryBuilder()
      .from('study_checkins', 'checkin')
      .leftJoin(
        'subjects',
        'subject',
        'subject.id = checkin.primary_subject_id',
      )
      .select([
        'checkin.id AS "checkinId"',
        'checkin.checkin_date AS "checkinDate"',
        'checkin.total_study_minutes AS "totalStudyMinutes"',
        'checkin.completed_todo_count AS "completedTodoCount"',
        'checkin.primary_subject_id AS "primarySubjectId"',
        'subject.name AS "primarySubjectName"',
        'checkin.reflection AS "reflection"',
        'checkin.mood_tag AS "moodTag"',
      ])
      .where('checkin.user_id = :userId', { userId })
      .andWhere('checkin.checkin_date = :date', { date })
      .getRawOne<TodayCheckinRecord>()
      .then((row) => (row ? mapTodayCheckinRecord(row) : null));
  }

  async countCompletedTodosByDate(
    userId: string,
    date: string,
  ): Promise<number> {
    const row = await this.dataSource
      .createQueryBuilder()
      .from('todo_items', 'todo')
      .select('COUNT(1)', 'count')
      .where('todo.user_id = :userId', { userId })
      .andWhere('todo.due_date = :date', { date })
      .andWhere('todo.status = :status', { status: 'completed' })
      .getRawOne<{ count: string }>();

    return Number(row?.count ?? 0);
  }

  async countPendingTodosByDate(userId: string, date: string): Promise<number> {
    const row = await this.dataSource
      .createQueryBuilder()
      .from('todo_items', 'todo')
      .select('COUNT(1)', 'count')
      .where('todo.user_id = :userId', { userId })
      .andWhere('todo.due_date = :date', { date })
      .andWhere('todo.status = :status', { status: 'pending' })
      .getRawOne<{ count: string }>();

    return Number(row?.count ?? 0);
  }

  async createDailyCheckin(
    input: CreateDailyCheckinInput,
  ): Promise<TodayCheckinRecord> {
    await this.dataSource
      .createQueryBuilder()
      .insert()
      .into('study_checkins')
      .values({
        user_id: input.userId,
        checkin_date: input.checkinDate,
        total_study_minutes: input.totalStudyMinutes,
        completed_todo_count: input.completedTodoCount,
        primary_subject_id: input.primarySubjectId,
        reflection: input.reflection,
        mood_tag: input.moodTag,
      })
      .orIgnore()
      .execute();

    const record = await this.findTodayCheckin(input.userId, input.checkinDate);

    if (!record) {
      throw new Error('CHECKIN_CREATE_FAILED');
    }

    return record;
  }

  async findCheckinById(checkinId: string): Promise<TodayCheckinRecord | null> {
    const row = await this.dataSource
      .createQueryBuilder()
      .from('study_checkins', 'checkin')
      .leftJoin(
        'subjects',
        'subject',
        'subject.id = checkin.primary_subject_id',
      )
      .select([
        'checkin.id AS "checkinId"',
        'checkin.checkin_date AS "checkinDate"',
        'checkin.total_study_minutes AS "totalStudyMinutes"',
        'checkin.completed_todo_count AS "completedTodoCount"',
        'checkin.primary_subject_id AS "primarySubjectId"',
        'subject.name AS "primarySubjectName"',
        'checkin.reflection AS "reflection"',
        'checkin.mood_tag AS "moodTag"',
      ])
      .where('checkin.id = :checkinId', { checkinId })
      .getRawOne<TodayCheckinRecord>();

    return row ? mapTodayCheckinRecord(row) : null;
  }

  async updateCheckin(
    checkinId: string,
    input: UpdateDailyCheckinInput,
  ): Promise<void> {
    const values: Record<string, unknown> = {};

    if (input.totalStudyMinutes !== undefined) {
      values.total_study_minutes = input.totalStudyMinutes;
    }
    if (input.primarySubjectId !== undefined) {
      values.primary_subject_id = input.primarySubjectId;
    }
    if (input.reflection !== undefined) {
      values.reflection = input.reflection;
    }
    if (input.moodTag !== undefined) {
      values.mood_tag = input.moodTag;
    }

    await this.dataSource
      .createQueryBuilder()
      .update('study_checkins')
      .set(values)
      .where('id = :checkinId', { checkinId })
      .execute();
  }

  findCheckinsByDateRange(
    userId: string,
    dateFrom: string,
    dateTo: string,
  ): Promise<CheckinRangeRecord[]> {
    return this.dataSource
      .createQueryBuilder()
      .from('study_checkins', 'checkin')
      .leftJoin(
        'subjects',
        'subject',
        'subject.id = checkin.primary_subject_id',
      )
      .select([
        'checkin.checkin_date AS "checkinDate"',
        'checkin.total_study_minutes AS "totalStudyMinutes"',
        'checkin.primary_subject_id AS "primarySubjectId"',
        'subject.name AS "primarySubjectName"',
      ])
      .where('checkin.user_id = :userId', { userId })
      .andWhere('checkin.checkin_date >= :dateFrom', { dateFrom })
      .andWhere('checkin.checkin_date <= :dateTo', { dateTo })
      .orderBy('checkin.checkin_date', 'DESC')
      .getRawMany<CheckinRangeRecord>()
      .then((rows) => rows.map(mapCheckinRangeRecord));
  }

  findCheckinDatesBeforeOrOn(userId: string, date: string): Promise<string[]> {
    return this.dataSource
      .createQueryBuilder()
      .from('study_checkins', 'checkin')
      .select('checkin.checkin_date', 'checkinDate')
      .where('checkin.user_id = :userId', { userId })
      .andWhere('checkin.checkin_date <= :date', { date })
      .orderBy('checkin.checkin_date', 'DESC')
      .getRawMany<{ checkinDate: string }>()
      .then((rows) => rows.map((row) => row.checkinDate));
  }

  getTodoStatusSummary(
    userId: string,
    dateFrom: string,
    dateTo: string,
  ): Promise<TodoStatusSummary> {
    return this.dataSource
      .createQueryBuilder()
      .from('todo_items', 'todo')
      .select('todo.status', 'status')
      .addSelect('COUNT(1)', 'count')
      .where('todo.user_id = :userId', { userId })
      .andWhere('todo.due_date >= :dateFrom', { dateFrom })
      .andWhere('todo.due_date <= :dateTo', { dateTo })
      .groupBy('todo.status')
      .getRawMany<{ status: string; count: string }>()
      .then((rows) => ({
        completedCount: Number(
          rows.find((row) => row.status === 'completed')?.count ?? 0,
        ),
        pendingCount: Number(
          rows.find((row) => row.status === 'pending')?.count ?? 0,
        ),
      }));
  }

  async getCurrentTarget(userId: string): Promise<CurrentTargetRecord | null> {
    const row = await this.dataSource
      .createQueryBuilder()
      .from('user_targets', 'target')
      .leftJoin('schools', 'school', 'school.id = target.school_id')
      .leftJoin(
        'departments',
        'department',
        'department.id = target.department_id',
      )
      .leftJoin('programs', 'program', 'program.id = target.program_id')
      .select([
        'target.id AS "userTargetId"',
        'target.school_id AS "schoolId"',
        'school.name AS "schoolName"',
        'target.department_id AS "departmentId"',
        'department.name AS "departmentName"',
        'target.program_id AS "programId"',
        'program.name AS "programName"',
        'target.target_score AS "targetScore"',
      ])
      .where('target.user_id = :userId', { userId })
      .andWhere('target.target_status = :status', { status: 'active' })
      .orderBy('target.selected_at', 'DESC')
      .limit(1)
      .getRawOne<CurrentTargetRecord>();

    return row ? mapCurrentTargetRecord(row) : null;
  }

  async getCurrentPlan(userId: string): Promise<CurrentPlanRecord | null> {
    const row = await this.dataSource
      .createQueryBuilder()
      .from('study_plans', 'plan')
      .select([
        'plan.id AS "studyPlanId"',
        'plan.title AS "title"',
        'plan.template_type AS "templateType"',
        'plan.start_date AS "startDate"',
        'plan.end_date AS "endDate"',
        'plan.status AS "status"',
        'plan.total_expected_hours AS "totalExpectedHours"',
      ])
      .where('plan.user_id = :userId', { userId })
      .andWhere('plan.status = :status', { status: 'active' })
      .orderBy('plan.updated_at', 'DESC')
      .limit(1)
      .getRawOne<CurrentPlanRecord>();

    return row ? mapCurrentPlanRecord(row) : null;
  }
}

const toNumber = (value: number | string | null | undefined): number =>
  value == null ? 0 : typeof value === 'number' ? value : Number(value);

const mapTodayCheckinRecord = (
  row: TodayCheckinRecord,
): TodayCheckinRecord => ({
  ...row,
  totalStudyMinutes: toNumber(row.totalStudyMinutes),
  completedTodoCount: toNumber(row.completedTodoCount),
});

const mapCheckinRangeRecord = (
  row: CheckinRangeRecord,
): CheckinRangeRecord => ({
  ...row,
  totalStudyMinutes: toNumber(row.totalStudyMinutes),
});

const mapCurrentTargetRecord = (
  row: CurrentTargetRecord,
): CurrentTargetRecord => ({
  ...row,
  targetScore:
    row.targetScore == null
      ? null
      : typeof row.targetScore === 'number'
        ? row.targetScore
        : Number(row.targetScore),
});

const mapCurrentPlanRecord = (row: CurrentPlanRecord): CurrentPlanRecord => ({
  ...row,
  totalExpectedHours:
    row.totalExpectedHours == null
      ? null
      : typeof row.totalExpectedHours === 'number'
        ? row.totalExpectedHours
        : Number(row.totalExpectedHours),
});
