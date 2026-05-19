import { ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { MockAuthGuard } from '../../common/auth/mock-auth.guard';
import { MockTokenService } from '../../common/auth/mock-token.service';
import { CheckinsService } from './checkins.service';
import {
  CheckinRangeRecord,
  CheckinsRepository,
  CurrentPlanRecord,
  CurrentTargetRecord,
  TodayCheckinRecord,
  TodoStatusSummary,
} from './repositories/checkins.repository';
import { StudyCheckinsController } from './study-checkins.controller';
import { StudyStatsController } from './study-stats.controller';

describe('CheckinsControllers', () => {
  type HttpServer = Parameters<typeof request>[0];
  type TodayCheckinBody = {
    checkinId: string | null;
    checkinDate: string;
    totalStudyMinutes: number | null;
    completedTodoCount: number;
    primarySubjectId: string | null;
    primarySubjectName: string | null;
    reflection: string | null;
    moodTag: string | null;
    isCheckedIn: boolean;
  };
  type OverviewBody = {
    todayStudyMinutes: number;
    weekStudyMinutes: number;
    continuousCheckinDays: number;
    todoCompletionRate: number;
    todayPendingTodoCount: number;
    currentTarget: CurrentTargetRecord | null;
    currentPlan: CurrentPlanRecord | null;
    subjectDistribution: Array<{
      subjectId: string | null;
      subjectName: string | null;
      studyMinutes: number;
      ratio: number;
    }>;
  };
  const getHttpServer = (app: { getHttpServer: () => unknown }): HttpServer =>
    app.getHttpServer() as HttpServer;

  const userId = '12121212-1212-1212-1212-121212121212';
  const subjectId = '34343434-3434-3434-3434-343434343434';

  const today = '2026-05-18';
  const weekCheckins: CheckinRangeRecord[] = [
    {
      checkinDate: '2026-05-18',
      totalStudyMinutes: 120,
      primarySubjectId: subjectId,
      primarySubjectName: '政治',
    },
    {
      checkinDate: '2026-05-17',
      totalStudyMinutes: 90,
      primarySubjectId: '56565656-5656-5656-5656-565656565656',
      primarySubjectName: '英语',
    },
  ];

  const todayCheckin: TodayCheckinRecord = {
    checkinId: '78787878-7878-7878-7878-787878787878',
    checkinDate: today,
    totalStudyMinutes: 120,
    completedTodoCount: 2,
    primarySubjectId: subjectId,
    primarySubjectName: '政治',
    reflection: '状态不错',
    moodTag: 'focused',
  };

  const currentTarget: CurrentTargetRecord = {
    userTargetId: '89898989-8989-8989-8989-898989898989',
    schoolId: '90909090-9090-9090-9090-909090909090',
    schoolName: '示例大学',
    departmentId: '91919191-9191-9191-9191-919191919191',
    departmentName: '计算机学院',
    programId: '92929292-9292-9292-9292-929292929292',
    programName: '计算机科学',
    targetScore: 390,
  };

  const currentPlan: CurrentPlanRecord = {
    studyPlanId: '93939393-9393-9393-9393-939393939393',
    title: '五月冲刺计划',
    templateType: 'standard',
    startDate: '2026-05-01',
    endDate: '2026-12-20',
    status: 'active',
    totalExpectedHours: 520,
  };

  const todoSummary: TodoStatusSummary = {
    completedCount: 2,
    pendingCount: 1,
  };

  const createRepositoryMock = ({
    todayRecord = todayCheckin,
    checkins = weekCheckins,
    completedTodosToday = 2,
    pendingTodosToday = 1,
    summary = todoSummary,
    target = currentTarget,
    plan = currentPlan,
  }: {
    todayRecord?: TodayCheckinRecord | null;
    checkins?: CheckinRangeRecord[];
    completedTodosToday?: number;
    pendingTodosToday?: number;
    summary?: TodoStatusSummary;
    target?: CurrentTargetRecord | null;
    plan?: CurrentPlanRecord | null;
  } = {}) =>
    ({
      findTodayCheckin: jest
        .fn<CheckinsRepository['findTodayCheckin']>()
        .mockImplementation(() => Promise.resolve(todayRecord)),
      countCompletedTodosByDate: jest
        .fn<CheckinsRepository['countCompletedTodosByDate']>()
        .mockImplementation(() => Promise.resolve(completedTodosToday)),
      countPendingTodosByDate: jest
        .fn<CheckinsRepository['countPendingTodosByDate']>()
        .mockImplementation(() => Promise.resolve(pendingTodosToday)),
      findCheckinsByDateRange: jest
        .fn<CheckinsRepository['findCheckinsByDateRange']>()
        .mockImplementation(() => Promise.resolve(checkins)),
      findCheckinDatesBeforeOrOn: jest
        .fn<CheckinsRepository['findCheckinDatesBeforeOrOn']>()
        .mockImplementation(() =>
          Promise.resolve(
            checkins
              .map((item) => item.checkinDate)
              .sort()
              .reverse(),
          ),
        ),
      getTodoStatusSummary: jest
        .fn<CheckinsRepository['getTodoStatusSummary']>()
        .mockImplementation(() => Promise.resolve(summary)),
      getCurrentTarget: jest
        .fn<CheckinsRepository['getCurrentTarget']>()
        .mockImplementation(() => Promise.resolve(target)),
      getCurrentPlan: jest
        .fn<CheckinsRepository['getCurrentPlan']>()
        .mockImplementation(() => Promise.resolve(plan)),
    }) as unknown as jest.Mocked<CheckinsRepository>;

  const createApp = async (repository = createRepositoryMock()) => {
    const moduleRef = await Test.createTestingModule({
      controllers: [StudyCheckinsController, StudyStatsController],
      providers: [
        CheckinsService,
        MockTokenService,
        MockAuthGuard,
        {
          provide: CheckinsRepository,
          useValue: repository,
        },
      ],
    }).compile();

    const app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );
    await app.init();

    return { app, tokenService: moduleRef.get(MockTokenService) };
  };

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-05-18T12:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('requires auth for today checkins', async () => {
    const { app } = await createApp();

    await request(getHttpServer(app))
      .get('/api/v1/study-checkins/today')
      .expect(401);

    await app.close();
  });

  it('returns today defaults when no checkin exists', async () => {
    const { app, tokenService } = await createApp(
      createRepositoryMock({
        todayRecord: null,
        checkins: [],
        completedTodosToday: 1,
        pendingTodosToday: 3,
        summary: {
          completedCount: 1,
          pendingCount: 3,
        },
        target: null,
        plan: null,
      }),
    );
    const token = tokenService.createToken(userId, 'access');

    await request(getHttpServer(app))
      .get('/api/v1/study-checkins/today')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect(({ body }: { body: TodayCheckinBody }) => {
        expect(body).toEqual({
          checkinId: null,
          checkinDate: today,
          totalStudyMinutes: null,
          completedTodoCount: 1,
          primarySubjectId: null,
          primarySubjectName: null,
          reflection: null,
          moodTag: null,
          isCheckedIn: false,
        });
      });

    await app.close();
  });

  it('returns today checkin data', async () => {
    const { app, tokenService } = await createApp();
    const token = tokenService.createToken(userId, 'access');

    await request(getHttpServer(app))
      .get('/api/v1/study-checkins/today')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect(({ body }: { body: TodayCheckinBody }) => {
        expect(body).toMatchObject({
          checkinId: todayCheckin.checkinId,
          checkinDate: today,
          totalStudyMinutes: 120,
          completedTodoCount: 2,
          primarySubjectName: '政治',
          isCheckedIn: true,
        });
      });

    await app.close();
  });

  it('requires auth for study overview', async () => {
    const { app } = await createApp();

    await request(getHttpServer(app))
      .get('/api/v1/study-stats/overview')
      .expect(401);

    await app.close();
  });

  it('returns study overview aggregates', async () => {
    const { app, tokenService } = await createApp();
    const token = tokenService.createToken(userId, 'access');

    await request(getHttpServer(app))
      .get('/api/v1/study-stats/overview')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect(({ body }: { body: OverviewBody }) => {
        expect(body).toMatchObject({
          todayStudyMinutes: 120,
          weekStudyMinutes: 210,
          continuousCheckinDays: 2,
          todoCompletionRate: 0.6667,
          todayPendingTodoCount: 1,
          currentTarget,
          currentPlan,
        });
        expect(body.subjectDistribution).toEqual([
          {
            subjectId,
            subjectName: '政治',
            studyMinutes: 120,
            ratio: 0.5714,
          },
          {
            subjectId: '56565656-5656-5656-5656-565656565656',
            subjectName: '英语',
            studyMinutes: 90,
            ratio: 0.4286,
          },
        ]);
      });

    await app.close();
  });

  it('rejects unsupported overview ranges', async () => {
    const { app, tokenService } = await createApp();
    const token = tokenService.createToken(userId, 'access');

    await request(getHttpServer(app))
      .get('/api/v1/study-stats/overview?range=month')
      .set('Authorization', `Bearer ${token}`)
      .expect(400);

    await app.close();
  });
});
