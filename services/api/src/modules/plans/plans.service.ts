import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  addDays,
  diffDaysInclusive,
  formatDateOnly,
  getTodayDate,
  getWeekEndDate,
  getWeekStartDate,
  minDate,
  parseDateOnly,
} from '../../common/utils/date.util';
import { DailyPlanEntity } from '../../database/entities/daily-plan.entity';
import { StudyPlanPhaseEntity } from '../../database/entities/study-plan-phase.entity';
import { TodoItemEntity } from '../../database/entities/todo-item.entity';
import { WeeklyPlanEntity } from '../../database/entities/weekly-plan.entity';
import { GenerateStudyPlanDto } from './dto/generate-study-plan.dto';
import { QueryDailyPlansDto } from './dto/query-daily-plans.dto';
import { QueryWeeklyPlansDto } from './dto/query-weekly-plans.dto';
import { UpdateDailyPlanDto } from './dto/update-daily-plan.dto';
import { UpdateCurrentTargetDto } from './dto/update-current-target.dto';
import { UpdateWeeklyPlanDto } from './dto/update-weekly-plan.dto';
import { PlansRepository } from './repositories/plans.repository';

@Injectable()
export class PlansService {
  constructor(private readonly plansRepository: PlansRepository) {}

  async getCurrentTarget(userId: string) {
    const currentTarget = await this.plansRepository.getCurrentTarget(userId);
    if (!currentTarget) {
      return {
        userTargetId: null,
        schoolId: null,
        departmentId: null,
        programId: null,
        targetScore: null,
        targetStatus: null,
        selectedAt: null,
      };
    }

    return {
      userTargetId: currentTarget.id,
      schoolId: currentTarget.schoolId,
      departmentId: currentTarget.departmentId,
      programId: currentTarget.programId,
      targetScore: currentTarget.targetScore,
      targetStatus: currentTarget.targetStatus,
      selectedAt: currentTarget.selectedAt.toISOString(),
    };
  }

  async updateCurrentTarget(userId: string, dto: UpdateCurrentTargetDto) {
    const school = await this.plansRepository.findSchoolById(dto.schoolId);
    if (!school) {
      throw new NotFoundException('NOT_FOUND');
    }

    let departmentName: string | null = null;
    if (dto.departmentId) {
      const department = await this.plansRepository.findDepartmentById(
        dto.departmentId,
      );

      if (!department || department.schoolId !== school.id) {
        throw new BadRequestException('INVALID_PARAMS');
      }

      departmentName = department.name;
    }

    let programName: string | null = null;
    if (dto.programId) {
      const program = await this.plansRepository.findProgramById(dto.programId);

      if (!program || program.schoolId !== school.id) {
        throw new BadRequestException('INVALID_PARAMS');
      }

      if (dto.departmentId && program.departmentId !== dto.departmentId) {
        throw new BadRequestException('INVALID_PARAMS');
      }

      programName = program.name;
    }

    const currentTarget = await this.plansRepository.replaceCurrentTarget(
      userId,
      dto,
    );

    return {
      userTargetId: currentTarget.id,
      targetStatus: currentTarget.targetStatus,
      selectedAt: currentTarget.selectedAt.toISOString(),
      targetSummary: {
        schoolId: school.id,
        schoolName: school.name,
        departmentId: dto.departmentId ?? null,
        departmentName,
        programId: dto.programId ?? null,
        programName,
        targetScore: dto.targetScore ?? null,
      },
    };
  }

