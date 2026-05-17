import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CheckinsService } from './checkins.service';
import { CreateCheckinDto } from './dto/create-checkin.dto';
import { UpdateCheckinDto } from './dto/update-checkin.dto';

@Controller('study-checkins')
export class StudyCheckinsController {
  constructor(private readonly checkinsService: CheckinsService) {}

  @Get('today')
  getToday() {
    return this.checkinsService.getTodayCheckin();
  }

  @Post()
  create(@Body() dto: CreateCheckinDto) {
    return this.checkinsService.create(dto);
  }

  @Patch(':checkinId')
  update(@Param('checkinId') checkinId: string, @Body() dto: UpdateCheckinDto) {
    return this.checkinsService.update(checkinId, dto);
  }
}
