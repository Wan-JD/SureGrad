import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { MockAuthGuard } from '../../common/auth/mock-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/types/auth-user.type';
import { GenerateStudyPlanDto } from './dto/generate-study-plan.dto';
import { PlansService } from './plans.service';

@Controller('study-plans')
@UseGuards(MockAuthGuard)
export class StudyPlansController {
  constructor(private readonly plansService: PlansService) {}

  @Post('generate')
  generate(@CurrentUser() user: AuthUser, @Body() dto: GenerateStudyPlanDto) {
    return this.plansService.generateStudyPlan(user.userId, dto);
  }

  @Get('current')
  getCurrent(@CurrentUser() user: AuthUser) {
    return this.plansService.getCurrentStudyPlan(user.userId);
  }
}
