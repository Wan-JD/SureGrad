import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { MockAuthGuard } from '../../common/auth/mock-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/types/auth-user.type';
import { UpdateCurrentTargetDto } from './dto/update-current-target.dto';
import { PlansService } from './plans.service';

@Controller('user-targets')
@UseGuards(MockAuthGuard)
export class UserTargetsController {
  constructor(private readonly plansService: PlansService) {}

  @Get('current')
  getCurrent(@CurrentUser() user: AuthUser) {
    return this.plansService.getCurrentTarget(user.userId);
  }

  @Put('current')
  updateCurrent(
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateCurrentTargetDto,
  ) {
    return this.plansService.updateCurrentTarget(user.userId, dto);
  }
}
