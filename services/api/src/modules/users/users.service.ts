import { Injectable } from '@nestjs/common';
import { buildSkeletonResponse } from '../../common/utils/build-skeleton-response';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';

@Injectable()
export class UsersService {
  getMe() {
    return buildSkeletonResponse({
      domain: 'users',
      action: 'getMe',
      message:
        'Current-user lookup is scaffolded, but auth guards and persistence are not connected yet.',
      nextSteps: [
        'Resolve current user from JWT auth guard.',
        'Join profile, active target, and active plan aggregates.',
        'Mask sensitive account fields before returning them.',
      ],
    });
  }

  upsertProfile(dto: UpdateUserProfileDto) {
    return buildSkeletonResponse({
      domain: 'users',
      action: 'upsertProfile',
      message:
        'Profile creation/update contract is ready, but repository logic is still pending.',
      nextSteps: [
        'Map DTO fields into users and user_profiles tables.',
        'Handle first-time onboarding completion state.',
        'Add ownership checks once auth is enabled.',
      ],
      payload: dto,
    });
  }
}
