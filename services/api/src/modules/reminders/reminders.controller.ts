import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MockAuthGuard } from '../../common/auth/mock-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/types/auth-user.type';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { QueryRemindersDto } from './dto/query-reminders.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';
import { RemindersService } from './reminders.service';

@UseGuards(MockAuthGuard)
@Controller('reminders')
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  @Get()
  findAll(@CurrentUser() user: AuthUser, @Query() query: QueryRemindersDto) {
    return this.remindersService.findAll(user.userId, query);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateReminderDto) {
    return this.remindersService.create(user.userId, dto);
  }

  @Patch(':reminderId')
  update(
    @CurrentUser() user: AuthUser,
    @Param('reminderId') reminderId: string,
    @Body() dto: UpdateReminderDto,
  ) {
    return this.remindersService.update(user.userId, reminderId, dto);
  }

  @Delete(':reminderId')
  remove(
    @CurrentUser() user: AuthUser,
    @Param('reminderId') reminderId: string,
  ) {
    return this.remindersService.remove(user.userId, reminderId);
  }
}
