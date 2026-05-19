import { ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { ResourcesController } from './resources.controller';
import { ResourcesService } from './resources.service';
import {
  ResourceRecord,
  ResourcesRepository,
} from './repositories/resources.repository';

describe('ResourcesController', () => {
  type HttpServer = Parameters<typeof request>[0];
  type ResourceListBody = {
    items: Array<{
      resourceId: string;
      isPublicLegal: boolean;
      isFavorited: boolean;
    }>;
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      hasMore: boolean;
    };
  };
  type ResourceDetailBody = {
    resourceId: string;
    title: string;
    usageAdvice: string | null;
    isFavorited: boolean;
  };
  const getHttpServer = (app: { getHttpServer: () => unknown }): HttpServer =>
    app.getHttpServer() as HttpServer;

  const subjectId = '11111111-1111-1111-1111-111111111111';
  const visibleResourceId = '22222222-2222-2222-2222-222222222222';
  const hiddenResourceId = '33333333-3333-3333-3333-333333333333';
  const detailResourceId = '44444444-4444-4444-4444-444444444444';

  const records: ResourceRecord[] = [
    {
      resourceId: visibleResourceId,
      title: '政治冲刺课',
      resourceType: 'course',
      subjectId,
      subjectName: '政治',
      stageTag: 'final',
      providerName: 'SureGrad',
      summary: '真题串讲',
      usageAdvice: '最后两周集中刷',
      sourceUrl: 'https://example.com/resource-1',
      isPublicLegal: true,
      createdAt: '2026-05-10T09:00:00.000Z',
      updatedAt: '2026-05-18T09:00:00.000Z',
    },
    {
      resourceId: hiddenResourceId,
      title: '来源不合规资料',
      resourceType: 'course',
      subjectId,
      subjectName: '政治',
      stageTag: 'final',
      providerName: 'Elsewhere',
      summary: '不应默认返回',
      usageAdvice: null,
      sourceUrl: 'https://example.com/resource-2',
      isPublicLegal: false,
      createdAt: '2026-05-18T09:30:00.000Z',
      updatedAt: '2026-05-18T09:30:00.000Z',
    },
    {
      resourceId: detailResourceId,
      title: '英语基础词汇书',
      resourceType: 'book',
      subjectId: null,
      subjectName: null,
      stageTag: 'foundation',
      providerName: 'Open Press',
      summary: '打底用',
      usageAdvice: '每天 30 分钟',
      sourceUrl: 'https://example.com/resource-3',
      isPublicLegal: true,
      createdAt: '2026-04-10T09:00:00.000Z',
      updatedAt: '2026-04-11T09:00:00.000Z',
    },
  ];

  const createRepositoryMock = (items: ResourceRecord[] = records) =>
    ({
      findSubjectById: jest
        .fn<ResourcesRepository['findSubjectById']>()
        .mockImplementation(
          (id: Parameters<ResourcesRepository['findSubjectById']>[0]) =>
            Promise.resolve(id === subjectId ? { id } : null),
        ),
      findResources: jest
        .fn<ResourcesRepository['findResources']>()
        .mockImplementation(
          (params: Parameters<ResourcesRepository['findResources']>[0]) => {
            const filtered = items
              .filter((item) =>
                params.isPublicLegal === undefined
                  ? true
                  : item.isPublicLegal === params.isPublicLegal,
              )
              .filter((item) =>
                params.resourceType
                  ? item.resourceType === params.resourceType
                  : true,
              )
              .filter((item) =>
                params.subjectId ? item.subjectId === params.subjectId : true,
              )
              .filter((item) =>
                params.stageTag ? item.stageTag === params.stageTag : true,
              )
              .sort((left, right) =>
                right.updatedAt.localeCompare(left.updatedAt),
              );

            const start = (params.page - 1) * params.pageSize;
            return Promise.resolve({
              items: filtered.slice(start, start + params.pageSize),
              total: filtered.length,
            });
          },
        ),
      findResourceById: jest
        .fn<ResourcesRepository['findResourceById']>()
        .mockImplementation(
          (
            resourceId: Parameters<ResourcesRepository['findResourceById']>[0],
          ) => {
            const item = items.find(
              (candidate) => candidate.resourceId === resourceId,
            );
            if (!item || !item.isPublicLegal) {
              return Promise.resolve(null);
            }

            return Promise.resolve(item);
          },
        ),
    }) as unknown as jest.Mocked<ResourcesRepository>;

  const createApp = async (repository = createRepositoryMock()) => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ResourcesController],
      providers: [
        ResourcesService,
        {
          provide: ResourcesRepository,
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

    return { app, repository };
  };

  it('returns an empty resource list', async () => {
    const { app } = await createApp(createRepositoryMock([]));

    await request(getHttpServer(app))
      .get('/api/v1/study-resources')
      .expect(200)
      .expect(({ body }: { body: ResourceListBody }) => {
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

  it('returns public legal resources by default with recommended ordering', async () => {
    const { app } = await createApp();

    await request(getHttpServer(app))
      .get('/api/v1/study-resources')
      .expect(200)
      .expect(({ body }: { body: ResourceListBody }) => {
        expect(body.items).toHaveLength(2);
        expect(body.items[0]).toMatchObject({
          resourceId: visibleResourceId,
          isPublicLegal: true,
          isFavorited: false,
        });
        expect(
          body.items.map((item: { resourceId: string }) => item.resourceId),
        ).toEqual([visibleResourceId, detailResourceId]);
      });

    await app.close();
  });

  it('returns resource detail', async () => {
    const { app } = await createApp();

    await request(getHttpServer(app))
      .get(`/api/v1/study-resources/${detailResourceId}`)
      .expect(200)
      .expect(({ body }: { body: ResourceDetailBody }) => {
        expect(body).toMatchObject({
          resourceId: detailResourceId,
          title: '英语基础词汇书',
          usageAdvice: '每天 30 分钟',
          isFavorited: false,
        });
      });

    await app.close();
  });

  it('rejects invalid resource ids', async () => {
    const { app } = await createApp();

    await request(getHttpServer(app))
      .get('/api/v1/study-resources/not-a-uuid')
      .expect(400);

    await app.close();
  });

  it('returns 404 for unknown resources', async () => {
    const { app } = await createApp();

    await request(getHttpServer(app))
      .get('/api/v1/study-resources/55555555-5555-5555-5555-555555555555')
      .expect(404);

    await app.close();
  });
});
