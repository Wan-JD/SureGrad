import { Injectable } from '@nestjs/common';
import { buildSkeletonResponse } from '../../common/utils/build-skeleton-response';
import { CreateCheckinDto } from './dto/create-checkin.dto';
import { QueryStudyStatsDto } from './dto/query-study-stats.dto';
import { UpdateCheckinDto } from './dto/update-checkin.dto';

@Injectable()
export class CheckinsService {
  getTodayCheckin() {
    return buildSkeletonResponse({
      domain: 'checkins',
      action: 'getTodayCheckin',
      message:
        'Today check-in lookup is scaffolded, but auth-context resolution and summary projection are pending.',
      nextSteps: [
        'Resolve today in the user timezone.',
        'Load the current day check-in and completed todo count.',
      ],
    });
  }

  create(dto: CreateCheckinDto) {
    return buildSkeletonResponse({
      domain: 'checkins',
      action: 'create',
      message:
        'Daily check-in write flow is reserved here, but idempotency and streak logic are not implemented yet.',
      nextSteps: [
        'Enforce one primary check-in per user per day.',
        'Snapshot completed todo count for the day.',
        'Compute streak metrics after successful writes.',
      ],
      payload: dto,
    });
  }

  update(checkinId: string, dto: UpdateCheckinDto) {
    return buildSkeletonResponse({
      domain: 'checkins',
      action: 'update',
      message:
        'Check-in update route is scaffolded, but edit constraints still need product confirmation.',
      nextSteps: [
        'Load check-in ownership and day constraints.',
        'Apply partial updates safely.',
      ],
      payload: {
        checkinId,
        ...dto,
      },
    });
  }

  getOverview(query: QueryStudyStatsDto) {
    return buildSkeletonResponse({
      domain: 'checkins',
      action: 'getOverview',
      message:
        'Study statistics overview is scaffolded, but aggregation queries are still pending.',
      nextSteps: [
        'Aggregate today and week study minutes.',
        'Compute streaks and todo completion rate.',
        'Join current target and active plan summary cards.',
      ],
      payload: query,
    });
  }
}
