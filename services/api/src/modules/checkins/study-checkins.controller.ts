import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { MockAuthGuard } from '../../common/auth/mock-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/types/auth-user.type';
import { CheckinsService } from './checkins.service';
import { CreateCheckinDto } from './dto/create-checkin.dto';
import { UpdateCheckinDto } from './dto/update-checkin.dto';

@UseGuards(MockAuthGuard)
@Controller('study-checkins')
export class StudyCheckinsController {
  constructor(private readonly checkinsService: CheckinsService) {}

  @Get('today')
  getToday(@CurrentUser() user: AuthUser) {
    return this.checkinsService.getTodayCheckin(user.userId);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateCheckinDto) {
    return this.checkinsService.create(user.userId, dto);
  }

  @Patch(':checkinId')
  update(
    @CurrentUser() user: AuthUser,
    @Param('checkinId') checkinId: string,
    @Body() dto: UpdateCheckinDto,
  ) {
    return this.checkinsService.update(user.userId, checkinId, dto);
  }
}
