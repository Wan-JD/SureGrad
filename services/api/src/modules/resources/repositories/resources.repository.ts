import { Injectable } from '@nestjs/common';
import { DataSource, SelectQueryBuilder } from 'typeorm';

export interface ResourceQueryParams {
  resourceType?:
    | 'course'
    | 'book'
    | 'past_exam'
    | 'public_resource'
    | 'article';
  subjectId?: string;
  stageTag?: 'foundation' | 'intensive' | 'final' | 'interview';
  isPublicLegal?: boolean;
  sortBy?: 'recommended' | 'updated_at' | 'created_at';
  sortOrder?: 'asc' | 'desc';
  page: number;
  pageSize: number;
}

export interface ResourceRecord {
  resourceId: string;
  title: string;
  resourceType: 'course' | 'book' | 'past_exam' | 'public_resource' | 'article';
  subjectId: string | null;
  subjectName: string | null;
  stageTag: 'foundation' | 'intensive' | 'final' | 'interview';
  providerName: string | null;
  summary: string | null;
  usageAdvice: string | null;
  sourceUrl: string;
  isPublicLegal: boolean;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class ResourcesRepository {
  constructor(private readonly dataSource: DataSource) {}

  async findSubjectById(subjectId: string): Promise<{ id: string } | null> {
    const row = await this.dataSource
      .createQueryBuilder()
      .from('subjects', 'subject')
      .select('subject.id', 'id')
      .where('subject.id = :subjectId', { subjectId })
      .getRawOne<{ id: string }>();

    return row ?? null;
  }

  async findResources(
    params: ResourceQueryParams,
  ): Promise<{ items: ResourceRecord[]; total: number }> {
    const filtered = this.applyResourceFilters(
      this.baseQuery().where('resource.status = :status', {
        status: 'active',
      }),
      params,
    );

    const countQuery = filtered.clone().select('COUNT(1)', 'total');
    const itemsQuery = filtered.clone();
    this.applySort(itemsQuery, params.sortBy, params.sortOrder);

    const items = await itemsQuery
      .offset((params.page - 1) * params.pageSize)
      .limit(params.pageSize)
      .getRawMany<ResourceRecord>();
    const totalRow = await countQuery.getRawOne<{ total: string }>();

    return {
      items,
      total: Number(totalRow?.total ?? 0),
    };
  }

  private applyResourceFilters(
    query: SelectQueryBuilder<any>,
    params: ResourceQueryParams,
  ) {
    if (params.resourceType) {
      query.andWhere('resource.resource_type = :resourceType', {
        resourceType: params.resourceType,
      });
    }

    if (params.subjectId) {
      query.andWhere('resource.subject_id = :subjectId', {
        subjectId: params.subjectId,
      });
    }

    if (params.stageTag) {
      query.andWhere('resource.stage_tag = :stageTag', {
        stageTag: params.stageTag,
      });
    }

    if (params.isPublicLegal !== undefined) {
      query.andWhere('resource.is_public_legal = :isPublicLegal', {
        isPublicLegal: params.isPublicLegal,
      });
    }

    return query;
  }

  async findResourceById(resourceId: string): Promise<ResourceRecord | null> {
    const row = await this.baseQuery()
      .where('resource.id = :resourceId', { resourceId })
      .andWhere('resource.status = :status', { status: 'active' })
      .andWhere('resource.is_public_legal = :isPublicLegal', {
        isPublicLegal: true,
      })
      .getRawOne<ResourceRecord>();

    return row ?? null;
  }

  private baseQuery() {
    return this.dataSource
      .createQueryBuilder()
      .from('study_resources', 'resource')
      .leftJoin('subjects', 'subject', 'subject.id = resource.subject_id')
      .select([
        'resource.id AS "resourceId"',
        'resource.title AS "title"',
        'resource.resource_type AS "resourceType"',
        'resource.subject_id AS "subjectId"',
        'subject.name AS "subjectName"',
        'resource.stage_tag AS "stageTag"',
        'resource.provider_name AS "providerName"',
        'resource.summary AS "summary"',
        'resource.usage_advice AS "usageAdvice"',
        'resource.source_url AS "sourceUrl"',
        'resource.is_public_legal AS "isPublicLegal"',
        'resource.created_at AS "createdAt"',
        'resource.updated_at AS "updatedAt"',
      ]);
  }

  private applySort(
    query: SelectQueryBuilder<any>,
    sortBy: ResourceQueryParams['sortBy'] = 'recommended',
    sortOrder: ResourceQueryParams['sortOrder'] = 'desc',
  ) {
    const direction = sortOrder.toUpperCase() as 'ASC' | 'DESC';

    switch (sortBy) {
      case 'created_at':
        query
          .orderBy('resource.created_at', direction)
          .addOrderBy('resource.updated_at', 'DESC')
          .addOrderBy('resource.title', 'ASC');
        break;
      case 'updated_at':
        query
          .orderBy('resource.updated_at', direction)
          .addOrderBy('resource.created_at', 'DESC')
          .addOrderBy('resource.title', 'ASC');
        break;
      case 'recommended':
      default:
        query
          .orderBy('resource.updated_at', 'DESC')
          .addOrderBy('resource.created_at', 'DESC')
          .addOrderBy('resource.title', 'ASC');
        break;
    }
  }
}
