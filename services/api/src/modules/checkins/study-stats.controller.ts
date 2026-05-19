import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { MockAuthGuard } from '../../common/auth/mock-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/types/auth-user.type';
import { CheckinsService } from './checkins.service';
import { QueryStudyStatsDto } from './dto/query-study-stats.dto';

@UseGuards(MockAuthGuard)
@Controller('study-stats')
export class StudyStatsController {
  constructor(private readonly checkinsService: CheckinsService) {}

  @Get('overview')
  getOverview(
    @CurrentUser() user: AuthUser,
    @Query() query: QueryStudyStatsDto,
  ) {
    return this.checkinsService.getOverview(user.userId, query);
  }
}
