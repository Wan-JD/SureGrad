import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PlansRepository } from './repositories/plans.repository';
import { PlansService } from './plans.service';

describe('PlansService', () => {
  const createPlansRepositoryMock = () =>
    ({
      getCurrentTarget: jest.fn(),
      findSchoolById: jest.fn(),
      findDepartmentById: jest.fn(),
      findProgramById: jest.fn(),
      replaceCurrentTarget: jest.fn(),
      findUserProfileByUserId: jest.fn(),
      getCurrentStudyPlan: jest.fn(),
      createGeneratedStudyPlan: jest.fn(),
      getStudyPlanPhases: jest.fn(),
      getCurrentWeeklyPlan: jest.fn(),
      getTodayPlan: jest.fn(),
      findStudyPlanByIdForUser: jest.fn(),
      getWeeklyPlanByStudyPlanAndStartDate: jest.fn(),
      getDailyPlansByWeeklyPlanId: jest.fn(),
      getDailyPlanByStudyPlanAndDate: jest.fn(),
      getTodosForPlanDate: jest.fn(),
      findWeeklyPlanByIdForUser: jest.fn(),
      saveWeeklyPlan: jest.fn(),
      findDailyPlanByIdForUser: jest.fn(),
      saveDailyPlan: jest.fn(),
    }) as unknown as jest.Mocked<PlansRepository>;

  it('returns null fields when there is no active target', async () => {
    const plansRepository = createPlansRepositoryMock();
    plansRepository.getCurrentTarget = jest.fn().mockResolvedValue(null);

    const service = new PlansService(plansRepository);
    await expect(service.getCurrentTarget('user-1')).resolves.toEqual({
      userTargetId: null,
      schoolId: null,
      departmentId: null,
      programId: null,
      targetScore: null,
      targetStatus: null,
      selectedAt: null,
    });
  });

  it('updates the current target', async () => {
    const plansRepository = createPlansRepositoryMock();
    plansRepository.findSchoolById = jest.fn().mockResolvedValue({
      id: 'school-1',
      name: 'Test University',
    });
    plansRepository.findDepartmentById = jest.fn().mockResolvedValue({
      id: 'dept-1',
      schoolId: 'school-1',
      name: 'Engineering',
    });
    plansRepository.findProgramById = jest.fn().mockResolvedValue({
      id: 'program-1',
      schoolId: 'school-1',
      departmentId: 'dept-1',
      name: 'Computer Science',
    });
    plansRepository.replaceCurrentTarget = jest.fn().mockResolvedValue({
      id: 'target-1',
      targetStatus: 'active',
      selectedAt: new Date('2026-05-17T09:00:00.000Z'),
    });

    const service = new PlansService(plansRepository);
    const result = await service.updateCurrentTarget('user-1', {
      schoolId: 'school-1',
      departmentId: 'dept-1',
      programId: 'program-1',
      targetScore: 380,
    });

    expect(result).toMatchObject({
      userTargetId: 'target-1',
      targetSummary: {
        schoolName: 'Test University',
        departmentName: 'Engineering',
        programName: 'Computer Science',
      },
    });
  });

  it('generates a current-week plan', async () => {
    const plansRepository = createPlansRepositoryMock();
    plansRepository.findUserProfileByUserId = jest.fn().mockResolvedValue({
      examYear: 2027,
      identityType: 'fresh',
      intendedDiscipline: 'AI',
      dailyStudyHours: 5.5,
      examMathRequired: true,
      onboardingCompleted: true,
    });
    plansRepository.getCurrentTarget = jest.fn().mockResolvedValue({
      id: 'target-1',
      schoolId: 'school-1',
      departmentId: 'dept-1',
      programId: 'program-1',
      targetScore: 390,
      school: { name: 'Test University' },
      department: { name: 'Engineering' },
      program: { name: 'Computer Science' },
    });
    plansRepository.getCurrentStudyPlan = jest.fn().mockResolvedValue(null);
    plansRepository.createGeneratedStudyPlan = jest.fn().mockResolvedValue({
      studyPlan: {
        id: 'plan-1',
        templateType: 'standard',
        status: 'active',
      },
      phaseCount: 4,
      weeklyPlanCount: 1,
      dailyPlanCount: 7,
    });

    const service = new PlansService(plansRepository);
    const result = await service.generateStudyPlan('user-1', {
      templateType: 'standard',
      startDate: '2026-05-01',
      endDate: '2026-12-20',
    });

    expect(result).toEqual({
      studyPlanId: 'plan-1',
      templateType: 'standard',
      status: 'active',
      phaseCount: 4,
      weeklyPlanCount: 1,
      dailyPlanCount: 7,
    });
    expect(plansRepository.createGeneratedStudyPlan.mock.calls).toHaveLength(1);
  });

  it('rejects plan generation when an active plan exists without force', async () => {
    const plansRepository = createPlansRepositoryMock();
    plansRepository.findUserProfileByUserId = jest.fn().mockResolvedValue({
      onboardingCompleted: true,
    });
    plansRepository.getCurrentTarget = jest.fn().mockResolvedValue({
      id: 'target-1',
    });
    plansRepository.getCurrentStudyPlan = jest.fn().mockResolvedValue({
      id: 'plan-1',
    });

    const service = new PlansService(plansRepository);

    await expect(
      service.generateStudyPlan('user-1', {
        templateType: 'standard',
        startDate: '2026-05-01',
        endDate: '2026-12-20',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('returns the active study plan aggregate', async () => {
    const plansRepository = createPlansRepositoryMock();
    plansRepository.getCurrentStudyPlan = jest.fn().mockResolvedValue({
      id: 'plan-1',
      title: 'Sprint Plan',
      templateType: 'standard',
      startDate: '2026-05-01',
      endDate: '2026-12-20',
      status: 'active',
      totalExpectedHours: 520,
    });
    plansRepository.getStudyPlanPhases = jest.fn().mockResolvedValue([
      {
        id: 'phase-1',
        phaseType: 'foundation',
        title: 'Foundation',
        startDate: '2026-05-01',
        endDate: '2026-07-31',
        goals: 'Build the base',
        focusSubjects: ['math'],
      },
    ]);
    plansRepository.getCurrentWeeklyPlan = jest.fn().mockResolvedValue({
      id: 'week-1',
      weekStartDate: '2026-05-11',
      weekEndDate: '2026-05-17',
      title: 'Current Week',
      goals: 'Finish exercises',
      expectedHours: 42,
      status: 'active',
    });
    plansRepository.getTodayPlan = jest.fn().mockResolvedValue({
      id: 'day-1',
      planDate: '2026-05-17',
      title: 'Today',
      expectedHours: 6,
      notes: 'Read English passages',
      status: 'active',
    });

    const service = new PlansService(plansRepository);
    const result = await service.getCurrentStudyPlan('user-1');

    expect(result).toMatchObject({
      studyPlanId: 'plan-1',
      title: 'Sprint Plan',
      phases: [
        {
          studyPlanPhaseId: 'phase-1',
          phaseType: 'foundation',
        },
      ],
      currentWeek: {
        weeklyPlanId: 'week-1',
      },
      todayPlan: {
        dailyPlanId: 'day-1',
      },
    });
  });

  it('returns and updates weekly plans', async () => {
    const plansRepository = createPlansRepositoryMock();
    plansRepository.getCurrentStudyPlan = jest.fn().mockResolvedValue({
      id: 'plan-1',
      startDate: '2026-05-01',
      endDate: '2026-12-20',
    });
    plansRepository.getWeeklyPlanByStudyPlanAndStartDate = jest
      .fn()
      .mockResolvedValue({
        id: 'week-1',
        studyPlanId: 'plan-1',
        phaseId: 'phase-1',
        title: 'Current Week',
        weekStartDate: '2026-05-11',
        weekEndDate: '2026-05-17',
        goals: 'Finish exercises',
        expectedHours: 42,
        status: 'active',
      });
    plansRepository.getDailyPlansByWeeklyPlanId = jest.fn().mockResolvedValue([
      {
        id: 'day-1',
        planDate: '2026-05-17',
        title: 'Today',
        expectedHours: 6,
        status: 'active',
      },
    ]);
    plansRepository.findWeeklyPlanByIdForUser = jest.fn().mockResolvedValue({
      id: 'week-1',
      studyPlanId: 'plan-1',
      phaseId: 'phase-1',
      title: 'Current Week',
      weekStartDate: '2026-05-11',
      weekEndDate: '2026-05-17',
      goals: 'Finish exercises',
      expectedHours: 42,
      status: 'active',
    });
    plansRepository.saveWeeklyPlan = jest
      .fn()
      .mockImplementation(
        (value: Parameters<PlansRepository['saveWeeklyPlan']>[0]) =>
          Promise.resolve(value),
      );

    const service = new PlansService(plansRepository);
    const weeklyPlan = await service.getWeeklyPlans('user-1', {});
    const updatedWeeklyPlan = await service.updateWeeklyPlan(
      'user-1',
      'week-1',
      {
        title: 'Updated Week',
        expectedHours: 40,
      },
    );

    expect(weeklyPlan).toMatchObject({
      weeklyPlanId: 'week-1',
      dailyPlans: [
        {
          dailyPlanId: 'day-1',
        },
      ],
    });
    expect(updatedWeeklyPlan).toMatchObject({
      title: 'Updated Week',
      expectedHours: 40,
    });
  });

  it('returns empty daily plan fields and updates daily plans', async () => {
    const plansRepository = createPlansRepositoryMock();
    plansRepository.getCurrentStudyPlan = jest.fn().mockResolvedValue({
      id: 'plan-1',
      startDate: '2026-05-01',
      endDate: '2026-12-20',
    });
    plansRepository.getDailyPlanByStudyPlanAndDate = jest
      .fn()
      .mockResolvedValue(null);
    plansRepository.getTodosForPlanDate = jest.fn().mockResolvedValue([
      {
        id: 'todo-1',
        subjectId: null,
        subject: null,
        title: 'Review notes',
        description: null,
        dueDate: '2026-05-17',
        expectedMinutes: 45,
        priority: 'medium',
        sourceType: 'manual',
        status: 'pending',
        completedAt: null,
      },
    ]);
    plansRepository.findDailyPlanByIdForUser = jest.fn().mockResolvedValue({
      id: 'day-1',
      studyPlanId: 'plan-1',
      weeklyPlanId: 'week-1',
      planDate: '2026-05-17',
      title: 'Today',
      expectedHours: 6,
      notes: 'Read',
      status: 'active',
    });
    plansRepository.saveDailyPlan = jest
      .fn()
      .mockImplementation(
        (value: Parameters<PlansRepository['saveDailyPlan']>[0]) =>
          Promise.resolve(value),
      );

    const service = new PlansService(plansRepository);
    const dailyPlan = await service.getDailyPlan('user-1', {
      date: '2026-05-17',
    });
    const updatedDailyPlan = await service.updateDailyPlan('user-1', 'day-1', {
      title: 'Updated Day',
      expectedHours: 5.5,
      notes: 'Rewrite notes',
    });

    expect(dailyPlan).toMatchObject({
      dailyPlanId: null,
      studyPlanId: 'plan-1',
      planDate: '2026-05-17',
      todos: [
        {
          todoItemId: 'todo-1',
        },
      ],
    });
    expect(updatedDailyPlan).toMatchObject({
      dailyPlanId: 'day-1',
      title: 'Updated Day',
      expectedHours: 5.5,
    });
  });

  it('throws when the requested study plan is missing', async () => {
    const plansRepository = createPlansRepositoryMock();
    plansRepository.findStudyPlanByIdForUser = jest
      .fn()
      .mockResolvedValue(null);

    const service = new PlansService(plansRepository);

    await expect(
      service.getWeeklyPlans('user-1', {
        studyPlanId: 'missing-plan',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects invalid target-program relationships', async () => {
    const plansRepository = createPlansRepositoryMock();
    plansRepository.findSchoolById = jest.fn().mockResolvedValue({
      id: 'school-1',
      name: 'Test University',
    });
    plansRepository.findProgramById = jest.fn().mockResolvedValue({
      id: 'program-1',
      schoolId: 'other-school',
      departmentId: 'dept-1',
      name: 'Computer Science',
    });

    const service = new PlansService(plansRepository);

    await expect(
      service.updateCurrentTarget('user-1', {
        schoolId: 'school-1',
        programId: 'program-1',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
