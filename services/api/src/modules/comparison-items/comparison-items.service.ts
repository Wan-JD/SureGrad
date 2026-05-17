import { Injectable } from '@nestjs/common';
import { buildSkeletonResponse } from '../../common/utils/build-skeleton-response';
import { CreateComparisonItemDto } from './dto/create-comparison-item.dto';
import { QueryComparisonResultDto } from './dto/query-comparison-result.dto';

@Injectable()
export class ComparisonItemsService {
  create(dto: CreateComparisonItemDto) {
    return buildSkeletonResponse({
      domain: 'comparisonItems',
      action: 'create',
      message:
        'Comparison-pool insertion is scaffolded, but duplicate and max-count enforcement are still pending.',
      nextSteps: [
        'Validate the target program exists.',
        'Enforce the per-user comparison pool size limit declared in docs/api-spec.md.',
      ],
      payload: dto,
    });
  }

  remove(targetType: string, targetId: string) {
    return buildSkeletonResponse({
      domain: 'comparisonItems',
      action: 'remove',
      message:
        'Comparison-item removal is scaffolded, but ownership checks are still pending.',
      nextSteps: [
        'Resolve the comparison item for the current user.',
        'Remove it while preserving insertion order for the remaining items.',
      ],
      payload: {
        targetType,
        targetId,
      },
    });
  }

  getResult(query: QueryComparisonResultDto) {
    return buildSkeletonResponse({
      domain: 'comparisonItems',
      action: 'getResult',
      message:
        'Comparison result aggregation is scaffolded, but year-scoped metrics and dimensions are still pending.',
      nextSteps: [
        'Load the current pool items in insertion order.',
        'Aggregate score lines, ratios, and admissions metrics by exam year.',
      ],
      payload: query,
    });
  }
}
