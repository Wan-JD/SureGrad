import { Injectable } from '@nestjs/common';
import { buildSkeletonResponse } from '../../common/utils/build-skeleton-response';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { QueryRemindersDto } from './dto/query-reminders.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';

@Injectable()
export class RemindersService {
  findAll(query: QueryRemindersDto) {
    return buildSkeletonResponse({
      domain: 'reminders',
      action: 'findAll',
      message:
        'Reminder-center listing is scaffolded, but system reminders and user reminders are not merged yet.',
      nextSteps: [
        'Load current user reminders with enabled-state filtering.',
        'Merge custom reminders with generated milestone reminders if required by product rules.',
      ],
      payload: query,
    });
  }

  create(dto: CreateReminderDto) {
    return buildSkeletonResponse({
      domain: 'reminders',
      action: 'create',
      message:
        'Reminder creation is scaffolded, but scheduling conflict detection and persistence are still pending.',
      nextSteps: [
        'Validate reminder type and timing.',
        'Persist custom reminders and register downstream scheduling jobs.',
      ],
      payload: dto,
    });
  }

  update(reminderId: string, dto: UpdateReminderDto) {
    return buildSkeletonResponse({
      domain: 'reminders',
      action: 'update',
      message:
        'Reminder update is scaffolded, but ownership checks and rescheduling are still pending.',
      nextSteps: [
        'Load reminder ownership for the current user.',
        'Apply edits and refresh scheduler state.',
      ],
      payload: {
        reminderId,
        ...dto,
      },
    });
  }

  remove(reminderId: string) {
    return buildSkeletonResponse({
      domain: 'reminders',
      action: 'remove',
      message:
        'Reminder deletion is scaffolded, but delete strategy and scheduler cleanup are still pending.',
      nextSteps: [
        'Resolve the reminder record for the current user.',
        'Delete or archive the reminder and clear scheduler bindings.',
      ],
      payload: { reminderId },
    });
  }
}