  async generateStudyPlan(userId: string, dto: GenerateStudyPlanDto) {
    if (dto.startDate > dto.endDate) {
      throw new BadRequestException('INVALID_PARAMS');
    }

    const [profile, currentTarget, activePlan] = await Promise.all([
      this.plansRepository.findUserProfileByUserId(userId),
      this.plansRepository.getCurrentTarget(userId),
      this.plansRepository.getCurrentStudyPlan(userId),
    ]);

    if (!profile || !profile.onboardingCompleted) {
      throw new BadRequestException('PROFILE_INCOMPLETE');
    }

    if (!currentTarget) {
      throw new BadRequestException('TARGET_REQUIRED');
    }

    if (activePlan && !dto.forceRegenerate) {
      throw new ConflictException('PLAN_ALREADY_EXISTS');
    }

    const focusSubjects = this.buildFocusSubjects(profile.intendedDiscipline, {
      schoolName: currentTarget.school?.name ?? null,
      departmentName: currentTarget.department?.name ?? null,
      programName: currentTarget.program?.name ?? null,
    });
    const phases = this.buildPhasePayloads(
      dto.startDate,
      dto.endDate,
      focusSubjects,
    );
    const anchorDate = this.getPlanAnchorDate(dto.startDate, dto.endDate);
    const currentWeekStartDate =
      dto.startDate > getWeekStartDate(anchorDate)
        ? dto.startDate
        : getWeekStartDate(anchorDate);
    const currentWeekEndDate = minDate(
      getWeekEndDate(currentWeekStartDate),
      dto.endDate,
    );
    const dailyPlanDates = this.buildDateRange(
      currentWeekStartDate,
      currentWeekEndDate,
    );
    const dailyStudyHours = profile.dailyStudyHours ?? 0;
    const totalExpectedHours = Number(
      (diffDaysInclusive(dto.startDate, dto.endDate) * dailyStudyHours).toFixed(
        1,
      ),
    );

    const createdPlan = await this.plansRepository.createGeneratedStudyPlan({
      userId,
      userTargetId: currentTarget.id,
      templateType: dto.templateType,
      title: this.buildStudyPlanTitle(currentTarget),
      startDate: dto.startDate,
      endDate: dto.endDate,
      totalExpectedHours,
      planSnapshot: {
        profile: {
          examYear: profile.examYear,
          identityType: profile.identityType,
          intendedDiscipline: profile.intendedDiscipline,
          dailyStudyHours: profile.dailyStudyHours,
          examMathRequired: profile.examMathRequired,
        },
        target: {
          userTargetId: currentTarget.id,
          schoolId: currentTarget.schoolId,
          schoolName: currentTarget.school?.name ?? null,
          departmentId: currentTarget.departmentId,
          departmentName: currentTarget.department?.name ?? null,
          programId: currentTarget.programId,
          programName: currentTarget.program?.name ?? null,
          targetScore: currentTarget.targetScore,
        },
      },
      phasePayloads: phases.map((phase, index) => ({
        ...phase,
        sortOrder: index,
      })),
      weeklyPlanPayload: {
        phaseIndex: phases.findIndex(
          (phase) =>
            phase.startDate <= currentWeekStartDate &&
            phase.endDate >= currentWeekStartDate,
        ),
        weekStartDate: currentWeekStartDate,
        weekEndDate: currentWeekEndDate,
        title: `Week Plan ${currentWeekStartDate}`,
        goals: `Focus on ${focusSubjects.join(', ')}`,
        expectedHours: Number(
          (dailyPlanDates.length * dailyStudyHours).toFixed(1),
        ),
        status: 'active',
      },
      dailyPlanPayloads: dailyPlanDates.map((planDate) => ({
        planDate,
        title: `Daily Plan ${planDate}`,
        expectedHours: dailyStudyHours,
        notes: null,
        status: planDate === getTodayDate() ? 'active' : 'draft',
      })),
    });

    return {
      studyPlanId: createdPlan.studyPlan.id,
      templateType: createdPlan.studyPlan.templateType,
      status: createdPlan.studyPlan.status,
      phaseCount: createdPlan.phaseCount,
      weeklyPlanCount: createdPlan.weeklyPlanCount,
      dailyPlanCount: createdPlan.dailyPlanCount,
    };
  }

  async getCurrentStudyPlan(userId: string) {
    const studyPlan = await this.plansRepository.getCurrentStudyPlan(userId);
    if (!studyPlan) {
      return {
        studyPlanId: null,
        title: null,
        templateType: null,
        startDate: null,
        endDate: null,
        status: null,
        totalExpectedHours: null,
        phases: [],
        currentWeek: null,
        todayPlan: null,
      };
    }

    const today = getTodayDate();
    const [phases, currentWeek, todayPlan] = await Promise.all([
      this.plansRepository.getStudyPlanPhases(studyPlan.id),
      this.plansRepository.getCurrentWeeklyPlan(studyPlan.id, today),
      this.plansRepository.getTodayPlan(studyPlan.id, today),
    ]);

    return {
      studyPlanId: studyPlan.id,
      title: studyPlan.title,
      templateType: studyPlan.templateType,
      startDate: studyPlan.startDate,
      endDate: studyPlan.endDate,
      status: studyPlan.status,
      totalExpectedHours: studyPlan.totalExpectedHours,
      phases: phases.map((phase) => ({
        studyPlanPhaseId: phase.id,
        phaseType: phase.phaseType,
        title: phase.title,
        startDate: phase.startDate,
        endDate: phase.endDate,
        goals: phase.goals,
        focusSubjects: phase.focusSubjects,
      })),
      currentWeek: currentWeek
        ? {
            weeklyPlanId: currentWeek.id,
            weekStartDate: currentWeek.weekStartDate,
            weekEndDate: currentWeek.weekEndDate,
            title: currentWeek.title,
            goals: currentWeek.goals,
            expectedHours: currentWeek.expectedHours,
            status: currentWeek.status,
          }
        : null,
      todayPlan: todayPlan
        ? {
            dailyPlanId: todayPlan.id,
            planDate: todayPlan.planDate,
            title: todayPlan.title,
            expectedHours: todayPlan.expectedHours,
            notes: todayPlan.notes,
            status: todayPlan.status,
          }
        : null,
    };
  }

