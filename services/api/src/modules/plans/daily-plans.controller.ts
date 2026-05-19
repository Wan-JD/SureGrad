import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MockAuthGuard } from '../../common/auth/mock-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/types/auth-user.type';
import { QueryDailyPlansDto } from './dto/query-daily-plans.dto';
import { UpdateDailyPlanDto } from './dto/update-daily-plan.dto';
import { PlansService } from './plans.service';

@Controller('daily-plans')
@UseGuards(MockAuthGuard)
export class DailyPlansController {
  constructor(private readonly plansService: PlansService) {}

  @Get()
  findOne(@CurrentUser() user: AuthUser, @Query() query: QueryDailyPlansDto) {
    return this.plansService.getDailyPlan(user.userId, query);
  }

  @Patch(':dailyPlanId')
  update(
    @CurrentUser() user: AuthUser,
    @Param('dailyPlanId') dailyPlanId: string,
    @Body() dto: UpdateDailyPlanDto,
  ) {
    return this.plansService.updateDailyPlan(user.userId, dailyPlanId, dto);
  }
}
