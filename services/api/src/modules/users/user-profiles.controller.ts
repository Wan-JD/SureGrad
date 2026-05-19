import { Body, Controller, Put, UseGuards } from '@nestjs/common';
import { MockAuthGuard } from '../../common/auth/mock-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/types/auth-user.type';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { UsersService } from './users.service';

@Controller('user-profiles')
@UseGuards(MockAuthGuard)
export class UserProfilesController {
  constructor(private readonly usersService: UsersService) {}

  @Put('me')
  upsertProfile(
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateUserProfileDto,
  ) {
    return this.usersService.upsertProfile(user.userId, dto);
  }
}
