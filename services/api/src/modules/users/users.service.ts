import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { maskPhone } from '../../common/utils/mask-phone.util';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { UsersRepository } from './repositories/users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async getMe(userId: string) {
    const snapshot = await this.usersRepository.getUserSnapshot(userId);
    if (!snapshot.user) {
      throw new NotFoundException('NOT_FOUND');
    }

    return {
      userId: snapshot.user.id,
      phoneMasked: maskPhone(snapshot.user.phone),
      nickname: snapshot.user.nickname,
      avatarUrl: snapshot.user.avatarUrl,
      profileCompleted: Boolean(snapshot.profile?.onboardingCompleted),
      hasActiveTarget: snapshot.hasActiveTarget,
      hasActivePlan: snapshot.hasActivePlan,
    };
  }

  async upsertProfile(userId: string, dto: UpdateUserProfileDto) {
    if (dto.dailyStudyHours <= 0) {
      throw new BadRequestException('INVALID_PARAMS');
    }

    const user = await this.usersRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundException('NOT_FOUND');
    }

    if (dto.nickname !== undefined) {
      user.nickname = dto.nickname;
    }

    if (dto.avatarUrl !== undefined) {
      user.avatarUrl = dto.avatarUrl;
    }

    await this.usersRepository.saveUser(user);

    let profile = await this.usersRepository.findProfileByUserId(userId);
    if (!profile) {
      profile = this.usersRepository.createProfile({
        userId,
      });
    }

    profile.examYear = dto.examYear;
    profile.identityType = dto.identityType;
    profile.undergraduateMajor = dto.undergraduateMajor;
    profile.intendedDiscipline = dto.intendedDiscipline;
    profile.dailyStudyHours = dto.dailyStudyHours;
    profile.examMathRequired = dto.examMathRequired;
    profile.onboardingCompleted = dto.onboardingCompleted ?? false;

    const savedProfile = await this.usersRepository.saveProfile(profile);

    return {
      userProfileId: savedProfile.id,
      examYear: savedProfile.examYear,
      identityType: savedProfile.identityType,
      dailyStudyHours: savedProfile.dailyStudyHours,
      onboardingCompleted: savedProfile.onboardingCompleted,
    };
  }
}
