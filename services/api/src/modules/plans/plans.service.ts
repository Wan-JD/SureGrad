import { Injectable } from '@nestjs/common';
import { buildSkeletonResponse } from '../../common/utils/build-skeleton-response';
import { GenerateStudyPlanDto } from './dto/generate-study-plan.dto';
import { QueryDailyPlansDto } from './dto/query-daily-plans.dto';
import { QueryWeeklyPlansDto } from './dto/query-weekly-plans.dto';
import { UpdateDailyPlanDto } from './dto/update-daily-plan.dto';
import { UpdateCurrentTargetDto } from './dto/update-current-target.dto';
import { UpdateWeeklyPlanDto } from './dto/update-weekly-plan.dto';

@Injectable()
export class PlansService {
  getCurrentTarget() {
    return buildSkeletonResponse({
      domain: 'plans',
      action: 'getCurrentTarget',
      message:
        'Current target lookup is scaffolded, but active-target resolution has not been connected yet.',
      nextSteps: [
        'Load the current user active target from user_targets.',
        'Attach school, department, and program summary fields for profile and planning pages.',
      ],
    });
  }

  updateCurrentTarget(dto: UpdateCurrentTargetDto) {
    return buildSkeletonResponse({
      domain: 'plans',
      action: 'updateCurrentTarget',
      message:
        'Target selection endpoint is scaffolded, but persistence rules for active and archived targets are still pending.',
      nextSteps: [
        'Validate school, department, and program ownership relationships.',
        'Enforce single active target per user.',
        'Snapshot target changes for later plan regeneration.',
      ],
      payload: dto,
    });
  }

  generateStudyPlan(dto: GenerateStudyPlanDto) {
    return buildSkeletonResponse({
      domain: 'plans',
      action: 'generateStudyPlan',
      message:
        'Study-plan generation is reserved here, but template rules and write models are not implemented yet.',
      nextSteps: [
        'Translate user target and profile data into a plan template.',
        'Persist study_plans, study_plan_phases, weekly_plans, and daily_plans.',
        'Optionally seed generated todos for the current week.',
      ],
      payload: dto,
    });
  }

  getCurrentStudyPlan() {
    return buildSkeletonResponse({
      domain: 'plans',
      action: 'getCurrentStudyPlan',
      message:
        'Current plan lookup is scaffolded, but active-plan resolution is still pending.',
      nextSteps: [
        'Resolve the active plan for the current user.',
        'Map plan phases and progress summaries into a read model.',
      ],
    });
  }

  getWeeklyPlans(query: QueryWeeklyPlansDto) {
    return buildSkeletonResponse({
      domain: 'plans',
      action: 'getWeeklyPlans',
      message: 'Weekly plan listing is not implemented yet.',
      nextSteps: [
        'Load weekly_plans by plan and date window.',
        'Attach completion summaries from daily plans and todos.',
      ],
      payload: query,
    });
  }

  getDailyPlan(query: QueryDailyPlansDto) {
    return buildSkeletonResponse({
      domain: 'plans',
      action: 'getDailyPlan',
      message:
        'Daily plan lookup is scaffolded, but todo aggregation is still pending.',
      nextSteps: [
        'Resolve the plan for the requested date.',
        'Join daily_plans with todo_items for the same day.',
      ],
      payload: query,
    });
  }

  updateWeeklyPlan(weeklyPlanId: string, dto: UpdateWeeklyPlanDto) {
    return buildSkeletonResponse({
      domain: 'plans',
      action: 'updateWeeklyPlan',
      message:
        'Weekly-plan editing is scaffolded, but write validation and persistence are still pending.',
      nextSteps: [
        'Validate weekly plan ownership and active-plan membership.',
        'Apply editable fields and recalculate weekly summaries.',
      ],
      payload: {
        weeklyPlanId,
        ...dto,
      },
    });
  }

  updateDailyPlan(dailyPlanId: string, dto: UpdateDailyPlanDto) {
    return buildSkeletonResponse({
      domain: 'plans',
      action: 'updateDailyPlan',
      message:
        'Daily-plan editing is scaffolded, but write validation and todo synchronization are still pending.',
      nextSteps: [
        'Validate daily plan ownership for the current user.',
        'Apply editable fields and refresh linked todo projections.',
      ],
      payload: {
        dailyPlanId,
        ...dto,
      },
    });
  }
}
