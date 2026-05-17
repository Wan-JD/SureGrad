import { Body, Controller, Get, Put } from '@nestjs/common';
import { UpdateCurrentTargetDto } from './dto/update-current-target.dto';
import { PlansService } from './plans.service';

@Controller('user-targets')
export class UserTargetsController {
  constructor(private readonly plansService: PlansService) {}

  @Get('current')
  getCurrent() {
    return this.plansService.getCurrentTarget();
  }

  @Put('current')
  updateCurrent(@Body() dto: UpdateCurrentTargetDto) {
    return this.plansService.updateCurrentTarget(dto);
  }
}
