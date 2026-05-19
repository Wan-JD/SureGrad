import { ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { MockAuthGuard } from '../../common/auth/mock-auth.guard';
import { MockTokenService } from '../../common/auth/mock-token.service';
import { RemindersController } from './reminders.controller';
import { RemindersService } from './reminders.service';
import {
  ReminderRecord,
  RemindersRepository,
} from './repositories/reminders.repository';

describe('RemindersController', () => {
  type HttpServer = Parameters<typeof request>[0];
  type ReminderListBody = {
    items: Array<{
      reminderId: string;
      reminderType: ReminderRecord['reminderType'];
    }>;
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      hasMore: boolean;
    };
  };
  const getHttpServer = (app: { getHttpServer: () => unknown }): HttpServer =>
    app.getHttpServer() as HttpServer;

  const userId = '99999999-9999-9999-9999-999999999999';

  const reminders: ReminderRecord[] = [
    {
      reminderId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      userId,
      reminderType: 'system',
      title: '系统节点',
      content: '报名快截止了',
      remindAt: '2026-05-19T08:00:00.000Z',
      isEnabled: true,
      isSystemDefault: true,
      relatedTargetType: null,
      relatedTargetId: null,
      createdAt: '2026-05-01T08:00:00.000Z',
    },
    {
      reminderId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      userId,
      reminderType: 'study',
      title: '晚间复盘',
      content: '记得整理错题',
      remindAt: '2026-05-18T12:00:00.000Z',
      isEnabled: true,
      isSystemDefault: false,
      relatedTargetType: 'plan',
      relatedTargetId: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
      createdAt: '2026-05-02T08:00:00.000Z',
    },
    {
      reminderId: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
      userId: 'other-user',
      reminderType: 'todo',
      title: '别人提醒',
      content: '不该返回',
      remindAt: '2026-05-18T13:00:00.000Z',
      isEnabled: true,
      isSystemDefault: false,
      relatedTargetType: 'todo',
      relatedTargetId: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
      createdAt: '2026-05-03T08:00:00.000Z',
    },
  ];

  const createRepositoryMock = (items: ReminderRecord[] = reminders) =>
    ({
      findReminders: jest
        .fn<RemindersRepository['findReminders']>()
        .mockImplementation(
          (params: Parameters<RemindersRepository['findReminders']>[0]) => {
            const filtered = items
              .filter((item) => item.userId === params.userId)
              .filter((item) =>
                params.reminderType
                  ? item.reminderType === params.reminderType
                  : true,
              )
              .filter((item) =>
                params.isEnabled === undefined
                  ? true
                  : item.isEnabled === params.isEnabled,
              )
              .filter((item) =>
                params.dateFrom ? item.remindAt >= params.dateFrom : true,
              )
              .filter((item) =>
                params.dateTo ? item.remindAt <= params.dateTo : true,
              )
              .sort((left, right) =>
                left.remindAt.localeCompare(right.remindAt),
              );

            const start = (params.page - 1) * params.pageSize;
            return Promise.resolve({
              items: filtered.slice(start, start + params.pageSize),
              total: filtered.length,
            });
          },
        ),
    }) as unknown as jest.Mocked<RemindersRepository>;

  const createApp = async (repository = createRepositoryMock()) => {
    const moduleRef = await Test.createTestingModule({
      controllers: [RemindersController],
      providers: [
        RemindersService,
        MockTokenService,
        MockAuthGuard,
        {
          provide: RemindersRepository,
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

  it('requires auth to read reminders', async () => {
    const { app } = await createApp();

    await request(getHttpServer(app)).get('/api/v1/reminders').expect(401);

    await app.close();
  });

  it('returns an empty reminder list', async () => {
    const { app, tokenService } = await createApp(createRepositoryMock([]));
    const token = tokenService.createToken(userId, 'access');

    await request(getHttpServer(app))
      .get('/api/v1/reminders')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect(({ body }: { body: ReminderListBody }) => {
        expect(body).toEqual({
          items: [],
          pagination: {
            page: 1,
            pageSize: 20,
            total: 0,
            hasMore: false,
          },
        });
      });

    await app.close();
  });

  it('returns the current user reminder list', async () => {
    const { app, tokenService } = await createApp();
    const token = tokenService.createToken(userId, 'access');

    await request(getHttpServer(app))
      .get('/api/v1/reminders?isEnabled=true')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect(({ body }: { body: ReminderListBody }) => {
        expect(body.items).toHaveLength(2);
        expect(body.items[0]).toMatchObject({
          reminderId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
          reminderType: 'study',
        });
        expect(body.items[1]).toMatchObject({
          reminderId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
          reminderType: 'system',
        });
      });

    await app.close();
  });

  it('rejects invalid reminder query windows', async () => {
    const { app, tokenService } = await createApp();
    const token = tokenService.createToken(userId, 'access');

    await request(getHttpServer(app))
      .get(
        '/api/v1/reminders?dateFrom=2026-05-20T00:00:00.000Z&dateTo=2026-05-18T00:00:00.000Z',
      )
      .set('Authorization', `Bearer ${token}`)
      .expect(400);

    await app.close();
  });
});
