import { Body, Controller, Put } from '@nestjs/common';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { UsersService } from './users.service';

@Controller('user-profiles')
export class UserProfilesController {
  constructor(private readonly usersService: UsersService) {}

  @Put('me')
  upsertProfile(@Body() dto: UpdateUserProfileDto) {
    return this.usersService.upsertProfile(dto);
  }
}
