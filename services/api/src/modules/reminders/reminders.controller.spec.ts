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
      isEnabled: boolean;
    }>;
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      hasMore: boolean;
    };
  };
  type ReminderUpdateBody = {
    reminderId: string;
    isEnabled: boolean;
  };
  type ReminderCreateBody = {
    reminderId: string;
    reminderType: 'study' | 'todo';
    remindAt: string;
    isEnabled: boolean;
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
      remindAt: '2027-05-19T08:00:00.000Z',
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
      remindAt: '2027-05-18T12:00:00.000Z',
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
      remindAt: '2027-05-18T13:00:00.000Z',
      isEnabled: true,
      isSystemDefault: false,
      relatedTargetType: 'todo',
      relatedTargetId: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
      createdAt: '2026-05-03T08:00:00.000Z',
    },
  ];

  const createRepositoryMock = (items: ReminderRecord[] = reminders) => {
    const mutableItems = items.map((item) => ({ ...item }));

    return {
      findReminders: jest
        .fn<RemindersRepository['findReminders']>()
        .mockImplementation(
          (params: Parameters<RemindersRepository['findReminders']>[0]) => {
            const filtered = mutableItems
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
      findReminderByIdForUser: jest
        .fn<RemindersRepository['findReminderByIdForUser']>()
        .mockImplementation((reminderId: string, ownerId: string) =>
          Promise.resolve(
            mutableItems.find(
              (item) =>
                item.reminderId === reminderId && item.userId === ownerId,
            ) ?? null,
          ),
        ),
      updateReminderEnabled: jest
        .fn<RemindersRepository['updateReminderEnabled']>()
        .mockImplementation(
          (
            params: Parameters<RemindersRepository['updateReminderEnabled']>[0],
          ) => {
            const index = mutableItems.findIndex(
              (item) =>
                item.reminderId === params.reminderId &&
                item.userId === params.userId,
            );
            if (index >= 0) {
              mutableItems[index] = {
                ...mutableItems[index],
                isEnabled: params.isEnabled,
              };
            }
            return Promise.resolve();
          },
        ),
      findReminderByTypeAndRemindAt: jest
        .fn<RemindersRepository['findReminderByTypeAndRemindAt']>()
        .mockImplementation(
          (ownerId: string, reminderType: 'study' | 'todo', remindAt: string) =>
            Promise.resolve(
              mutableItems.find(
                (item) =>
                  item.userId === ownerId &&
                  item.reminderType === reminderType &&
                  item.remindAt === remindAt,
              ) ?? null,
            ),
        ),
      createReminder: jest
        .fn<RemindersRepository['createReminder']>()
        .mockImplementation(
          (params: Parameters<RemindersRepository['createReminder']>[0]) => {
            mutableItems.push({
              reminderId: params.reminderId,
              userId: params.userId,
              reminderType: params.reminderType,
              title: params.title,
              content: params.content,
              remindAt: params.remindAt,
              isEnabled: params.isEnabled,
              isSystemDefault: false,
              relatedTargetType: params.relatedTargetType,
              relatedTargetId: params.relatedTargetId,
              createdAt: new Date().toISOString(),
            });

            return Promise.resolve({
              reminderId: params.reminderId,
              reminderType: params.reminderType,
              remindAt: params.remindAt,
              isEnabled: params.isEnabled,
            });
          },
        ),
      deleteReminder: jest
        .fn<RemindersRepository['deleteReminder']>()
        .mockImplementation(
          (params: Parameters<RemindersRepository['deleteReminder']>[0]) => {
            const index = mutableItems.findIndex(
              (item) =>
                item.reminderId === params.reminderId &&
                item.userId === params.userId,
            );
            if (index >= 0) {
              mutableItems.splice(index, 1);
            }
            return Promise.resolve();
          },
        ),
    } as unknown as jest.Mocked<RemindersRepository>;
  };

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
          isEnabled: true,
        });
        expect(body.items[1]).toMatchObject({
          reminderId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
          reminderType: 'system',
          isEnabled: true,
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

  it('updates reminder enabled state for the current user', async () => {
    const repository = createRepositoryMock();
    const { app, tokenService } = await createApp(repository);
    const token = tokenService.createToken(userId, 'access');

    await request(getHttpServer(app))
      .patch('/api/v1/reminders/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb')
      .set('Authorization', `Bearer ${token}`)
      .send({ isEnabled: false })
      .expect(200)
      .expect(({ body }: { body: ReminderUpdateBody }) => {
        expect(body).toMatchObject({
          reminderId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
          isEnabled: false,
        });
      });

    expect(repository.updateReminderEnabled.mock.calls).toContainEqual([
      {
        userId,
        reminderId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        isEnabled: false,
      },
    ]);

    await app.close();
  });

  it('rejects reminder update without supported fields', async () => {
    const { app, tokenService } = await createApp();
    const token = tokenService.createToken(userId, 'access');

    await request(getHttpServer(app))
      .patch('/api/v1/reminders/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb')
      .set('Authorization', `Bearer ${token}`)
      .send({})
      .expect(400);

    await app.close();
  });

  it('creates a custom reminder for the current user', async () => {
    const repository = createRepositoryMock();
    const { app, tokenService } = await createApp(repository);
    const token = tokenService.createToken(userId, 'access');

    await request(getHttpServer(app))
      .post('/api/v1/reminders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        reminderType: 'todo',
        title: ' 晨间背诵 ',
        content: '背 50 个单词',
        remindAt: '2027-06-01T08:00:00.000Z',
        isEnabled: true,
      })
      .expect(201)
      .expect(({ body }: { body: ReminderCreateBody }) => {
        expect(body).toMatchObject({
          reminderType: 'todo',
          remindAt: '2027-06-01T08:00:00.000Z',
          isEnabled: true,
        });
        expect(body.reminderId).toEqual(expect.any(String));
      });

    expect(repository.createReminder.mock.calls).toHaveLength(1);

    await app.close();
  });

  it('rejects reminder creation with a past remind time', async () => {
    const { app, tokenService } = await createApp();
    const token = tokenService.createToken(userId, 'access');

    await request(getHttpServer(app))
      .post('/api/v1/reminders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        reminderType: 'study',
        title: '过期提醒',
        content: '不应创建',
        remindAt: '2020-01-01T08:00:00.000Z',
      })
      .expect(400);

    await app.close();
  });

  it('rejects duplicate reminders at the same type and time', async () => {
    const { app, tokenService } = await createApp();
    const token = tokenService.createToken(userId, 'access');

    await request(getHttpServer(app))
      .post('/api/v1/reminders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        reminderType: 'study',
        title: '重复提醒',
        content: '与已有记录冲突',
        remindAt: '2027-05-18T12:00:00.000Z',
      })
      .expect(409);

    await app.close();
  });

  it('deletes a custom reminder for the current user', async () => {
    const repository = createRepositoryMock();
    const { app, tokenService } = await createApp(repository);
    const token = tokenService.createToken(userId, 'access');

    await request(getHttpServer(app))
      .delete('/api/v1/reminders/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb')
      .set('Authorization', `Bearer ${token}`)
      .expect(204);

    expect(repository.deleteReminder.mock.calls).toContainEqual([
      {
        userId,
        reminderId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      },
    ]);

    await app.close();
  });

  it('rejects deleting a system default reminder', async () => {
    const { app, tokenService } = await createApp();
    const token = tokenService.createToken(userId, 'access');

    await request(getHttpServer(app))
      .delete('/api/v1/reminders/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);

    await app.close();
  });

  it('returns not found when deleting a missing reminder', async () => {
    const { app, tokenService } = await createApp();
    const token = tokenService.createToken(userId, 'access');

    await request(getHttpServer(app))
      .delete('/api/v1/reminders/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${token}`)
      .expect(404);

    await app.close();
  });
});
