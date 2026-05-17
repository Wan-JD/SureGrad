import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { QueryRemindersDto } from './dto/query-reminders.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';
import { RemindersService } from './reminders.service';

@Controller('reminders')
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  @Get()
  findAll(@Query() query: QueryRemindersDto) {
    return this.remindersService.findAll(query);
  }

  @Post()
  create(@Body() dto: CreateReminderDto) {
    return this.remindersService.create(dto);
  }

  @Patch(':reminderId')
  update(
    @Param('reminderId') reminderId: string,
    @Body() dto: UpdateReminderDto,
  ) {
    return this.remindersService.update(reminderId, dto);
  }

  @Delete(':reminderId')
  remove(@Param('reminderId') reminderId: string) {
    return this.remindersService.remove(reminderId);
  }
}
