import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  addDays,
  formatDateOnly,
  getTodayDate,
  getWeekStartDate,
  parseDateOnly,
} from '../../common/utils/date.util';
import { CreateCheckinDto } from './dto/create-checkin.dto';
import { QueryStudyStatsDto } from './dto/query-study-stats.dto';
import { UpdateCheckinDto } from './dto/update-checkin.dto';
import { CheckinsRepository } from './repositories/checkins.repository';

@Injectable()
export class CheckinsService {
  constructor(private readonly checkinsRepository: CheckinsRepository) {}

  async getTodayCheckin(userId: string) {
    const today = getTodayDate();
    const [checkin, completedTodoCount] = await Promise.all([
      this.checkinsRepository.findTodayCheckin(userId, today),
      this.checkinsRepository.countCompletedTodosByDate(userId, today),
    ]);

    if (!checkin) {
      return {
        checkinId: null,
        checkinDate: today,
        totalStudyMinutes: null,
        completedTodoCount,
        primarySubjectId: null,
        primarySubjectName: null,
        reflection: null,
        moodTag: null,
        isCheckedIn: false,
      };
    }

    return {
      checkinId: checkin.checkinId,
      checkinDate: checkin.checkinDate,
      totalStudyMinutes: checkin.totalStudyMinutes,
      completedTodoCount,
      primarySubjectId: checkin.primarySubjectId,
      primarySubjectName: checkin.primarySubjectName,
      reflection: checkin.reflection,
      moodTag: checkin.moodTag,
      isCheckedIn: true,
    };
  }

  async create(userId: string, dto: CreateCheckinDto) {
    const today = getTodayDate();
    const checkinDate = dto.checkinDate ?? today;

    if (checkinDate !== today) {
      throw new BadRequestException('INVALID_PARAMS');
    }

    const completedTodoCount =
      await this.checkinsRepository.countCompletedTodosByDate(
        userId,
        checkinDate,
      );
    const checkin = await this.checkinsRepository.createDailyCheckin({
      userId,
      checkinDate,
      totalStudyMinutes: dto.totalStudyMinutes,
      completedTodoCount,
      primarySubjectId: dto.primarySubjectId ?? null,
      reflection: dto.reflection ?? null,
      moodTag: dto.moodTag ?? null,
    });
    const streakDates =
      await this.checkinsRepository.findCheckinDatesBeforeOrOn(
        userId,
        checkinDate,
      );

    return {
      checkinId: checkin.checkinId,
      checkinDate: checkin.checkinDate,
      continuousDays: this.computeContinuousCheckinDays(
        streakDates,
        checkin.checkinDate,
      ),
      todayStudyMinutes: checkin.totalStudyMinutes,
    };
  }

  async update(userId: string, checkinId: string, dto: UpdateCheckinDto) {
    const today = getTodayDate();
    const checkin = await this.checkinsRepository.findCheckinById(checkinId);

    if (!checkin || checkin.checkinDate !== today) {
      throw new NotFoundException('NOT_FOUND');
    }

    const todayCheckin = await this.checkinsRepository.findTodayCheckin(
      userId,
      today,
    );
    if (!todayCheckin || todayCheckin.checkinId !== checkinId) {
      throw new NotFoundException('NOT_FOUND');
    }

    await this.checkinsRepository.updateCheckin(checkinId, {
      totalStudyMinutes: dto.totalStudyMinutes,
      primarySubjectId: dto.primarySubjectId,
      reflection: dto.reflection,
      moodTag: dto.moodTag,
    });

    const [updatedCheckin, streakDates] = await Promise.all([
      this.checkinsRepository.findCheckinById(checkinId),
      this.checkinsRepository.findCheckinDatesBeforeOrOn(userId, today),
    ]);

    return {
      checkinId,
      checkinDate: today,
      totalStudyMinutes: updatedCheckin?.totalStudyMinutes ?? null,
      primarySubjectId: updatedCheckin?.primarySubjectId ?? null,
      primarySubjectName: updatedCheckin?.primarySubjectName ?? null,
      reflection: updatedCheckin?.reflection ?? null,
      moodTag: updatedCheckin?.moodTag ?? null,
      continuousDays: this.computeContinuousCheckinDays(streakDates, today),
    };
  }

  async getOverview(userId: string, query: QueryStudyStatsDto) {
    const today = getTodayDate();
    const weekStart = getWeekStartDate(today);
    const range = query.range ?? 'week';
    const rangeStart = range === 'today' ? today : weekStart;

    const [
      todayCheckin,
      weekCheckins,
      rangeCheckins,
      streakDates,
      todoSummary,
      todayPendingTodoCount,
      currentTarget,
      currentPlan,
    ] = await Promise.all([
      this.checkinsRepository.findTodayCheckin(userId, today),
      this.checkinsRepository.findCheckinsByDateRange(userId, weekStart, today),
      this.checkinsRepository.findCheckinsByDateRange(
        userId,
        rangeStart,
        today,
      ),
      this.checkinsRepository.findCheckinDatesBeforeOrOn(userId, today),
      this.checkinsRepository.getTodoStatusSummary(userId, rangeStart, today),
      this.checkinsRepository.countPendingTodosByDate(userId, today),
      this.checkinsRepository.getCurrentTarget(userId),
      this.checkinsRepository.getCurrentPlan(userId),
    ]);

    return {
      todayStudyMinutes: todayCheckin?.totalStudyMinutes ?? 0,
      weekStudyMinutes: weekCheckins.reduce(
        (total, item) => total + item.totalStudyMinutes,
        0,
      ),
      continuousCheckinDays: this.computeContinuousCheckinDays(
        streakDates,
        today,
      ),
      todoCompletionRate: this.computeTodoCompletionRate(todoSummary),
      subjectDistribution: this.buildSubjectDistribution(rangeCheckins),
      todayPendingTodoCount,
      currentTarget,
      currentPlan,
    };
  }

  private computeContinuousCheckinDays(dates: string[], today: string) {
    const dateSet = new Set(dates);
    let cursor = today;
    let streak = 0;

    while (dateSet.has(cursor)) {
      streak += 1;
      cursor = formatDateOnly(addDays(parseDateOnly(cursor), -1));
    }

    return streak;
  }

  private computeTodoCompletionRate(summary: {
    completedCount: number;
    pendingCount: number;
  }) {
    const total = summary.completedCount + summary.pendingCount;
    if (total === 0) {
      return 0;
    }

    return Number((summary.completedCount / total).toFixed(4));
  }

  private buildSubjectDistribution(
    rows: Array<{
      primarySubjectId: string | null;
      primarySubjectName: string | null;
      totalStudyMinutes: number;
    }>,
  ) {
    const grouped = new Map<
      string,
      {
        subjectId: string;
        subjectName: string | null;
        studyMinutes: number;
      }
    >();

    for (const row of rows) {
      if (!row.primarySubjectId) {
        continue;
      }

      const current = grouped.get(row.primarySubjectId) ?? {
        subjectId: row.primarySubjectId,
        subjectName: row.primarySubjectName,
        studyMinutes: 0,
      };
      current.studyMinutes += row.totalStudyMinutes;
      grouped.set(row.primarySubjectId, current);
    }

    const items = Array.from(grouped.values()).sort(
      (left, right) => right.studyMinutes - left.studyMinutes,
    );
    const totalStudyMinutes = items.reduce(
      (total, item) => total + item.studyMinutes,
      0,
    );

    return items.map((item) => ({
      ...item,
      ratio:
        totalStudyMinutes === 0
          ? 0
          : Number((item.studyMinutes / totalStudyMinutes).toFixed(4)),
    }));
  }
}
