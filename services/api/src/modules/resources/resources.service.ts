import { Injectable } from '@nestjs/common';
import { buildSkeletonResponse } from '../../common/utils/build-skeleton-response';
import { QueryResourcesDto } from './dto/query-resources.dto';

@Injectable()
export class ResourcesService {
  findAll(query: QueryResourcesDto) {
    return buildSkeletonResponse({
      domain: 'resources',
      action: 'findAll',
      message:
        'Resource listing endpoint is scaffolded, but filtering and legal-resource curation are not implemented yet.',
      nextSteps: [
        'Load study_resources with subject and stage filters.',
        'Default to public and legal resources in read queries.',
        'Attach favorite-state decoration after auth is ready.',
      ],
      payload: query,
    });
  }

  findOne(resourceId: string) {
    return buildSkeletonResponse({
      domain: 'resources',
      action: 'findOne',
      message:
        'Resource detail endpoint is reserved, but persistence is not connected yet.',
      nextSteps: [
        'Load the resource by ID from study_resources.',
        'Return subject metadata and usage advice.',
      ],
      payload: { resourceId },
    });
  }
}
