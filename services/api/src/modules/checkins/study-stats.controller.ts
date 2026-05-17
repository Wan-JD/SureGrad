import { Controller, Get, Query } from '@nestjs/common';
import { CheckinsService } from './checkins.service';
import { QueryStudyStatsDto } from './dto/query-study-stats.dto';

@Controller('study-stats')
export class StudyStatsController {
  constructor(private readonly checkinsService: CheckinsService) {}

  @Get('overview')
  getOverview(@Query() query: QueryStudyStatsDto) {
    return this.checkinsService.getOverview(query);
  }
}
