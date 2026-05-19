import { Module } from '@nestjs/common';
import { RemindersController } from './reminders.controller';
import { RemindersRepository } from './repositories/reminders.repository';
import { RemindersService } from './reminders.service';

@Module({
  controllers: [RemindersController],
  providers: [RemindersRepository, RemindersService],
})
export class RemindersModule {}