  async getWeeklyPlans(userId: string, query: QueryWeeklyPlansDto) {
    const studyPlan = await this.resolveStudyPlan(userId, query.studyPlanId);
    const weekStartDate =
      query.weekStartDate?.slice(0, 10) ??
      this.getDefaultWeekStartDate(studyPlan.startDate, studyPlan.endDate);

    const weeklyPlan =
      await this.plansRepository.getWeeklyPlanByStudyPlanAndStartDate(
        studyPlan.id,
        weekStartDate,
      );

    if (!weeklyPlan) {
      throw new NotFoundException('NOT_FOUND');
    }

    const dailyPlans = await this.plansRepository.getDailyPlansByWeeklyPlanId(
      weeklyPlan.id,
    );

    return this.toWeeklyPlanResponse(weeklyPlan, dailyPlans);
  }

  async getDailyPlan(userId: string, query: QueryDailyPlansDto) {
    const studyPlan = await this.resolveStudyPlan(userId, query.studyPlanId);
    const planDate = query.date.slice(0, 10);
    const [dailyPlan, todos] = await Promise.all([
      this.plansRepository.getDailyPlanByStudyPlanAndDate(
        studyPlan.id,
        planDate,
      ),
      this.plansRepository.getTodosForPlanDate(userId, planDate, studyPlan.id),
    ]);

    return this.toDailyPlanResponse(dailyPlan, studyPlan.id, planDate, todos);
  }

  async updateWeeklyPlan(
    userId: string,
    weeklyPlanId: string,
    dto: UpdateWeeklyPlanDto,
  ) {
    const weeklyPlan = await this.plansRepository.findWeeklyPlanByIdForUser(
      weeklyPlanId,
      userId,
    );

    if (!weeklyPlan) {
      throw new NotFoundException('NOT_FOUND');
    }

    if (dto.title !== undefined) {
      weeklyPlan.title = dto.title;
    }

    if (dto.goals !== undefined) {
      weeklyPlan.goals = dto.goals;
    }

    if (dto.expectedHours !== undefined) {
      weeklyPlan.expectedHours = dto.expectedHours;
    }

    if (dto.status !== undefined) {
      weeklyPlan.status = dto.status;
    }

    const savedWeeklyPlan =
      await this.plansRepository.saveWeeklyPlan(weeklyPlan);
    const dailyPlans = await this.plansRepository.getDailyPlansByWeeklyPlanId(
      savedWeeklyPlan.id,
    );

    return this.toWeeklyPlanResponse(savedWeeklyPlan, dailyPlans);
  }

  async updateDailyPlan(
    userId: string,
    dailyPlanId: string,
    dto: UpdateDailyPlanDto,
  ) {
    const dailyPlan = await this.plansRepository.findDailyPlanByIdForUser(
      dailyPlanId,
      userId,
    );

    if (!dailyPlan) {
      throw new NotFoundException('NOT_FOUND');
    }

    if (dto.title !== undefined) {
      dailyPlan.title = dto.title;
    }

    if (dto.expectedHours !== undefined) {
      dailyPlan.expectedHours = dto.expectedHours;
    }

    if (dto.notes !== undefined) {
      dailyPlan.notes = dto.notes;
    }

    if (dto.status !== undefined) {
      dailyPlan.status = dto.status;
    }

    const savedDailyPlan = await this.plansRepository.saveDailyPlan(dailyPlan);
    const todos = await this.plansRepository.getTodosForPlanDate(
      userId,
      savedDailyPlan.planDate,
      savedDailyPlan.studyPlanId,
    );

    return this.toDailyPlanResponse(
      savedDailyPlan,
      savedDailyPlan.studyPlanId,
      savedDailyPlan.planDate,
      todos,
    );
  }

  private async resolveStudyPlan(userId: string, studyPlanId?: string) {
    const studyPlan = studyPlanId
      ? await this.plansRepository.findStudyPlanByIdForUser(studyPlanId, userId)
      : await this.plansRepository.getCurrentStudyPlan(userId);

    if (!studyPlan) {
      throw new NotFoundException('NOT_FOUND');
    }

    return studyPlan;
  }

  private buildFocusSubjects(
    intendedDiscipline: string,
    target: {
      schoolName: string | null;
      departmentName: string | null;
      programName: string | null;
    },
  ) {
    return [
      intendedDiscipline,
      target.programName,
      target.departmentName,
      target.schoolName,
    ].filter((item): item is string => Boolean(item));
  }

