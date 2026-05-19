import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { QueryResourcesDto } from './dto/query-resources.dto';
import { ResourcesRepository } from './repositories/resources.repository';

@Injectable()
export class ResourcesService {
  constructor(private readonly resourcesRepository: ResourcesRepository) {}

  async findAll(query: QueryResourcesDto) {
    this.assertAllowedSort(query.sortBy);

    if (query.subjectId) {
      const subject = await this.resourcesRepository.findSubjectById(
        query.subjectId,
      );
      if (!subject) {
        throw new BadRequestException('INVALID_PARAMS');
      }
    }

    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const { items, total } = await this.resourcesRepository.findResources({
      resourceType: query.resourceType,
      subjectId: query.subjectId,
      stageTag: query.stageTag,
      isPublicLegal: query.isPublicLegal ?? true,
      sortBy: query.sortBy as
        | 'recommended'
        | 'updated_at'
        | 'created_at'
        | undefined,
      sortOrder: query.sortOrder,
      page,
      pageSize,
    });

    return {
      items: items.map((item) => this.toResourceListItem(item)),
      pagination: {
        page,
        pageSize,
        total,
        hasMore: page * pageSize < total,
      },
    };
  }

  async findOne(resourceId: string) {
    const resource =
      await this.resourcesRepository.findResourceById(resourceId);
    if (!resource) {
      throw new NotFoundException('NOT_FOUND');
    }

    return {
      ...this.toResourceListItem(resource),
      usageAdvice: resource.usageAdvice,
    };
  }

  private assertAllowedSort(sortBy?: string) {
    const allowedSorts = ['recommended', 'updated_at', 'created_at', undefined];
    if (!allowedSorts.includes(sortBy)) {
      throw new BadRequestException('INVALID_PARAMS');
    }
  }

  private toResourceListItem(resource: {
    resourceId: string;
    title: string;
    resourceType: string;
    subjectId: string | null;
    subjectName: string | null;
    stageTag: string;
    providerName: string | null;
    summary: string | null;
    sourceUrl: string;
    isPublicLegal: boolean;
  }) {
    return {
      resourceId: resource.resourceId,
      title: resource.title,
      resourceType: resource.resourceType,
      subjectId: resource.subjectId,
      subjectName: resource.subjectName,
      stageTag: resource.stageTag,
      providerName: resource.providerName,
      summary: resource.summary,
      sourceUrl: resource.sourceUrl,
      isPublicLegal: resource.isPublicLegal,
      isFavorited: false,
    };
  }
}
