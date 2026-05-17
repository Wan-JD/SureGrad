import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { QueryDailyPlansDto } from './dto/query-daily-plans.dto';
import { UpdateDailyPlanDto } from './dto/update-daily-plan.dto';
import { PlansService } from './plans.service';

@Controller('daily-plans')
export class DailyPlansController {
  constructor(private readonly plansService: PlansService) {}

  @Get()
  findOne(@Query() query: QueryDailyPlansDto) {
    return this.plansService.getDailyPlan(query);
  }

  @Patch(':dailyPlanId')
  update(
    @Param('dailyPlanId') dailyPlanId: string,
    @Body() dto: UpdateDailyPlanDto,
  ) {
    return this.plansService.updateDailyPlan(dailyPlanId, dto);
  }
}
