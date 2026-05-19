import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { DailyPlanEntity } from '../../../database/entities/daily-plan.entity';
import { DepartmentEntity } from '../../../database/entities/department.entity';
import { ProgramEntity } from '../../../database/entities/program.entity';
import { SchoolEntity } from '../../../database/entities/school.entity';
import { StudyPlanPhaseEntity } from '../../../database/entities/study-plan-phase.entity';
import { StudyPlanEntity } from '../../../database/entities/study-plan.entity';
import { TodoItemEntity } from '../../../database/entities/todo-item.entity';
import { UserProfileEntity } from '../../../database/entities/user-profile.entity';
import { UserTargetEntity } from '../../../database/entities/user-target.entity';
import { WeeklyPlanEntity } from '../../../database/entities/weekly-plan.entity';

@Injectable()
export class PlansRepository {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(UserTargetEntity)
    private readonly userTargetsRepository: Repository<UserTargetEntity>,
    @InjectRepository(SchoolEntity)
    private readonly schoolsRepository: Repository<SchoolEntity>,
    @InjectRepository(DepartmentEntity)
    private readonly departmentsRepository: Repository<DepartmentEntity>,
    @InjectRepository(ProgramEntity)
    private readonly programsRepository: Repository<ProgramEntity>,
    @InjectRepository(StudyPlanEntity)
    private readonly studyPlansRepository: Repository<StudyPlanEntity>,
    @InjectRepository(StudyPlanPhaseEntity)
    private readonly studyPlanPhasesRepository: Repository<StudyPlanPhaseEntity>,
    @InjectRepository(WeeklyPlanEntity)
    private readonly weeklyPlansRepository: Repository<WeeklyPlanEntity>,
    @InjectRepository(DailyPlanEntity)
    private readonly dailyPlansRepository: Repository<DailyPlanEntity>,
    @InjectRepository(TodoItemEntity)
    private readonly todoItemsRepository: Repository<TodoItemEntity>,
    @InjectRepository(UserProfileEntity)
    private readonly userProfilesRepository: Repository<UserProfileEntity>,
  ) {}

  findUserProfileByUserId(userId: string) {
    return this.userProfilesRepository.findOne({
      where: { userId },
    });
  }

  findSchoolById(id: string) {
    return this.schoolsRepository.findOne({
      where: { id },
    });
  }

  findDepartmentById(id: string) {
    return this.departmentsRepository.findOne({
      where: { id },
    });
  }

  findProgramById(id: string) {
    return this.programsRepository.findOne({
      where: { id },
    });
  }

  getCurrentTarget(userId: string) {
    return this.userTargetsRepository.findOne({
      where: {
        userId,
        targetStatus: 'active',
      },
      relations: {
        school: true,
        department: true,
        program: true,
      },
      order: {
        selectedAt: 'DESC',
      },
    });
  }

  async replaceCurrentTarget(
    userId: string,
    payload: {
      schoolId: string;
      departmentId?: string;
      programId?: string;
      targetScore?: number;
    },
  ) {
    return this.dataSource.transaction(async (manager) => {
      await manager.update(
        UserTargetEntity,
        {
          userId,
          targetStatus: 'active',
        },
        {
          targetStatus: 'archived',
        },
      );

      const entity = manager.create(UserTargetEntity, {
        userId,
        schoolId: payload.schoolId,
        departmentId: payload.departmentId ?? null,
        programId: payload.programId ?? null,
        targetScore: payload.targetScore ?? null,
        targetStatus: 'active',
        selectedAt: new Date(),
      });

      return manager.save(UserTargetEntity, entity);
    });
  }

  getCurrentStudyPlan(userId: string) {
    return this.studyPlansRepository.findOne({
      where: {
        userId,
        status: 'active',
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async archiveActiveStudyPlansForUser(userId: string) {
    await this.studyPlansRepository.update(
      {
        userId,
        status: 'active',
      },
      {
        status: 'archived',
      },
    );
  }

  findStudyPlanByIdForUser(studyPlanId: string, userId: string) {
    return this.studyPlansRepository.findOne({
      where: {
        id: studyPlanId,
        userId,
      },
      relations: {
        userTarget: true,
      },
    });
  }

  findWeeklyPlanByIdForUser(weeklyPlanId: string, userId: string) {
    return this.weeklyPlansRepository
      .createQueryBuilder('weeklyPlan')
      .leftJoinAndSelect('weeklyPlan.studyPlan', 'studyPlan')
      .where('weeklyPlan.id = :weeklyPlanId', { weeklyPlanId })
      .andWhere('studyPlan.userId = :userId', { userId })
      .getOne();
  }

  findDailyPlanByIdForUser(dailyPlanId: string, userId: string) {
    return this.dailyPlansRepository
      .createQueryBuilder('dailyPlan')
      .leftJoinAndSelect('dailyPlan.studyPlan', 'studyPlan')
      .where('dailyPlan.id = :dailyPlanId', { dailyPlanId })
      .andWhere('studyPlan.userId = :userId', { userId })
      .getOne();
  }

  getStudyPlanPhases(studyPlanId: string) {
    return this.studyPlanPhasesRepository.find({
      where: { studyPlanId },
      order: {
        sortOrder: 'ASC',
        startDate: 'ASC',
      },
    });
  }

  getWeeklyPlanByStudyPlanAndStartDate(
    studyPlanId: string,
    weekStartDate: string,
  ) {
    return this.weeklyPlansRepository.findOne({
      where: {
        studyPlanId,
        weekStartDate,
      },
    });
  }

  getCurrentWeeklyPlan(studyPlanId: string, today: string) {
    return this.weeklyPlansRepository
      .createQueryBuilder('weeklyPlan')
      .where('weeklyPlan.studyPlanId = :studyPlanId', { studyPlanId })
      .andWhere(
        ':today BETWEEN weeklyPlan.weekStartDate AND weeklyPlan.weekEndDate',
        {
          today,
        },
      )
      .orderBy('weeklyPlan.weekStartDate', 'DESC')
      .getOne();
  }

  getDailyPlansByWeeklyPlanId(weeklyPlanId: string) {
    return this.dailyPlansRepository.find({
      where: {
        weeklyPlanId,
      },
      order: {
        planDate: 'ASC',
      },
    });
  }

  getTodayPlan(studyPlanId: string, today: string) {
    return this.dailyPlansRepository.findOne({
      where: {
        studyPlanId,
        planDate: today,
      },
    });
  }

  getDailyPlanByStudyPlanAndDate(studyPlanId: string, date: string) {
    return this.dailyPlansRepository.findOne({
      where: {
        studyPlanId,
        planDate: date,
      },
    });
  }

  getTodosForPlanDate(userId: string, date: string, studyPlanId?: string) {
    const query = this.todoItemsRepository
      .createQueryBuilder('todo')
      .leftJoinAndSelect('todo.subject', 'subject')
      .where('todo.userId = :userId', { userId })
      .andWhere('todo.dueDate = :date', { date });

    if (studyPlanId) {
      query.andWhere(
        '(todo.studyPlanId = :studyPlanId OR todo.studyPlanId IS NULL)',
        {
          studyPlanId,
        },
      );
    }

    return query
      .orderBy('todo.sortOrder', 'ASC')
      .addOrderBy('todo.createdAt', 'ASC')
      .getMany();
  }

  saveWeeklyPlan(weeklyPlan: WeeklyPlanEntity) {
    return this.weeklyPlansRepository.save(weeklyPlan);
  }

  saveDailyPlan(dailyPlan: DailyPlanEntity) {
    return this.dailyPlansRepository.save(dailyPlan);
  }

  async createGeneratedStudyPlan(params: {
    userId: string;
    userTargetId: string;
    templateType: StudyPlanEntity['templateType'];
    title: string;
    startDate: string;
    endDate: string;
    totalExpectedHours: number | null;
    planSnapshot: Record<string, unknown>;
    phasePayloads: Array<{
      phaseType: StudyPlanPhaseEntity['phaseType'];
      title: string;
      startDate: string;
      endDate: string;
      focusSubjects: unknown[];
      goals: string | null;
      sortOrder: number;
    }>;
    weeklyPlanPayload: {
      phaseIndex: number | null;
      weekStartDate: string;
      weekEndDate: string;
      title: string;
      goals: string | null;
      expectedHours: number | null;
      status: WeeklyPlanEntity['status'];
    };
    dailyPlanPayloads: Array<{
      planDate: string;
      title: string;
      expectedHours: number | null;
      notes: string | null;
      status: DailyPlanEntity['status'];
    }>;
  }) {
    return this.dataSource.transaction(async (manager) => {
      await manager.update(
        StudyPlanEntity,
        {
          userId: params.userId,
          status: 'active',
        },
        {
          status: 'archived',
        },
      );

      const studyPlan = manager.create(StudyPlanEntity, {
        userId: params.userId,
        userTargetId: params.userTargetId,
        templateType: params.templateType,
        title: params.title,
        startDate: params.startDate,
        endDate: params.endDate,
        status: 'active',
        totalExpectedHours: params.totalExpectedHours,
        planSnapshot: params.planSnapshot,
      });
      const savedStudyPlan = await manager.save(StudyPlanEntity, studyPlan);

      const phaseEntities = params.phasePayloads.map((phasePayload) =>
        manager.create(StudyPlanPhaseEntity, {
          studyPlanId: savedStudyPlan.id,
          ...phasePayload,
        }),
      );
      const savedPhases = await manager.save(
        StudyPlanPhaseEntity,
        phaseEntities,
      );

      const weeklyPlan = manager.create(WeeklyPlanEntity, {
        studyPlanId: savedStudyPlan.id,
        phaseId:
          params.weeklyPlanPayload.phaseIndex === null
            ? null
            : (savedPhases[params.weeklyPlanPayload.phaseIndex]?.id ?? null),
        weekStartDate: params.weeklyPlanPayload.weekStartDate,
        weekEndDate: params.weeklyPlanPayload.weekEndDate,
        title: params.weeklyPlanPayload.title,
        goals: params.weeklyPlanPayload.goals,
        expectedHours: params.weeklyPlanPayload.expectedHours,
        status: params.weeklyPlanPayload.status,
      });
      const savedWeeklyPlan = await manager.save(WeeklyPlanEntity, weeklyPlan);

      const dailyPlanEntities = params.dailyPlanPayloads.map(
        (dailyPlanPayload) =>
          manager.create(DailyPlanEntity, {
            studyPlanId: savedStudyPlan.id,
            weeklyPlanId: savedWeeklyPlan.id,
            ...dailyPlanPayload,
          }),
      );
      const savedDailyPlans = await manager.save(
        DailyPlanEntity,
        dailyPlanEntities,
      );

      return {
        studyPlan: savedStudyPlan,
        phaseCount: savedPhases.length,
        weeklyPlanCount: 1,
        dailyPlanCount: savedDailyPlans.length,
      };
    });
  }
}
