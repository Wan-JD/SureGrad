import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { QueryWeeklyPlansDto } from './dto/query-weekly-plans.dto';
import { UpdateWeeklyPlanDto } from './dto/update-weekly-plan.dto';
import { PlansService } from './plans.service';

@Controller('weekly-plans')
export class WeeklyPlansController {
  constructor(private readonly plansService: PlansService) {}

  @Get()
  findAll(@Query() query: QueryWeeklyPlansDto) {
    return this.plansService.getWeeklyPlans(query);
  }

  @Patch(':weeklyPlanId')
  update(
    @Param('weeklyPlanId') weeklyPlanId: string,
    @Body() dto: UpdateWeeklyPlanDto,
  ) {
    return this.plansService.updateWeeklyPlan(weeklyPlanId, dto);
  }
}
