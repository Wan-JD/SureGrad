import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudyPlanEntity } from '../../database/entities/study-plan.entity';
import { UserProfileEntity } from '../../database/entities/user-profile.entity';
import { UserTargetEntity } from '../../database/entities/user-target.entity';
import { UserEntity } from '../../database/entities/user.entity';
import { UserProfilesController } from './user-profiles.controller';
import { UsersRepository } from './repositories/users.repository';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      UserProfileEntity,
      UserTargetEntity,
      StudyPlanEntity,
    ]),
  ],
  controllers: [UsersController, UserProfilesController],
  providers: [UsersRepository, UsersService],
  exports: [UsersRepository, UsersService],
})
export class UsersModule {}
