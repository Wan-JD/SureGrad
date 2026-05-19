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
import { QueryWeeklyPlansDto } from './dto/query-weekly-plans.dto';
import { UpdateWeeklyPlanDto } from './dto/update-weekly-plan.dto';
import { PlansService } from './plans.service';

@Controller('weekly-plans')
@UseGuards(MockAuthGuard)
export class WeeklyPlansController {
  constructor(private readonly plansService: PlansService) {}

  @Get()
  findAll(@CurrentUser() user: AuthUser, @Query() query: QueryWeeklyPlansDto) {
    return this.plansService.getWeeklyPlans(user.userId, query);
  }

  @Patch(':weeklyPlanId')
  update(
    @CurrentUser() user: AuthUser,
    @Param('weeklyPlanId') weeklyPlanId: string,
    @Body() dto: UpdateWeeklyPlanDto,
  ) {
    return this.plansService.updateWeeklyPlan(user.userId, weeklyPlanId, dto);
  }
}
