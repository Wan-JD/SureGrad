import { Module } from '@nestjs/common';
import { UserProfilesController } from './user-profiles.controller';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController, UserProfilesController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
