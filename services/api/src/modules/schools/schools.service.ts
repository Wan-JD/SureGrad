import { Injectable } from '@nestjs/common';
import { buildSkeletonResponse } from '../../common/utils/build-skeleton-response';
import { QuerySchoolProgramsDto } from './dto/query-school-programs.dto';
import { QuerySchoolsDto } from './dto/query-schools.dto';

@Injectable()
export class SchoolsService {
  findAll(query: QuerySchoolsDto) {
    return buildSkeletonResponse({
      domain: 'schools',
      action: 'findAll',
      message:
        'School search skeleton is ready, but query composition and projections are still pending.',
      nextSteps: [
        'Join schools, departments, and programs for keyword search.',
        'Project score line and application ratio summaries by exam year.',
        'Add pagination and sort strategies from docs/api-spec.md.',
      ],
      payload: query,
    });
  }

  findOne(schoolId: string) {
    return buildSkeletonResponse({
      domain: 'schools',
      action: 'findOne',
      message:
        'School detail endpoint is reserved, but no repository or read model has been attached yet.',
      nextSteps: [
        'Load school base info and related departments/program counts.',
        'Attach latest data-source timestamps and summary metrics.',
        'Add favorite-state decoration after auth is in place.',
      ],
      payload: { schoolId },
    });
  }

  findPrograms(schoolId: string, query: QuerySchoolProgramsDto) {
    return buildSkeletonResponse({
      domain: 'schools',
      action: 'findPrograms',
      message:
        'School-program listing is scaffolded, but school-scoped program projections are still pending.',
      nextSteps: [
        'Load programs under the selected school with department summaries.',
        'Attach recent year score-line and ratio snapshots for list cards.',
        'Support the detail-page filters declared in docs/api-spec.md.',
      ],
      payload: {
        schoolId,
        ...query,
      },
    });
  }
}
