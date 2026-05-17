import { Injectable } from '@nestjs/common';
import { buildSkeletonResponse } from '../../common/utils/build-skeleton-response';
import { QueryProgramDetailDto } from './dto/query-program-detail.dto';

@Injectable()
export class ProgramsService {
  findOne(programId: string, query: QueryProgramDetailDto) {
    return buildSkeletonResponse({
      domain: 'programs',
      action: 'findOne',
      message:
        'Program detail contract is scaffolded, but admissions/statistics aggregation is still pending.',
      nextSteps: [
        'Join admissions, score lines, application stats, and interview stats by year.',
        'Attach exam subjects, reference books, and official source links.',
        'Decorate favorite and comparison state once auth is available.',
      ],
      payload: {
        programId,
        ...query,
      },
    });
  }
}
