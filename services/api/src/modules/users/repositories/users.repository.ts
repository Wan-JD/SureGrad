import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudyPlanEntity } from '../../../database/entities/study-plan.entity';
import { UserProfileEntity } from '../../../database/entities/user-profile.entity';
import { UserTargetEntity } from '../../../database/entities/user-target.entity';
import { UserEntity } from '../../../database/entities/user.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    @InjectRepository(UserProfileEntity)
    private readonly userProfilesRepository: Repository<UserProfileEntity>,
    @InjectRepository(UserTargetEntity)
    private readonly userTargetsRepository: Repository<UserTargetEntity>,
    @InjectRepository(StudyPlanEntity)
    private readonly studyPlansRepository: Repository<StudyPlanEntity>,
  ) {}

  findUserById(userId: string) {
    return this.usersRepository.findOne({
      where: { id: userId },
    });
  }

  findUserByPhone(phone: string) {
    return this.usersRepository.findOne({
      where: { phone },
    });
  }

  createUser(phone: string, nickname: string) {
    return this.usersRepository.create({
      phone,
      nickname,
      avatarUrl: null,
      passwordHash: null,
      status: 'active',
      lastLoginAt: null,
    });
  }

  saveUser(user: UserEntity) {
    return this.usersRepository.save(user);
  }

  findProfileByUserId(userId: string) {
    return this.userProfilesRepository.findOne({
      where: { userId },
    });
  }

  createProfile(payload: Partial<UserProfileEntity>) {
    return this.userProfilesRepository.create(payload);
  }

  saveProfile(profile: UserProfileEntity) {
    return this.userProfilesRepository.save(profile);
  }

  hasActiveTarget(userId: string) {
    return this.userTargetsRepository.exists({
      where: {
        userId,
        targetStatus: 'active',
      },
    });
  }

  hasActivePlan(userId: string) {
    return this.studyPlansRepository.exists({
      where: {
        userId,
        status: 'active',
      },
    });
  }

  async getUserSnapshot(userId: string) {
    const [user, profile, hasActiveTarget, hasActivePlan] = await Promise.all([
      this.findUserById(userId),
      this.findProfileByUserId(userId),
      this.hasActiveTarget(userId),
      this.hasActivePlan(userId),
    ]);

    return {
      user,
      profile,
      hasActiveTarget,
      hasActivePlan,
    };
  }
}