  private buildStudyPlanTitle(
    currentTarget: Awaited<ReturnType<PlansRepository['getCurrentTarget']>>,
  ) {
    const schoolName = currentTarget?.school?.name ?? 'Target School';
    const programName = currentTarget?.program?.name ?? 'Study';
    return `${schoolName} ${programName} Plan`;
  }

  private buildPhasePayloads(
    startDate: string,
    endDate: string,
    focusSubjects: string[],
  ) {
    const phaseTypes: StudyPlanPhaseEntity['phaseType'][] = [
      'foundation',
      'intensive',
      'final',
      'interview',
    ];
    const phaseTitles: Record<StudyPlanPhaseEntity['phaseType'], string> = {
      foundation: 'Foundation',
      intensive: 'Intensive',
      final: 'Final Sprint',
      interview: 'Interview',
    };
    const totalDays = diffDaysInclusive(startDate, endDate);
    const phaseCount = Math.min(phaseTypes.length, Math.max(totalDays, 1));
    const baseDays = Math.floor(totalDays / phaseCount);
    const remainder = totalDays % phaseCount;
    const phases: Array<{
      phaseType: StudyPlanPhaseEntity['phaseType'];
      title: string;
      startDate: string;
      endDate: string;
      focusSubjects: unknown[];
      goals: string | null;
    }> = [];

    let currentDate = startDate;
    for (let index = 0; index < phaseCount; index += 1) {
      const days = baseDays + (index < remainder ? 1 : 0);
      const phaseEndDate =
        index === phaseCount - 1
          ? endDate
          : formatDateOnly(addDays(parseDateOnly(currentDate), days - 1));
      const phaseType = phaseTypes[index];

      phases.push({
        phaseType,
        title: phaseTitles[phaseType],
        startDate: currentDate,
        endDate: phaseEndDate,
        focusSubjects,
        goals: `Focus on ${focusSubjects.join(', ')}`,
      });

      currentDate = formatDateOnly(addDays(parseDateOnly(phaseEndDate), 1));
    }

    return phases;
  }

  private buildDateRange(startDate: string, endDate: string) {
    const dates: string[] = [];
    let currentDate = startDate;

    while (currentDate <= endDate) {
      dates.push(currentDate);
      currentDate = formatDateOnly(addDays(parseDateOnly(currentDate), 1));
    }

    return dates;
  }

  private getPlanAnchorDate(startDate: string, endDate: string) {
    const today = getTodayDate();
    if (today < startDate) {
      return startDate;
    }

    if (today > endDate) {
      return endDate;
    }

    return today;
  }

  private getDefaultWeekStartDate(startDate: string, endDate: string) {
    const anchorDate = this.getPlanAnchorDate(startDate, endDate);
    const weekStartDate = getWeekStartDate(anchorDate);
    return startDate > weekStartDate ? startDate : weekStartDate;
  }

  private toWeeklyPlanResponse(
    weeklyPlan: WeeklyPlanEntity,
    dailyPlans: DailyPlanEntity[],
  ) {
    return {
      weeklyPlanId: weeklyPlan.id,
      studyPlanId: weeklyPlan.studyPlanId,
      phaseId: weeklyPlan.phaseId,
      title: weeklyPlan.title,
      weekStartDate: weeklyPlan.weekStartDate,
      weekEndDate: weeklyPlan.weekEndDate,
      goals: weeklyPlan.goals,
      expectedHours: weeklyPlan.expectedHours,
      status: weeklyPlan.status,
      dailyPlans: dailyPlans.map((dailyPlan) => ({
        dailyPlanId: dailyPlan.id,
        planDate: dailyPlan.planDate,
        title: dailyPlan.title,
        expectedHours: dailyPlan.expectedHours,
        status: dailyPlan.status,
      })),
    };
  }

  private toDailyPlanResponse(
    dailyPlan: DailyPlanEntity | null,
    studyPlanId: string,
    planDate: string,
    todos: TodoItemEntity[],
  ) {
    return {
      dailyPlanId: dailyPlan?.id ?? null,
      studyPlanId,
      weeklyPlanId: dailyPlan?.weeklyPlanId ?? null,
      planDate,
      title: dailyPlan?.title ?? null,
      expectedHours: dailyPlan?.expectedHours ?? null,
      notes: dailyPlan?.notes ?? null,
      status: dailyPlan?.status ?? null,
      todos: todos.map((todo) => ({
        todoItemId: todo.id,
        subjectId: todo.subjectId,
        subjectName: todo.subject?.name ?? null,
        title: todo.title,
        description: todo.description,
        dueDate: todo.dueDate,
        expectedMinutes: todo.expectedMinutes,
        priority: todo.priority,
        sourceType: todo.sourceType,
        status: todo.status,
        completedAt: todo.completedAt?.toISOString() ?? null,
      })),
    };
  }
}
