import { Body, Controller, Get, Post } from '@nestjs/common';
import { GenerateStudyPlanDto } from './dto/generate-study-plan.dto';
import { PlansService } from './plans.service';

@Controller('study-plans')
export class StudyPlansController {
  constructor(private readonly plansService: PlansService) {}

  @Post('generate')
  generate(@Body() dto: GenerateStudyPlanDto) {
    return this.plansService.generateStudyPlan(dto);
  }

  @Get('current')
  getCurrent() {
    return this.plansService.getCurrentStudyPlan();
  }
}
